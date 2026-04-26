import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentAPI, paymentAPI } from '../../services/api';
import { Appointment } from '../../types';
import { format } from 'date-fns';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Calendar, ChevronDown, ChevronUp, XCircle, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';

const statusBadge = (s: string) => <span className={`badge-${s}`}>{s.replace('_',' ')}</span>;
const priorityBadgeClass = (priority: string) => {
  if (priority === 'emergency') return 'bg-red-100 text-red-700';
  if (priority === 'urgent') return 'bg-yellow-100 text-yellow-700';
  return 'bg-slate-100 text-slate-600';
};

export default function CustomerAppointments() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const handledPaymentRef = useRef(false);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['my-appointments-all'],
    queryFn: () => appointmentAPI.getMy({ limit: 50 }).then(r => r.data.data),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => appointmentAPI.cancel(id),
    onSuccess: () => { toast.success('Appointment cancelled'); qc.invalidateQueries({ queryKey: ['my-appointments-all'] }); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Cannot cancel'),
  });

  const redirectCheckoutMutation = useMutation({
    mutationFn: async (id: string) => {
      const baseUrl = `${globalThis.location.origin}/customer/appointments`;
      const successUrl = `${baseUrl}?payment=success&appointmentId=${encodeURIComponent(id)}`;
      const cancelUrl = `${baseUrl}?payment=cancelled`;
      return paymentAPI.createCheckoutSession(id, successUrl, cancelUrl);
    },
    onSuccess: (response) => {
      const checkoutUrl = response.data?.data?.checkoutUrl;
      if (!checkoutUrl) {
        toast.error('Unable to open Stripe checkout');
        return;
      }
      globalThis.location.href = checkoutUrl;
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Could not start payment'),
  });

  const appointments: Appointment[] = data?.appointments || [];

  const clearPaymentQueryParams = () => {
    const url = new URL(globalThis.location.href);
    ['payment', 'appointmentId', 'session_id'].forEach((key) => url.searchParams.delete(key));
    globalThis.history.replaceState({}, '', url.pathname + url.search);
  };

  useEffect(() => {
    const query = new URLSearchParams(globalThis.location.search);
    const paymentState = query.get('payment');
    const appointmentId = query.get('appointmentId');
    const sessionId = query.get('session_id');

    if (paymentState === 'cancelled') {
      toast('Payment cancelled');
      clearPaymentQueryParams();
      return;
    }

    if (paymentState === 'success' && appointmentId && sessionId && !handledPaymentRef.current) {
      handledPaymentRef.current = true;
      toast.success('Payment successful. Syncing your receipt...');
      qc.invalidateQueries({ queryKey: ['my-appointments-all'] });
      qc.invalidateQueries({ queryKey: ['payment-history'] });
      clearPaymentQueryParams();
    }
  }, [qc]);

  if (isLoading) return <div className="animate-pulse space-y-4">{[1,2,3].map(i => <div key={i} className="h-24 bg-slate-200 rounded-xl" />)}</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-slate-800">My Appointments</h1>
        <Link to="/customer/book" className="btn-primary flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4" /> Book New
        </Link>
      </div>

      {appointments.length === 0 ? (
        <div className="card text-center py-16">
          <Calendar className="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <p className="text-slate-400 mb-4">No appointments found</p>
          <Link to="/customer/book" className="btn-primary">Book Your First Appointment</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map(apt => (
            <div key={apt._id} className="card p-0 overflow-hidden">
              <button
                type="button"
                className="w-full text-left p-4 cursor-pointer"
                onClick={() => setExpanded(expanded === apt._id ? null : apt._id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <p className="font-semibold text-slate-800">{apt.services?.map(s => s.serviceType).join(', ')}</p>
                      {statusBadge(apt.status)}
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${priorityBadgeClass(apt.priority)}`}>
                        {apt.priority}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500">
                      {apt.vehicle?.make} {apt.vehicle?.model} ({apt.vehicle?.licensePlate}) •{' '}
                      {format(new Date(apt.scheduledDate), 'dd MMM yyyy')} at {apt.scheduledTime}
                    </p>
                    <p className="text-sm font-medium text-slate-700 mt-1">LKR {apt.totalEstimatedCost?.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {apt.status === 'completed' && apt.paymentStatus !== 'paid' && (
                      <button
                        onClick={e => { e.stopPropagation(); redirectCheckoutMutation.mutate(apt._id); }}
                        disabled={redirectCheckoutMutation.isPending}
                        className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                      >
                        <CreditCard className="w-4 h-4" />
                        {redirectCheckoutMutation.isPending ? 'Redirecting…' : 'Pay with Stripe'}
                      </button>
                    )}
                    {['pending','confirmed'].includes(apt.status) && (
                      <button onClick={e => { e.stopPropagation(); cancelMutation.mutate(apt._id); }}
                        className="text-red-400 hover:text-red-600 transition-colors">
                        <XCircle className="w-5 h-5" />
                      </button>
                    )}
                    {expanded === apt._id ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                  </div>
                </div>
              </button>

              {expanded === apt._id && (
                <div className="border-t border-slate-100 p-4 bg-slate-50 space-y-4">
                  {/* Services */}
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Services</p>
                    <div className="space-y-1">
                      {apt.services?.map((s) => (
                        <div key={`${apt._id}-${s.serviceType}`} className="flex justify-between text-sm">
                          <span className="text-slate-700">{s.serviceType}</span>
                          <div className="flex items-center gap-2">
                            <span className={`badge-${s.status}`}>{s.status}</span>
                            <span className="text-slate-600">LKR {s.estimatedCost?.toLocaleString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Mechanic */}
                  {apt.mechanic && (
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Assigned Mechanic</p>
                      <p className="text-sm text-slate-700">{apt.mechanic.name} • {apt.mechanic.phone}</p>
                    </div>
                  )}

                  {/* Notes */}
                  {apt.notes && (
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Your Notes</p>
                      <p className="text-sm text-slate-600">{apt.notes}</p>
                    </div>
                  )}

                  {/* Progress Updates */}
                  {apt.progressUpdates?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Progress Updates</p>
                      <div className="space-y-2">
                        {apt.progressUpdates.map((u, i) => (
                          <div key={`${u.timestamp}-${u.message}`} className="flex gap-3 text-sm">
                            <div className="flex flex-col items-center">
                              <div className="w-2 h-2 rounded-full bg-orange-400 mt-1.5" />
                              {i < apt.progressUpdates.length - 1 && <div className="w-px flex-1 bg-slate-200 mt-1" />}
                            </div>
                            <div className="pb-2">
                              <p className="text-slate-700">{u.message}</p>
                              <p className="text-xs text-slate-400">{format(new Date(u.timestamp), 'dd MMM yyyy HH:mm')}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Payment */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                    <div>
                      <span className="text-sm text-slate-600">Payment</span>
                      <p className={`text-sm font-medium ${apt.paymentStatus === 'paid' ? 'text-green-600' : 'text-slate-700'}`}>
                        {apt.paymentStatus === 'paid' ? '✓ Paid' : `LKR ${(apt.totalActualCost || apt.totalEstimatedCost)?.toLocaleString()} (pending)`}
                      </p>
                    </div>
                    {apt.status === 'completed' && apt.paymentStatus !== 'paid' && (
                      <button
                        onClick={e => { e.stopPropagation(); redirectCheckoutMutation.mutate(apt._id); }}
                        disabled={redirectCheckoutMutation.isPending}
                        className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                      >
                        <CreditCard className="w-4 h-4" />
                        {redirectCheckoutMutation.isPending ? 'Redirecting…' : 'Pay with Stripe'}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
