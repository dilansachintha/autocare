import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI, appointmentAPI, mechanicAPI } from '../../services/api';
import { Appointment, User } from '../../types';
import { format } from 'date-fns';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Search, UserCheck, RefreshCw } from 'lucide-react';

const statusBadge = (s: string) => <span className={`badge-${s}`}>{s.replace('_', ' ')}</span>;

export default function AdminAppointments() {
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-appointments', status, page],
    queryFn: () => appointmentAPI.getAll({ status: status || undefined, page }).then(r => r.data.data),
  });

  const { data: mechanics } = useQuery({
    queryKey: ['mechanics'],
    queryFn: () => mechanicAPI.getAll().then(r => r.data.data as User[]),
  });

  const assignMutation = useMutation({
    mutationFn: ({ id, mechanicId }: { id: string; mechanicId: string }) =>
      appointmentAPI.assignMechanic(id, mechanicId),
    onSuccess: () => { toast.success('Mechanic assigned!'); qc.invalidateQueries({ queryKey: ['admin-appointments'] }); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed'),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      appointmentAPI.updateStatus(id, { status }),
    onSuccess: () => { toast.success('Status updated'); qc.invalidateQueries({ queryKey: ['admin-appointments'] }); },
  });

  const appointments: Appointment[] = data?.appointments || [];

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-display font-bold text-slate-800">Appointments</h1>
      <div className="card">
        <div className="flex flex-wrap gap-3 mb-4">
          {['','pending','confirmed','in_progress','completed','cancelled'].map(s => (
            <button key={s} onClick={() => { setStatus(s); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${status === s ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              {s === '' ? 'All' : s.replace('_',' ')}
            </button>
          ))}
        </div>
        {isLoading ? <div className="h-64 bg-slate-100 animate-pulse rounded-lg" /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-slate-100 text-left">
                {['Customer','Vehicle','Date & Time','Status','Mechanic','Amount','Actions'].map(h => (
                  <th key={h} className="pb-3 font-medium text-slate-500 pr-4">{h}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y divide-slate-50">
                {appointments.map(apt => (
                  <tr key={apt._id} className="hover:bg-slate-50">
                    <td className="py-3 pr-4">
                      <p className="font-medium text-slate-800">{apt.customer?.name}</p>
                      <p className="text-xs text-slate-400">{apt.customer?.email}</p>
                    </td>
                    <td className="py-3 pr-4 text-slate-600">{apt.vehicle?.make} {apt.vehicle?.model}<br /><span className="text-xs text-slate-400">{apt.vehicle?.licensePlate}</span></td>
                    <td className="py-3 pr-4 text-slate-600">{format(new Date(apt.scheduledDate), 'dd MMM yyyy')}<br /><span className="text-xs">{apt.scheduledTime}</span></td>
                    <td className="py-3 pr-4">{statusBadge(apt.status)}</td>
                    <td className="py-3 pr-4">
                      {apt.status === 'pending' ? (
                        <select className="text-xs border border-slate-200 rounded px-2 py-1"
                          defaultValue=""
                          onChange={e => e.target.value && assignMutation.mutate({ id: apt._id, mechanicId: e.target.value })}>
                          <option value="">Assign...</option>
                          {mechanics?.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
                        </select>
                      ) : <span className="text-slate-600 text-xs">{apt.mechanic?.name || '–'}</span>}
                    </td>
                    <td className="py-3 pr-4 text-slate-700">LKR {apt.totalEstimatedCost?.toLocaleString()}</td>
                    <td className="py-3">
                      {apt.status === 'confirmed' && (
                        <button onClick={() => statusMutation.mutate({ id: apt._id, status: 'in_progress' })}
                          className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded hover:bg-purple-200 transition-colors">
                          Start
                        </button>
                      )}
                      {apt.status === 'in_progress' && (
                        <button onClick={() => statusMutation.mutate({ id: apt._id, status: 'completed' })}
                          className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 transition-colors">
                          Complete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {!appointments.length && <tr><td colSpan={7} className="py-8 text-center text-slate-400">No appointments found</td></tr>}
              </tbody>
            </table>
          </div>
        )}
        {data && data.pages > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            {Array.from({ length: data.pages }, (_, i) => (
              <button key={i} onClick={() => setPage(i + 1)}
                className={`w-8 h-8 rounded-lg text-sm ${page === i + 1 ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
