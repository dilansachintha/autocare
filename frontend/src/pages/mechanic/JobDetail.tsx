import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentAPI } from '../../services/api';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { ArrowLeft, User, Car, Clock, ChevronRight, CheckCircle, PlayCircle } from 'lucide-react';

const statusBadge = (s: string) => <span className={`badge-${s}`}>{s.replace('_', ' ')}</span>;

export default function MechanicJobDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [updateMsg, setUpdateMsg] = useState('');
  const [notes, setNotes] = useState('');

  const { data: apt, isLoading } = useQuery({
    queryKey: ['appointment', id],
    queryFn: () => appointmentAPI.getById(id!).then(r => r.data.data),
  });

  const statusMutation = useMutation({
    mutationFn: (status: string) => appointmentAPI.updateStatus(id!, { status, message: updateMsg || `Status updated to ${status}` }),
    onSuccess: () => { toast.success('Status updated'); qc.invalidateQueries({ queryKey: ['appointment', id] }); setUpdateMsg(''); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed'),
  });

  if (isLoading) return <div className="animate-pulse space-y-4"><div className="h-8 w-48 bg-slate-200 rounded" /><div className="h-64 bg-slate-200 rounded-xl" /></div>;
  if (!apt) return <div className="card text-center py-16"><p className="text-slate-400">Job not found</p></div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <button onClick={() => navigate('/mechanic/jobs')} className="flex items-center gap-2 text-slate-500 hover:text-slate-700 text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to Jobs
      </button>

      {/* Header */}
      <div className="card">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-display font-bold text-slate-800">{apt.services?.map((s: any) => s.serviceType).join(', ')}</h1>
            <p className="text-slate-500 text-sm mt-1">{format(new Date(apt.scheduledDate), 'dd MMM yyyy')} at {apt.scheduledTime}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            {statusBadge(apt.status)}
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${apt.priority === 'emergency' ? 'bg-red-100 text-red-700' : apt.priority === 'urgent' ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-500'}`}>
              {apt.priority}
            </span>
          </div>
        </div>
      </div>

      {/* Customer & Vehicle */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="card">
          <div className="flex items-center gap-2 mb-3">
            <User className="w-4 h-4 text-blue-500" />
            <h2 className="font-display font-semibold text-slate-800 text-sm">Customer</h2>
          </div>
          <p className="font-medium text-slate-800">{apt.customer?.name}</p>
          <p className="text-sm text-slate-500">{apt.customer?.email}</p>
          <p className="text-sm text-slate-500">{apt.customer?.phone}</p>
        </div>
        <div className="card">
          <div className="flex items-center gap-2 mb-3">
            <Car className="w-4 h-4 text-blue-500" />
            <h2 className="font-display font-semibold text-slate-800 text-sm">Vehicle</h2>
          </div>
          <p className="font-medium text-slate-800">{apt.vehicle?.year} {apt.vehicle?.make} {apt.vehicle?.model}</p>
          <p className="text-sm text-slate-500">{apt.vehicle?.licensePlate} • {apt.vehicle?.color}</p>
          <p className="text-sm text-slate-500 capitalize">{apt.vehicle?.fuelType} • {apt.vehicle?.transmission}</p>
          {apt.vehicle?.mileage && <p className="text-sm text-slate-400">{apt.vehicle.mileage.toLocaleString()} km</p>}
        </div>
      </div>

      {/* Services */}
      <div className="card">
        <h2 className="font-display font-semibold text-slate-800 mb-3">Services</h2>
        <div className="space-y-2">
          {apt.services?.map((s: any, i: number) => (
            <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div>
                <p className="font-medium text-slate-800 text-sm">{s.serviceType}</p>
                {s.description && <p className="text-xs text-slate-400">{s.description}</p>}
              </div>
              <div className="flex items-center gap-3">
                {statusBadge(s.status)}
                <span className="text-sm font-medium text-slate-700">LKR {s.estimatedCost?.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
        {apt.notes && (
          <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-100">
            <p className="text-xs font-semibold text-yellow-700 uppercase mb-1">Customer Notes</p>
            <p className="text-sm text-yellow-800">{apt.notes}</p>
          </div>
        )}
        <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-100">
          <span className="text-sm font-medium text-slate-700">Total</span>
          <span className="font-bold text-slate-800">LKR {apt.totalEstimatedCost?.toLocaleString()}</span>
        </div>
      </div>

      {/* Actions */}
      {['confirmed', 'in_progress'].includes(apt.status) && (
        <div className="card">
          <h2 className="font-display font-semibold text-slate-800 mb-3">Update Status</h2>
          <textarea className="input mb-3" rows={2} placeholder="Add a progress note..." value={updateMsg} onChange={e => setUpdateMsg(e.target.value)} />
          <div className="flex gap-3">
            {apt.status === 'confirmed' && (
              <button onClick={() => statusMutation.mutate('in_progress')} disabled={statusMutation.isPending}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-colors">
                <PlayCircle className="w-4 h-4" /> Start Job
              </button>
            )}
            {apt.status === 'in_progress' && (
              <button onClick={() => statusMutation.mutate('completed')} disabled={statusMutation.isPending}
                className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-lg transition-colors">
                <CheckCircle className="w-4 h-4" /> Mark Complete
              </button>
            )}
          </div>
        </div>
      )}

      {/* Progress Timeline */}
      {apt.progressUpdates?.length > 0 && (
        <div className="card">
          <h2 className="font-display font-semibold text-slate-800 mb-3">Progress History</h2>
          <div className="space-y-3">
            {apt.progressUpdates.map((u: any, i: number) => (
              <div key={i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500 mt-1 flex-shrink-0" />
                  {i < apt.progressUpdates.length - 1 && <div className="w-px flex-1 bg-slate-200 mt-1" />}
                </div>
                <div className="pb-3">
                  <p className="text-sm text-slate-700">{u.message}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{format(new Date(u.timestamp), 'dd MMM yyyy HH:mm')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
