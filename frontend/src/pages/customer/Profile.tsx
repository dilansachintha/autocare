import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { authAPI } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import { User, Lock, Save } from 'lucide-react';

export default function CustomerProfile() {
  const { user, updateUser } = useAuthStore();
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  const profileMutation = useMutation({
    mutationFn: () => authAPI.updateProfile(form),
    onSuccess: (res) => { updateUser(res.data.data); toast.success('Profile updated!'); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Update failed'),
  });

  const pwMutation = useMutation({
    mutationFn: () => {
      if (pwForm.newPassword !== pwForm.confirmPassword) throw new Error('Passwords do not match');
      return authAPI.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
    },
    onSuccess: () => { toast.success('Password changed!'); setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' }); },
    onError: (e: any) => toast.error(e.message || e.response?.data?.message || 'Failed'),
  });

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-fade-in">
      <h1 className="text-2xl font-display font-bold text-slate-800">My Profile</h1>

      {/* Avatar */}
      <div className="card flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-2xl font-display">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-semibold text-slate-800 text-lg">{user?.name}</p>
          <p className="text-slate-500 text-sm">{user?.email}</p>
          <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700 mt-1 capitalize">{user?.role}</span>
        </div>
      </div>

      {/* Profile Info */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-5 h-5 text-orange-500" />
          <h2 className="font-display font-semibold text-slate-800">Personal Information</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
            <input className="input bg-slate-50" value={user?.email} disabled />
            <p className="text-xs text-slate-400 mt-1">Email cannot be changed</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
            <input className="input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
          </div>
          <button onClick={() => profileMutation.mutate()} disabled={profileMutation.isPending}
            className="btn-primary flex items-center gap-2">
            <Save className="w-4 h-4" />
            {profileMutation.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Change Password */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Lock className="w-5 h-5 text-orange-500" />
          <h2 className="font-display font-semibold text-slate-800">Change Password</h2>
        </div>
        <div className="space-y-4">
          {[
            { key: 'currentPassword', label: 'Current Password' },
            { key: 'newPassword', label: 'New Password' },
            { key: 'confirmPassword', label: 'Confirm New Password' },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-sm font-medium text-slate-700 mb-1">{f.label}</label>
              <input type="password" className="input" value={(pwForm as any)[f.key]}
                onChange={e => setPwForm({ ...pwForm, [f.key]: e.target.value })} placeholder="••••••••" />
            </div>
          ))}
          <button onClick={() => pwMutation.mutate()} disabled={pwMutation.isPending}
            className="btn-primary flex items-center gap-2">
            <Lock className="w-4 h-4" />
            {pwMutation.isPending ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </div>
    </div>
  );
}
