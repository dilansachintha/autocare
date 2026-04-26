import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { appointmentAPI, vehicleAPI, serviceAPI } from '../../services/api';
import { Vehicle, ServiceCatalogItem } from '../../types';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Car, CheckCircle, Plus, Minus } from 'lucide-react';
import { format } from 'date-fns';

type SelectedService = ServiceCatalogItem & { quantity?: number };

const STEPS = ['Select Vehicle', 'Choose Services', 'Pick Date & Time', 'Confirm'];

export default function BookAppointment() {
  const [step, setStep] = useState(0);
  const [vehicleId, setVehicleId] = useState('');
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [priority, setPriority] = useState<'normal' | 'urgent'>('normal');
  const navigate = useNavigate();

  const { data: vehicles } = useQuery({
    queryKey: ['my-vehicles'],
    queryFn: () => vehicleAPI.getMyVehicles().then(r => r.data.data as Vehicle[]),
  });

  const { data: catalog } = useQuery({
    queryKey: ['service-catalog'],
    queryFn: () => serviceAPI.getCatalog().then(r => r.data.data as ServiceCatalogItem[]),
  });

  const { data: slots } = useQuery({
    queryKey: ['slots', date],
    queryFn: () => appointmentAPI.getAvailableSlots(date).then(r => r.data.data as string[]),
    enabled: !!date,
  });

  const bookMutation = useMutation({
    mutationFn: () => appointmentAPI.create({
      vehicleId,
      services: selectedServices.map(s => ({ serviceType: s.name, description: s.description, estimatedCost: s.estimatedCost })),
      scheduledDate: date,
      scheduledTime: time,
      notes,
      priority,
    }),
    onSuccess: () => { toast.success('Appointment booked!'); navigate('/customer/appointments'); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Booking failed'),
  });

  const toggleService = (s: ServiceCatalogItem) => {
    setSelectedServices(prev =>
      prev.find(x => x.id === s.id) ? prev.filter(x => x.id !== s.id) : [...prev, s]
    );
  };

  const totalCost = selectedServices.reduce((sum, s) => sum + s.estimatedCost, 0);
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <h1 className="text-2xl font-display font-bold text-slate-800">Book Appointment</h1>

      {/* Stepper */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${i < step ? 'bg-green-500 text-white' : i === step ? 'bg-orange-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
              {i < step ? <CheckCircle className="w-4 h-4" /> : i + 1}
            </div>
            <span className={`text-xs font-medium hidden sm:block ${i === step ? 'text-orange-500' : 'text-slate-400'}`}>{s}</span>
            {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 ${i < step ? 'bg-green-400' : 'bg-slate-200'}`} />}
          </div>
        ))}
      </div>

      <div className="card">
        {/* Step 0: Vehicle */}
        {step === 0 && (
          <div className="space-y-4">
            <h2 className="font-display font-semibold text-slate-800">Select Your Vehicle</h2>
            {vehicles?.length === 0 && (
              <div className="text-center py-8">
                <Car className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                <p className="text-slate-400 text-sm">No vehicles added yet.</p>
                <a href="/customer/vehicles" className="btn-primary mt-3 inline-flex text-sm">Add Vehicle</a>
              </div>
            )}
            <div className="grid gap-3">
              {vehicles?.map(v => (
                <label key={v._id} className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${vehicleId === v._id ? 'border-orange-500 bg-orange-50' : 'border-slate-200 hover:border-slate-300'}`}>
                  <input type="radio" className="sr-only" checked={vehicleId === v._id} onChange={() => setVehicleId(v._id)} />
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${vehicleId === v._id ? 'bg-orange-500' : 'bg-slate-100'}`}>
                    <Car className={`w-5 h-5 ${vehicleId === v._id ? 'text-white' : 'text-slate-500'}`} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">{v.year} {v.make} {v.model}</p>
                    <p className="text-sm text-slate-500">{v.licensePlate} • {v.color}</p>
                  </div>
                </label>
              ))}
            </div>
            <div className="flex justify-end">
              <button onClick={() => setStep(1)} disabled={!vehicleId} className="btn-primary">Next →</button>
            </div>
          </div>
        )}

        {/* Step 1: Services */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="font-display font-semibold text-slate-800">Choose Services</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {catalog?.map(s => {
                const isSelected = selectedServices.find(x => x.id === s.id);
                return (
                  <button key={s.id} onClick={() => toggleService(s)}
                    className={`text-left p-4 rounded-xl border-2 transition-all ${isSelected ? 'border-orange-500 bg-orange-50' : 'border-slate-200 hover:border-slate-300'}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-slate-800 text-sm">{s.name}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{s.description}</p>
                        <p className="text-xs text-slate-500 mt-1">~{s.duration} min</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {isSelected && <CheckCircle className="w-4 h-4 text-orange-500" />}
                        <span className="text-sm font-semibold text-orange-600">LKR {s.estimatedCost?.toLocaleString()}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            {selectedServices.length > 0 && (
              <div className="bg-orange-50 rounded-lg p-3 flex justify-between items-center">
                <span className="text-sm font-medium text-slate-700">{selectedServices.length} service(s) selected</span>
                <span className="text-sm font-bold text-orange-600">Total: LKR {totalCost.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between">
              <button onClick={() => setStep(0)} className="btn-secondary">← Back</button>
              <button onClick={() => setStep(2)} disabled={selectedServices.length === 0} className="btn-primary">Next →</button>
            </div>
          </div>
        )}

        {/* Step 2: Date & Time */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="font-display font-semibold text-slate-800">Pick Date & Time</h2>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Service Date</label>
              <input type="date" className="input" value={date}
                min={format(tomorrow, 'yyyy-MM-dd')}
                onChange={e => { setDate(e.target.value); setTime(''); }} />
            </div>
            {date && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Available Time Slots</label>
                {slots?.length === 0 ? (
                  <p className="text-sm text-slate-400">No slots available for this date. Try another date.</p>
                ) : (
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {slots?.map(slot => (
                      <button key={slot} onClick={() => setTime(slot)}
                        className={`py-2 px-2 rounded-lg text-xs font-medium border-2 transition-all ${time === slot ? 'border-orange-500 bg-orange-500 text-white' : 'border-slate-200 text-slate-600 hover:border-orange-300'}`}>
                        {slot}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
              <div className="flex gap-3">
                {(['normal','urgent'] as const).map(p => (
                  <button key={p} onClick={() => setPriority(p)}
                    className={`flex-1 py-2 rounded-lg border-2 text-sm font-medium capitalize transition-all ${priority === p ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-slate-200 text-slate-600'}`}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Notes (optional)</label>
              <textarea className="input" rows={3} placeholder="Any special requests or issues to note..." value={notes} onChange={e => setNotes(e.target.value)} />
            </div>
            <div className="flex justify-between">
              <button onClick={() => setStep(1)} className="btn-secondary">← Back</button>
              <button onClick={() => setStep(3)} disabled={!date || !time} className="btn-primary">Next →</button>
            </div>
          </div>
        )}

        {/* Step 3: Confirm */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="font-display font-semibold text-slate-800">Confirm Booking</h2>
            <div className="bg-slate-50 rounded-xl p-4 space-y-3">
              <div className="flex justify-between text-sm"><span className="text-slate-500">Vehicle</span><span className="font-medium">{vehicles?.find(v => v._id === vehicleId)?.make} {vehicles?.find(v => v._id === vehicleId)?.model}</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-500">Date</span><span className="font-medium">{format(new Date(date), 'dd MMM yyyy')}</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-500">Time</span><span className="font-medium">{time}</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-500">Priority</span><span className="font-medium capitalize">{priority}</span></div>
              <div className="border-t border-slate-200 pt-3">
                <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Services</p>
                {selectedServices.map(s => (
                  <div key={s.id} className="flex justify-between text-sm py-0.5">
                    <span className="text-slate-700">{s.name}</span>
                    <span className="text-slate-600">LKR {s.estimatedCost?.toLocaleString()}</span>
                  </div>
                ))}
                <div className="flex justify-between text-sm font-bold pt-2 border-t border-slate-200 mt-2">
                  <span>Total Estimate</span>
                  <span className="text-orange-600">LKR {totalCost.toLocaleString()}</span>
                </div>
              </div>
              {notes && <div className="text-sm"><span className="text-slate-500">Notes: </span><span className="text-slate-700">{notes}</span></div>}
            </div>
            <div className="flex justify-between">
              <button onClick={() => setStep(2)} className="btn-secondary">← Back</button>
              <button onClick={() => bookMutation.mutate()} disabled={bookMutation.isPending} className="btn-primary">
                {bookMutation.isPending ? 'Booking...' : '✓ Confirm Booking'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
