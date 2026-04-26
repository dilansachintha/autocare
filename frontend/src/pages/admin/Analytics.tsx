import { useQuery } from '@tanstack/react-query';
import { adminAPI } from '../../services/api';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#f97316','#3b82f6','#8b5cf6','#10b981','#ef4444','#f59e0b'];

export default function AdminAnalytics() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: () => adminAPI.getAnalytics().then(r => r.data.data),
  });

  const { data: dash } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => adminAPI.getDashboard().then(r => r.data.data),
  });

  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const revenueChart = dash?.monthlyRevenue?.map((m: any) => ({
    month: MONTHS[m._id.month - 1],
    revenue: m.revenue,
    count: m.count,
  })) || [];

  const statusData = data?.statusDistribution?.map((s: any) => ({
    name: s._id.replace('_',' '),
    value: s.count,
  })) || [];

  const serviceData = data?.serviceTypeDistribution?.slice(0, 8)?.map((s: any) => ({
    name: s._id,
    count: s.count,
  })) || [];

  if (isLoading) return <div className="animate-pulse space-y-6"><div className="h-64 bg-slate-200 rounded-xl" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-display font-bold text-slate-800">Analytics</h1>

      {/* Average Rating */}
      {data?.avgRating && (
        <div className="card flex items-center gap-4">
          <div className="text-5xl font-display font-bold text-orange-500">{Number(data.avgRating).toFixed(1)}</div>
          <div>
            <p className="font-semibold text-slate-800">Average Customer Rating</p>
            <p className="text-sm text-slate-500">Based on all submitted feedback</p>
            <div className="flex gap-0.5 mt-1">
              {[1,2,3,4,5].map(s => (
                <span key={s} className={`text-lg ${s <= Math.round(data.avgRating) ? 'text-yellow-400' : 'text-slate-200'}`}>★</span>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="card">
          <h2 className="text-base font-display font-semibold text-slate-800 mb-4">Appointment Status Distribution</h2>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {statusData.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-slate-400 text-center py-16">No data yet</p>}
        </div>

        {/* Service Type Distribution */}
        <div className="card">
          <h2 className="text-base font-display font-semibold text-slate-800 mb-4">Most Popular Services</h2>
          {serviceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={serviceData} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={120} />
                <Tooltip />
                <Bar dataKey="count" fill="#f97316" radius={[0,4,4,0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-slate-400 text-center py-16">No data yet</p>}
        </div>
      </div>

      {/* Monthly Revenue & Count */}
      {revenueChart.length > 0 && (
        <div className="card">
          <h2 className="text-base font-display font-semibold text-slate-800 mb-4">Monthly Revenue & Services</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={revenueChart}>
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="left" tickFormatter={v => `${(v/1000).toFixed(0)}K`} tick={{ fontSize: 12 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v: number, name: string) => [name === 'revenue' ? `LKR ${v.toLocaleString()}` : v, name === 'revenue' ? 'Revenue' : 'Services']} />
              <Legend />
              <Bar yAxisId="left" dataKey="revenue" fill="#f97316" name="Revenue" radius={[4,4,0,0]} />
              <Bar yAxisId="right" dataKey="count" fill="#3b82f6" name="Services" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
