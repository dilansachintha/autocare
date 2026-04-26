import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryAPI } from '../../services/api';
import { InventoryItem } from '../../types';
import toast from 'react-hot-toast';
import { Plus, RefreshCw, Trash2, Edit2, Search, AlertTriangle } from 'lucide-react';

const emptyForm = { name: '', category: '', sku: '', quantity: 0, minStockLevel: 10, unitPrice: 0, supplier: '', location: '' };

export default function AdminInventory() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [restockId, setRestockId] = useState<string | null>(null);
  const [restockQty, setRestockQty] = useState(10);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['inventory', search, statusFilter],
    queryFn: () => inventoryAPI.getAll({ search, status: statusFilter || undefined }).then(r => r.data.data),
  });

  const { data: stats } = useQuery({
    queryKey: ['inventory-stats'],
    queryFn: () => inventoryAPI.getStats().then(r => r.data.data),
  });

  const saveMutation = useMutation({
    mutationFn: () => editItem ? inventoryAPI.update(editItem._id, form) : inventoryAPI.create(form),
    onSuccess: () => {
      toast.success(editItem ? 'Item updated!' : 'Item added!');
      setShowModal(false); setEditItem(null); setForm(emptyForm);
      qc.invalidateQueries({ queryKey: ['inventory'] });
      qc.invalidateQueries({ queryKey: ['inventory-stats'] });
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => inventoryAPI.delete(id),
    onSuccess: () => { toast.success('Deleted'); qc.invalidateQueries({ queryKey: ['inventory'] }); },
  });

  const restockMutation = useMutation({
    mutationFn: () => inventoryAPI.restock(restockId!, restockQty),
    onSuccess: () => { toast.success('Restocked!'); setRestockId(null); qc.invalidateQueries({ queryKey: ['inventory'] }); },
  });

  const openEdit = (item: InventoryItem) => {
    setEditItem(item);
    setForm({ name: item.name, category: item.category, sku: item.sku, quantity: item.quantity, minStockLevel: item.minStockLevel, unitPrice: item.unitPrice, supplier: item.supplier || '', location: item.location || '' });
    setShowModal(true);
  };

  const items: InventoryItem[] = data?.items || [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-slate-800">Inventory</h1>
        <button onClick={() => { setEditItem(null); setForm(emptyForm); setShowModal(true); }} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Item
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Items', value: stats.total, color: 'text-slate-800' },
            { label: 'In Stock', value: stats.inStock, color: 'text-green-600' },
            { label: 'Low Stock', value: stats.lowStock, color: 'text-yellow-600' },
            { label: 'Out of Stock', value: stats.outOfStock, color: 'text-red-600' },
          ].map(s => (
            <div key={s.label} className="card p-4">
              <p className={`text-2xl font-display font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg my-4">
            <h2 className="text-lg font-display font-semibold mb-4">{editItem ? 'Edit Item' : 'Add Inventory Item'}</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'name', label: 'Name', full: true },
                { key: 'category', label: 'Category' },
                { key: 'sku', label: 'SKU' },
                { key: 'quantity', label: 'Quantity', type: 'number' },
                { key: 'minStockLevel', label: 'Min Stock Level', type: 'number' },
                { key: 'unitPrice', label: 'Unit Price (LKR)', type: 'number' },
                { key: 'supplier', label: 'Supplier' },
                { key: 'location', label: 'Location' },
              ].map(f => (
                <div key={f.key} className={f.full ? 'col-span-2' : ''}>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{f.label}</label>
                  <input type={f.type || 'text'} className="input" value={(form as any)[f.key]}
                    onChange={e => setForm({ ...form, [f.key]: f.type === 'number' ? Number(e.target.value) : e.target.value })} />
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => { setShowModal(false); setEditItem(null); }} className="btn-secondary flex-1">Cancel</button>
              <button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="btn-primary flex-1">
                {saveMutation.isPending ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Restock Modal */}
      {restockId && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <h2 className="text-lg font-display font-semibold mb-4">Restock Item</h2>
            <label className="block text-sm font-medium text-slate-700 mb-1">Quantity to Add</label>
            <input type="number" className="input" value={restockQty} onChange={e => setRestockQty(Number(e.target.value))} min={1} />
            <div className="flex gap-3 mt-5">
              <button onClick={() => setRestockId(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={() => restockMutation.mutate()} className="btn-primary flex-1">Restock</button>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="flex flex-wrap gap-3 mb-4">
          {['','in_stock','low_stock','out_of_stock'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${statusFilter === s ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              {s === '' ? 'All' : s.replace(/_/g,' ')}
            </button>
          ))}
          <div className="relative ml-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input className="input pl-9 w-52" placeholder="Search items..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        {isLoading ? <div className="h-64 bg-slate-100 animate-pulse rounded-lg" /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-slate-100 text-left">
                {['Item','SKU','Category','Qty','Min Level','Price','Status','Actions'].map(h => (
                  <th key={h} className="pb-3 font-medium text-slate-500 pr-4">{h}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y divide-slate-50">
                {items.map(item => (
                  <tr key={item._id} className="hover:bg-slate-50">
                    <td className="py-3 pr-4 font-medium text-slate-800">{item.name}</td>
                    <td className="py-3 pr-4 text-slate-500 font-mono text-xs">{item.sku}</td>
                    <td className="py-3 pr-4 text-slate-600">{item.category}</td>
                    <td className="py-3 pr-4">
                      <span className={`font-semibold ${item.quantity === 0 ? 'text-red-500' : item.quantity <= item.minStockLevel ? 'text-yellow-500' : 'text-green-600'}`}>
                        {item.quantity}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-slate-600">{item.minStockLevel}</td>
                    <td className="py-3 pr-4 text-slate-700">LKR {item.unitPrice?.toLocaleString()}</td>
                    <td className="py-3 pr-4"><span className={`badge-${item.status}`}>{item.status.replace(/_/g,' ')}</span></td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(item)} className="text-blue-500 hover:text-blue-700"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => setRestockId(item._id)} className="text-green-500 hover:text-green-700"><RefreshCw className="w-4 h-4" /></button>
                        <button onClick={() => deleteMutation.mutate(item._id)} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!items.length && <tr><td colSpan={8} className="py-8 text-center text-slate-400">No items found</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
