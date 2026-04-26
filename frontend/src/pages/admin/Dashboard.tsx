import { useQuery } from '@tanstack/react-query';
import { adminAPI } from '../../services/api';
import { DashboardStats } from '../../types';
import { Users, Calendar, Package, AlertTriangle, TrendingUp, CheckCircle, Clock, XCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const statusBadge = (status: string) => <span className={`badge-${status}`}>{status.replace('_', ' ')}</span>;

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => adminAPI.getDashboard().then(r => r.data.data as DashboardStats),
    refetchInterval: 30000,
  });

  const chartData = data?.monthlyRevenue?.map(m => ({
    month: MONTHS[m._id.month - 1],
    revenue: m.revenue,
    count: m.count,
  })) || [];

  const stats = [
    { label: 'Total Customers', value: data?.totalCustomers ?? '-', icon: Users, color: 'bg-blue-500', bg: 'bg-blue-50' },
    { label: "Today's Appointments", value: data?.todayAppointments ?? '-', icon: Calendar, color: 'bg-orange-500', bg: 'bg-orange-50' },
    { label: 'Pending Appointments', value: data?.pendingAppointments ?? '-', icon: Clock, color: 'bg-yellow-500', bg: 'bg-yellow-50' },
    { label: 'Low Stock Alerts', value: data?.lowStockItems ?? '-', icon: Package, color: 'bg-red-500', bg: 'bg-red-50' },
    { label: 'Total Revenue (LKR)', value: data?.totalRevenue ? `${(data.totalRevenue / 1000).toFixed(1)}K` : '-', icon: TrendingUp, color: 'bg-green-500', bg: 'bg-green-50' },
    { label: 'Completed Services', value: data?.completedAppointments ?? '-', icon: CheckCircle, color: 'bg-teal-500', bg: 'bg-teal-50' },
    { label: 'Active Mechanics', value: data?.totalMechanics ?? '-', icon: Users, color: 'bg-purple-500', bg: 'bg-purple-50' },
    { label: 'Open Emergencies', value: data?.openEmergencies ?? '-', icon: AlertTriangle, color: 'bg-rose-500', bg: 'bg-rose-50' },
  ];

  if (isLoading) return <div className="animate-pulse space-y-6"><div className="h-32 bg-slate-200 rounded-xl" /><div className="h-64 bg-slate-200 rounded-xl" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="card p-4">
            <div className={`w-10 h-10 ${s.bg} rounded-lg flex items-center justify-center mb-3`}>
              <s.icon className={`w-5 h-5 ${s.color.replace('bg-', 'text-')}`} />
            </div>
            <p className="text-2xl font-display font-bold text-slate-800">{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      {chartData.length > 0 && (
        <div className="card">
          <h2 className="text-base font-display font-semibold text-slate-800 mb-4">Monthly Revenue (LKR)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `${(v/1000).toFixed(0)}K`} />
              <Tooltip formatter={(v: number) => [`LKR ${v.toLocaleString()}`, 'Revenue']} />
              <Area type="monotone" dataKey="revenue" stroke="#f97316" fill="url(#rev)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent Appointments */}
      <div className="card">
        <h2 className="text-base font-display font-semibold text-slate-800 mb-4">Recent Appointments</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-slate-100">
                <th className="pb-3 font-medium text-slate-500">Customer</th>
                <th className="pb-3 font-medium text-slate-500">Vehicle</th>
                <th className="pb-3 font-medium text-slate-500">Date</th>
                <th className="pb-3 font-medium text-slate-500">Status</th>
                <th className="pb-3 font-medium text-slate-500">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data?.recentAppointments?.map((apt) => (
                <tr key={apt._id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 font-medium text-slate-800">{apt.customer?.name || '–'}</td>
                  <td className="py-3 text-slate-600">{apt.vehicle ? `${apt.vehicle.make} ${apt.vehicle.model}` : '–'}</td>
                  <td className="py-3 text-slate-600">{format(new Date(apt.scheduledDate), 'dd MMM yyyy')}</td>
                  <td className="py-3">{statusBadge(apt.status)}</td>
                  <td className="py-3 text-slate-700">LKR {apt.totalEstimatedCost?.toLocaleString()}</td>
                </tr>
              ))}
              {!data?.recentAppointments?.length && (
                <tr><td colSpan={5} className="py-6 text-center text-slate-400">No appointments yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
