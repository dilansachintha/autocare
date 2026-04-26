import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { emergencyAPI, mechanicAPI } from '../../services/api';
import { Emergency, User } from '../../types';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { AlertTriangle, MapPin, Phone, CheckCircle } from 'lucide-react';

export default function AdminEmergencies() {
  const qc = useQueryClient();
  const { data: emergencies, isLoading } = useQuery({
    queryKey: ['emergencies'],
    queryFn: () => emergencyAPI.getAll().then(r => r.data.data as Emergency[]),
    refetchInterval: 30000,
  });
  const { data: mechanics } = useQuery({
    queryKey: ['mechanics'],
    queryFn: () => mechanicAPI.getAll().then(r => r.data.data as User[]),
  });
  const assignMutation = useMutation({
    mutationFn: ({ id, mechanicId }: { id: string; mechanicId: string }) => emergencyAPI.assignMechanic(id, mechanicId),
    onSuccess: () => { toast.success('Mechanic assigned!'); qc.invalidateQueries({ queryKey: ['emergencies'] }); },
  });
  const resolveMutation = useMutation({
    mutationFn: (id: string) => emergencyAPI.resolve(id),
    onSuccess: () => { toast.success('Emergency resolved'); qc.invalidateQueries({ queryKey: ['emergencies'] }); },
  });

  const statusColor = (s: string) => ({ open: 'bg-red-100 text-red-700', assigned: 'bg-yellow-100 text-yellow-700', resolved: 'bg-green-100 text-green-700' }[s] || '');

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-display font-bold text-slate-800">Emergency Requests</h1>
      {isLoading ? <div className="h-64 bg-slate-100 animate-pulse rounded-xl" /> : (
        <div className="grid gap-4">
          {emergencies?.map(em => (
            <div key={em._id} className={`card border-l-4 ${em.status === 'open' ? 'border-red-500' : em.status === 'assigned' ? 'border-yellow-500' : 'border-green-500'}`}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${em.status === 'open' ? 'bg-red-100' : 'bg-yellow-100'}`}>
                    <AlertTriangle className={`w-5 h-5 ${em.status === 'open' ? 'text-red-600' : 'text-yellow-600'}`} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">{em.customer?.name}</p>
                    <p className="text-sm text-slate-600 mt-0.5">{em.description}</p>
                    <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{em.location}</span>
                      <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{em.phone}</span>
                      <span>{format(new Date(em.createdAt), 'dd MMM yyyy HH:mm')}</span>
                    </div>
                    {em.vehicle && <p className="text-xs text-slate-400 mt-1">Vehicle: {(em.vehicle as any).make} {(em.vehicle as any).model} • {(em.vehicle as any).licensePlate}</p>}
                    {em.assignedMechanic && <p className="text-xs text-blue-600 mt-1">Assigned: {em.assignedMechanic.name}</p>}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(em.status)}`}>{em.status}</span>
                  {em.status === 'open' && (
                    <select className="text-xs border border-slate-200 rounded px-2 py-1" defaultValue=""
                      onChange={e => e.target.value && assignMutation.mutate({ id: em._id, mechanicId: e.target.value })}>
                      <option value="">Assign mechanic...</option>
                      {mechanics?.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
                    </select>
                  )}
                  {em.status !== 'resolved' && (
                    <button onClick={() => resolveMutation.mutate(em._id)}
                      className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-200 transition-colors">
                      <CheckCircle className="w-3 h-3" /> Resolve
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {!emergencies?.length && (
            <div className="card text-center py-12">
              <AlertTriangle className="w-12 h-12 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-400">No emergency requests</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
