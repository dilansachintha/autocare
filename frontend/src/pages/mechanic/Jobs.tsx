import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentAPI } from '../../services/api';
import { Appointment } from '../../types';
import { format } from 'date-fns';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Wrench, ArrowRight, Filter } from 'lucide-react';

const statusBadge = (s: string) => <span className={`badge-${s}`}>{s.replace('_', ' ')}</span>;

export default function MechanicJobs() {
  const [status, setStatus] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['mechanic-jobs', status],
    queryFn: () => appointmentAPI.getMechanicJobs({ status: status || undefined, limit: 50 }).then(r => r.data.data),
  });

  const jobs: Appointment[] = data?.appointments || [];

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-display font-bold text-slate-800">My Jobs</h1>

      <div className="flex flex-wrap gap-2">
        {[
          { value: '', label: 'All' },
          { value: 'confirmed', label: 'Confirmed' },
          { value: 'in_progress', label: 'In Progress' },
          { value: 'completed', label: 'Completed' },
        ].map(f => (
          <button key={f.value} onClick={() => setStatus(f.value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${status === f.value ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-3">{[1,2,3].map(i => <div key={i} className="h-24 bg-slate-200 rounded-xl" />)}</div>
      ) : jobs.length === 0 ? (
        <div className="card text-center py-16">
          <Wrench className="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <p className="text-slate-400">No jobs found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map(job => (
            <Link key={job._id} to={`/mechanic/jobs/${job._id}`}
              className="card flex items-center justify-between hover:border-blue-200 hover:shadow-md transition-all group">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <p className="font-semibold text-slate-800">{job.services?.map(s => s.serviceType).join(', ')}</p>
                  {statusBadge(job.status)}
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${job.priority === 'urgent' ? 'bg-yellow-100 text-yellow-700' : job.priority === 'emergency' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-500'}`}>
                    {job.priority}
                  </span>
                </div>
                <p className="text-sm text-slate-600">{job.customer?.name} • {job.vehicle?.make} {job.vehicle?.model}</p>
                <p className="text-xs text-slate-400 mt-0.5">{job.vehicle?.licensePlate} • {format(new Date(job.scheduledDate), 'dd MMM yyyy')} at {job.scheduledTime}</p>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-colors ml-4 flex-shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
