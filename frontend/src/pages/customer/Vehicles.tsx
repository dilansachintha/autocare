import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vehicleAPI } from '../../services/api';
import { Vehicle } from '../../types';
import toast from 'react-hot-toast';
import { Plus, Trash2, Car, Edit2 } from 'lucide-react';

const emptyVehicle = { make: '', model: '', year: new Date().getFullYear(), licensePlate: '', color: '', mileage: 0, fuelType: 'petrol', transmission: 'manual' };

export default function CustomerVehicles() {
  const [showModal, setShowModal] = useState(false);
  const [editVehicle, setEditVehicle] = useState<Vehicle | null>(null);
  const [form, setForm] = useState<typeof emptyVehicle>(emptyVehicle);
  const qc = useQueryClient();

  const { data: vehicles, isLoading } = useQuery({
    queryKey: ['my-vehicles'],
    queryFn: () => vehicleAPI.getMyVehicles().then(r => r.data.data as Vehicle[]),
  });

  const saveMutation = useMutation({
    mutationFn: () => editVehicle ? vehicleAPI.update(editVehicle._id, form) : vehicleAPI.add(form),
    onSuccess: () => { toast.success(editVehicle ? 'Vehicle updated!' : 'Vehicle added!'); setShowModal(false); setEditVehicle(null); setForm(emptyVehicle); qc.invalidateQueries({ queryKey: ['my-vehicles'] }); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => vehicleAPI.delete(id),
    onSuccess: () => { toast.success('Vehicle removed'); qc.invalidateQueries({ queryKey: ['my-vehicles'] }); },
  });

  const openEdit = (v: Vehicle) => {
    setEditVehicle(v);
    setForm({ make: v.make, model: v.model, year: v.year, licensePlate: v.licensePlate, color: v.color || '', mileage: v.mileage || 0, fuelType: v.fuelType, transmission: v.transmission });
    setShowModal(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-slate-800">My Vehicles</h1>
        <button onClick={() => { setEditVehicle(null); setForm(emptyVehicle); setShowModal(true); }} className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> Add Vehicle
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg my-4">
            <h2 className="text-lg font-display font-semibold mb-4">{editVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'make', label: 'Make' }, { key: 'model', label: 'Model' },
                { key: 'year', label: 'Year', type: 'number' }, { key: 'licensePlate', label: 'License Plate' },
                { key: 'color', label: 'Color' }, { key: 'mileage', label: 'Mileage (km)', type: 'number' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{f.label}</label>
                  <input type={f.type || 'text'} className="input" value={(form as any)[f.key]}
                    onChange={e => setForm({ ...form, [f.key]: f.type === 'number' ? Number(e.target.value) : e.target.value })} />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Fuel Type</label>
                <select className="input" value={form.fuelType} onChange={e => setForm({ ...form, fuelType: e.target.value })}>
                  {['petrol','diesel','electric','hybrid'].map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Transmission</label>
                <select className="input" value={form.transmission} onChange={e => setForm({ ...form, transmission: e.target.value })}>
                  <option value="manual">Manual</option>
                  <option value="automatic">Automatic</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="btn-primary flex-1">
                {saveMutation.isPending ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isLoading ? <div className="animate-pulse grid gap-4">{[1,2].map(i => <div key={i} className="h-36 bg-slate-200 rounded-xl" />)}</div> : (
        vehicles?.length === 0 ? (
          <div className="card text-center py-16">
            <Car className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400">No vehicles added yet</p>
            <button onClick={() => setShowModal(true)} className="btn-primary mt-4">Add Your First Vehicle</button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {vehicles?.map(v => (
              <div key={v._id} className="card">
                <div className="flex justify-between items-start mb-3">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <Car className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(v)} className="text-blue-400 hover:text-blue-600"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => deleteMutation.mutate(v._id)} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                <h3 className="font-display font-semibold text-slate-800">{v.year} {v.make} {v.model}</h3>
                <div className="mt-2 space-y-1">
                  {[
                    { label: 'Plate', value: v.licensePlate },
                    { label: 'Color', value: v.color },
                    { label: 'Fuel', value: v.fuelType },
                    { label: 'Trans.', value: v.transmission },
                    { label: 'Mileage', value: `${v.mileage?.toLocaleString()} km` },
                  ].map(i => (
                    <div key={i.label} className="flex justify-between text-sm">
                      <span className="text-slate-400">{i.label}</span>
                      <span className="text-slate-700 font-medium capitalize">{i.value || '–'}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
