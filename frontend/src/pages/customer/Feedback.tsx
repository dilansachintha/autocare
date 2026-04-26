import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { appointmentAPI, feedbackAPI } from '../../services/api';
import { Appointment } from '../../types';
import toast from 'react-hot-toast';
import { Star, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(s => (
        <button key={s} type="button" onClick={() => onChange(s)}
          className={`text-2xl transition-colors ${s <= value ? 'text-yellow-400' : 'text-slate-200 hover:text-yellow-300'}`}>
          ★
        </button>
      ))}
    </div>
  );
}

export default function CustomerFeedback() {
  const [selectedApt, setSelectedApt] = useState<Appointment | null>(null);
  const [form, setForm] = useState({ rating: 5, comment: '', serviceQuality: 5, timeliness: 5, valueForMoney: 5 });

  const { data } = useQuery({
    queryKey: ['completed-appointments'],
    queryFn: () => appointmentAPI.getMy({ limit: 50 }).then(r => r.data.data),
  });

  const { data: allFeedback } = useQuery({
    queryKey: ['all-feedback'],
    queryFn: () => feedbackAPI.getAll({ limit: 20 }).then(r => r.data.data),
  });

  const submitMutation = useMutation({
    mutationFn: () => feedbackAPI.submit({ appointmentId: selectedApt!._id, ...form }),
    onSuccess: () => {
      toast.success('Feedback submitted! Thank you.');
      setSelectedApt(null);
      setForm({ rating: 5, comment: '', serviceQuality: 5, timeliness: 5, valueForMoney: 5 });
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Submission failed'),
  });

  const completed: Appointment[] = (data?.appointments || []).filter((a: Appointment) => a.status === 'completed');

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-display font-bold text-slate-800">Feedback</h1>

      {/* Select appointment */}
      {!selectedApt && (
        <div className="card">
          <h2 className="font-display font-semibold text-slate-800 mb-4">Rate a Completed Service</h2>
          {completed.length === 0 ? (
            <div className="text-center py-10">
              <MessageSquare className="w-10 h-10 text-slate-200 mx-auto mb-2" />
              <p className="text-slate-400 text-sm">No completed appointments to rate yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {completed.map(apt => (
                <button key={apt._id} onClick={() => setSelectedApt(apt)}
                  className="w-full text-left p-4 rounded-xl border-2 border-slate-200 hover:border-orange-300 hover:bg-orange-50 transition-all">
                  <p className="font-medium text-slate-800">{apt.services?.map(s => s.serviceType).join(', ')}</p>
                  <p className="text-sm text-slate-500 mt-0.5">
                    {apt.vehicle?.make} {apt.vehicle?.model} • {format(new Date(apt.scheduledDate), 'dd MMM yyyy')}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Feedback Form */}
      {selectedApt && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-slate-800">Rate Your Experience</h2>
            <button onClick={() => setSelectedApt(null)} className="text-sm text-slate-400 hover:text-slate-600">← Back</button>
          </div>
          <div className="bg-slate-50 rounded-lg p-3 mb-5">
            <p className="text-sm font-medium text-slate-700">{selectedApt.services?.map(s => s.serviceType).join(', ')}</p>
            <p className="text-xs text-slate-500">{format(new Date(selectedApt.scheduledDate), 'dd MMM yyyy')}</p>
          </div>
          <div className="space-y-5">
            {[
              { key: 'rating', label: 'Overall Rating' },
              { key: 'serviceQuality', label: 'Service Quality' },
              { key: 'timeliness', label: 'Timeliness' },
              { key: 'valueForMoney', label: 'Value for Money' },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-sm font-medium text-slate-700 mb-1">{f.label}</label>
                <StarRating value={(form as any)[f.key]} onChange={v => setForm({ ...form, [f.key]: v })} />
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Comment</label>
              <textarea className="input" rows={4} placeholder="Share your experience..." value={form.comment}
                onChange={e => setForm({ ...form, comment: e.target.value })} />
            </div>
            <button onClick={() => submitMutation.mutate()} disabled={submitMutation.isPending || !form.comment}
              className="btn-primary w-full">
              {submitMutation.isPending ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        </div>
      )}

      {/* Public Feedback */}
      {allFeedback?.feedbacks?.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-slate-800">Customer Reviews</h2>
            <div className="flex items-center gap-1">
              <span className="text-yellow-400">★</span>
              <span className="text-sm font-semibold">{Number(allFeedback.avgRating).toFixed(1)}</span>
              <span className="text-xs text-slate-400">/ 5.0</span>
            </div>
          </div>
          <div className="space-y-4">
            {allFeedback.feedbacks.slice(0, 5).map((fb: any) => (
              <div key={fb._id} className="p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm">
                      {fb.customer?.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-slate-700">{fb.customer?.name}</span>
                  </div>
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(s => <span key={s} className={`text-sm ${s <= fb.rating ? 'text-yellow-400' : 'text-slate-200'}`}>★</span>)}
                  </div>
                </div>
                <p className="text-sm text-slate-600">{fb.comment}</p>
                <p className="text-xs text-slate-400 mt-1">{format(new Date(fb.createdAt), 'dd MMM yyyy')}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
