import { useQuery } from '@tanstack/react-query';
import { appointmentAPI } from '../../services/api';
import { Appointment } from '../../types';
import { Calendar, Clock, Car, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const statusBadge = (s: string) => <span className={`badge-${s}`}>{s.replace('_',' ')}</span>;
const priorityColor = (p: string) => p === 'emergency' ? 'text-red-500' : p === 'urgent' ? 'text-yellow-500' : 'text-green-500';

export default function CustomerDashboard() {
  const { user } = useAuthStore();
  const { data } = useQuery({
    queryKey: ['my-appointments'],
    queryFn: () => appointmentAPI.getMy({ limit: 5 }).then(r => r.data.data),
  });

  const appointments: Appointment[] = data?.appointments || [];
  const pending = appointments.filter(a => a.status === 'pending').length;
  const inProgress = appointments.filter(a => a.status === 'in_progress').length;
  const completed = appointments.filter(a => a.status === 'completed').length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-bold text-slate-800">Welcome back, {user?.name?.split(' ')[0]}!</h1>
        <p className="text-slate-500 text-sm mt-1">Here's your vehicle service overview.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: 'Pending', value: pending, icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-50' },
          { label: 'In Progress', value: inProgress, icon: AlertCircle, color: 'text-blue-500', bg: 'bg-blue-50' },
          { label: 'Completed', value: completed, icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50' },
        ].map(s => (
          <div key={s.label} className="card p-4">
            <div className={`w-10 h-10 ${s.bg} rounded-lg flex items-center justify-center mb-3`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <p className="text-2xl font-display font-bold text-slate-800">{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Link to="/customer/book" className="card border-2 border-dashed border-orange-200 hover:border-orange-400 hover:bg-orange-50 transition-all group flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center group-hover:bg-orange-200 transition-colors">
            <Calendar className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <p className="font-semibold text-slate-800">Book New Appointment</p>
            <p className="text-sm text-slate-500">Schedule a vehicle service</p>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-400 ml-auto group-hover:text-orange-500 transition-colors" />
        </Link>
        <Link to="/customer/emergency" className="card border-2 border-dashed border-red-200 hover:border-red-400 hover:bg-red-50 transition-all group flex items-center gap-4">
          <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center group-hover:bg-red-200 transition-colors">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <p className="font-semibold text-slate-800">Emergency Request</p>
            <p className="text-sm text-slate-500">Request immediate assistance</p>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-400 ml-auto group-hover:text-red-500 transition-colors" />
        </Link>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-display font-semibold text-slate-800">Recent Appointments</h2>
          <Link to="/customer/appointments" className="text-sm text-orange-500 hover:text-orange-600 font-medium flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        {appointments.length === 0 ? (
          <div className="text-center py-10">
            <Car className="w-10 h-10 text-slate-200 mx-auto mb-2" />
            <p className="text-slate-400 text-sm">No appointments yet</p>
            <Link to="/customer/book" className="btn-primary mt-3 inline-flex text-sm">Book Now</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {appointments.map(apt => (
              <div key={apt._id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-slate-800">{apt.services?.[0]?.serviceType || 'Service'}</p>
                  <p className="text-xs text-slate-500">{apt.vehicle?.make} {apt.vehicle?.model} • {format(new Date(apt.scheduledDate), 'dd MMM yyyy')} {apt.scheduledTime}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {statusBadge(apt.status)}
                  <span className={`text-xs font-medium ${priorityColor(apt.priority)}`}>{apt.priority}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
