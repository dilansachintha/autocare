import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { emergencyAPI, vehicleAPI } from '../../services/api';
import { Vehicle } from '../../types';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import { AlertTriangle, MapPin, Phone, Clock } from 'lucide-react';
import { format } from 'date-fns';

export default function EmergencyRequest() {
  const { user } = useAuthStore();
  const [form, setForm] = useState({ description: '', location: '', phone: user?.phone || '', vehicleId: '' });

  const { data: vehicles } = useQuery({
    queryKey: ['my-vehicles'],
    queryFn: () => vehicleAPI.getMyVehicles().then(r => r.data.data as Vehicle[]),
  });

  const submitMutation = useMutation({
    mutationFn: () => emergencyAPI.create({ ...form, vehicleId: form.vehicleId || undefined }),
    onSuccess: () => {
      toast.success('Emergency request submitted! Help is coming.');
      setForm({ description: '', location: '', phone: user?.phone || '', vehicleId: '' });
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Submission failed'),
  });

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-fade-in">
      <div className="card bg-red-50 border-red-200">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h1 className="text-xl font-display font-bold text-red-800">Emergency Roadside Assistance</h1>
            <p className="text-sm text-red-600 mt-1">Submit an emergency request and our team will contact you immediately.</p>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="font-display font-semibold text-slate-800 mb-4">Request Emergency Help</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Vehicle (optional)</label>
            <select className="input" value={form.vehicleId} onChange={e => setForm({ ...form, vehicleId: e.target.value })}>
              <option value="">Select vehicle...</option>
              {vehicles?.map(v => <option key={v._id} value={v._id}>{v.year} {v.make} {v.model} - {v.licensePlate}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
              <AlertTriangle className="w-4 h-4 text-red-500" /> Problem Description *
            </label>
            <textarea className="input" rows={3} placeholder="Describe the problem (e.g., flat tire, engine won't start, accident...)"
              value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
              <MapPin className="w-4 h-4 text-red-500" /> Your Location *
            </label>
            <input className="input" placeholder="e.g., A9 Highway near Kandy km 45, or street address"
              value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
              <Phone className="w-4 h-4 text-red-500" /> Contact Phone *
            </label>
            <input className="input" placeholder="+94771234567" value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })} required />
          </div>
          <button
            onClick={() => submitMutation.mutate()}
            disabled={submitMutation.isPending || !form.description || !form.location || !form.phone}
            className="btn-danger w-full py-3 flex items-center justify-center gap-2 text-base">
            <AlertTriangle className="w-5 h-5" />
            {submitMutation.isPending ? 'Sending...' : 'Send Emergency Request'}
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="card">
        <h2 className="font-display font-semibold text-slate-800 mb-3">What happens next?</h2>
        <div className="space-y-3">
          {[
            { icon: AlertTriangle, color: 'text-red-500 bg-red-50', text: 'Your request is immediately sent to our admin team' },
            { icon: Phone, color: 'text-blue-500 bg-blue-50', text: 'A mechanic will be assigned and contact you on your phone' },
            { icon: Clock, color: 'text-green-500 bg-green-50', text: 'Expected response time: within 30-60 minutes' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${item.color}`}>
                <item.icon className="w-4 h-4" />
              </div>
              <p className="text-sm text-slate-600">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
