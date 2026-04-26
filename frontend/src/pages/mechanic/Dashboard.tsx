import { useQuery } from '@tanstack/react-query';
import { appointmentAPI, mechanicAPI } from '../../services/api';
import { Appointment } from '../../types';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { Wrench, Clock, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const statusBadge = (s: string) => <span className={`badge-${s}`}>{s.replace('_', ' ')}</span>;

export default function MechanicDashboard() {
  const { user } = useAuthStore();

  const { data: stats } = useQuery({
    queryKey: ['mechanic-stats'],
    queryFn: () => mechanicAPI.getStats().then(r => r.data.data),
  });

  const { data } = useQuery({
    queryKey: ['mechanic-jobs', 'today'],
    queryFn: () => appointmentAPI.getMechanicJobs({ limit: 5 }).then(r => r.data.data),
  });

  const jobs: Appointment[] = data?.appointments || [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-bold text-slate-800">Welcome, {user?.name?.split(' ')[0]}!</h1>
        <p className="text-slate-500 text-sm mt-1">Here's your work overview for today.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Jobs', value: stats?.total ?? 0, icon: Wrench, color: 'text-blue-500', bg: 'bg-blue-50' },
          { label: 'Completed', value: stats?.completed ?? 0, icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50' },
          { label: 'In Progress', value: stats?.inProgress ?? 0, icon: AlertCircle, color: 'text-orange-500', bg: 'bg-orange-50' },
          { label: 'Pending', value: stats?.pending ?? 0, icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-50' },
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

      {/* Recent Jobs */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-display font-semibold text-slate-800">My Jobs</h2>
          <Link to="/mechanic/jobs" className="text-sm text-blue-500 hover:text-blue-600 font-medium flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        {jobs.length === 0 ? (
          <div className="text-center py-10">
            <Wrench className="w-10 h-10 text-slate-200 mx-auto mb-2" />
            <p className="text-slate-400 text-sm">No jobs assigned yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.map(job => (
              <Link key={job._id} to={`/mechanic/jobs/${job._id}`}
                className="flex items-center justify-between p-3 bg-slate-50 hover:bg-blue-50 rounded-xl transition-colors group">
                <div>
                  <p className="font-medium text-slate-800 text-sm">{job.services?.[0]?.serviceType}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {job.customer?.name} • {job.vehicle?.make} {job.vehicle?.model} ({job.vehicle?.licensePlate})
                  </p>
                  <p className="text-xs text-slate-400">{format(new Date(job.scheduledDate), 'dd MMM')} at {job.scheduledTime}</p>
                </div>
                <div className="flex items-center gap-2">
                  {statusBadge(job.status)}
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
