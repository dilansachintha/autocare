import { useQuery } from '@tanstack/react-query';
import { paymentAPI } from '../../services/api';
import { format } from 'date-fns';
import { CreditCard, CheckCircle, Clock } from 'lucide-react';

export default function PaymentHistory() {
  const { data: payments, isLoading } = useQuery({
    queryKey: ['payment-history'],
    queryFn: () => paymentAPI.getHistory().then(r => r.data.data),
  });

  const total = payments?.reduce((s: number, p: any) => s + (p.totalActualCost || 0), 0) || 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-display font-bold text-slate-800">Payment History</h1>

      {/* Summary */}
      <div className="card bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <p className="text-sm font-medium opacity-80">Total Spent</p>
        <p className="text-4xl font-display font-bold mt-1">LKR {total.toLocaleString()}</p>
        <p className="text-sm opacity-70 mt-1">{payments?.length || 0} completed payment(s)</p>
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 bg-slate-200 rounded-xl" />)}</div>
      ) : payments?.length === 0 ? (
        <div className="card text-center py-16">
          <CreditCard className="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <p className="text-slate-400">No payments yet</p>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-50 text-left">
              {['Date','Vehicle','Services','Amount','Status'].map(h => (
                <th key={h} className="py-3 px-4 font-medium text-slate-500">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-slate-100">
              {payments.map((p: any) => (
                <tr key={p._id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 text-slate-600">{format(new Date(p.scheduledDate), 'dd MMM yyyy')}</td>
                  <td className="py-3 px-4 text-slate-700 font-medium">{p.vehicle?.make} {p.vehicle?.model}<br /><span className="text-xs text-slate-400">{p.vehicle?.licensePlate}</span></td>
                  <td className="py-3 px-4 text-slate-600">{p.services?.map((s: any) => s.serviceType).join(', ')}</td>
                  <td className="py-3 px-4 font-semibold text-slate-800">LKR {(p.totalActualCost || p.totalEstimatedCost)?.toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                      <CheckCircle className="w-3 h-3" /> Paid
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
