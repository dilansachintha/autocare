import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '../../services/api';
import { User } from '../../types';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { UserPlus, ToggleLeft, ToggleRight, Search } from 'lucide-react';

export default function AdminUsers() {
  const [role, setRole] = useState('');
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: 'Mechanic@123' });
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', role, search],
    queryFn: () => adminAPI.getUsers({ role: role || undefined, search: search || undefined }).then(r => r.data.data),
  });

  const toggleMutation = useMutation({
    mutationFn: (id: string) => adminAPI.toggleUserStatus(id),
    onSuccess: () => { toast.success('Status updated'); qc.invalidateQueries({ queryKey: ['admin-users'] }); },
  });

  const createMutation = useMutation({
    mutationFn: () => adminAPI.createMechanic(form),
    onSuccess: () => {
      toast.success('Mechanic created!');
      setShowCreate(false);
      setForm({ name: '', email: '', phone: '', password: 'Mechanic@123' });
      qc.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed'),
  });

  const users: User[] = data?.users || [];

  const roleColor = (r: string) => {
    if (r === 'admin') return 'bg-purple-100 text-purple-700';
    if (r === 'mechanic') return 'bg-blue-100 text-blue-700';
    return 'bg-orange-100 text-orange-700';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-slate-800">Users & Mechanics</h1>
        <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
          <UserPlus className="w-4 h-4" /> Add Mechanic
        </button>
      </div>

      {/* Create Mechanic Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
            <h2 className="text-lg font-display font-semibold mb-4">Create Mechanic Account</h2>
            <div className="space-y-3">
              {(['name','email','phone','password'] as const).map(f => (
                <div key={f}>
                  <label className="block text-sm font-medium text-slate-700 mb-1 capitalize">{f}</label>
                  <input className="input" value={form[f]} onChange={e => setForm({ ...form, [f]: e.target.value })} placeholder={f} />
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowCreate(false)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={() => createMutation.mutate()} disabled={createMutation.isPending} className="btn-primary flex-1">
                {createMutation.isPending ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="flex flex-wrap gap-3 mb-4">
          {['','customer','mechanic','admin'].map(r => (
            <button key={r} onClick={() => setRole(r)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${role === r ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              {r === '' ? 'All' : r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
          <div className="relative ml-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input className="input pl-9 w-52" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        {isLoading ? <div className="h-64 bg-slate-100 animate-pulse rounded-lg" /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-slate-100 text-left">
                {['Name','Email','Phone','Role','Joined','Status','Action'].map(h => (
                  <th key={h} className="pb-3 font-medium text-slate-500 pr-4">{h}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y divide-slate-50">
                {users.map(u => (
                  <tr key={u._id} className="hover:bg-slate-50">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-semibold text-sm">
                          {u.name?.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-slate-800">{u.name}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-slate-600">{u.email}</td>
                    <td className="py-3 pr-4 text-slate-600">{u.phone}</td>
                    <td className="py-3 pr-4"><span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${roleColor(u.role)}`}>{u.role}</span></td>
                    <td className="py-3 pr-4 text-slate-500">{format(new Date(u.createdAt), 'dd MMM yyyy')}</td>
                    <td className="py-3 pr-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3">
                      <button onClick={() => toggleMutation.mutate(u._id)}
                        className="text-slate-500 hover:text-purple-600 transition-colors">
                        {u.isActive ? <ToggleRight className="w-5 h-5 text-green-500" /> : <ToggleLeft className="w-5 h-5" />}
                      </button>
                    </td>
                  </tr>
                ))}
                {!users.length && <tr><td colSpan={7} className="py-8 text-center text-slate-400">No users found</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
