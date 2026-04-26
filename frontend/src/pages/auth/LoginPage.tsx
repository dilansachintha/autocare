import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Car, Wrench, ShieldCheck, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { authAPI } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

const QUICK_LOGINS = [
  { label: 'Admin', email: 'admin@autocare.com', password: 'Admin@123', icon: ShieldCheck, color: 'bg-purple-600' },
  { label: 'Mechanic', email: 'mechanic@autocare.com', password: 'Mechanic@123', icon: Wrench, color: 'bg-blue-600' },
  { label: 'Customer', email: 'customer@autocare.com', password: 'Customer@123', icon: Car, color: 'bg-orange-500' },
];

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authAPI.login(form.email, form.password);
      const { user, token } = res.data.data;
      setAuth(user, token);
      toast.success(`Welcome back, ${user.name}!`);
      if (user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'mechanic') navigate('/mechanic/dashboard');
      else navigate('/customer/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (email: string, password: string) => {
    setForm({ email, password });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Landing Page
          </Link>
        </div>
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500 rounded-2xl mb-4 shadow-lg shadow-orange-500/30">
            <Car className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-display font-bold text-white">AUTO CARE</h1>
          <p className="text-slate-400 mt-1">Vehicle Service Management System</p>
        </div>

        {/* Quick Login Buttons */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          {QUICK_LOGINS.map((ql) => (
            <button
              key={ql.label}
              onClick={() => quickLogin(ql.email, ql.password)}
              className={`${ql.color} text-white text-xs font-medium py-2 px-3 rounded-lg flex flex-col items-center gap-1 hover:opacity-90 transition-opacity`}
            >
              <ql.icon className="w-4 h-4" />
              Demo {ql.label}
            </button>
          ))}
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-display font-semibold text-slate-800 mb-6">Sign In</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                className="input"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  className="input pr-10"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <p className="text-center text-sm text-slate-500 mt-4">
            Don't have an account?{' '}
            <Link to="/register" className="text-orange-500 hover:text-orange-600 font-medium">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
