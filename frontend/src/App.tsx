import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

// Landing Page
import LandingPage from './pages/LandingPage';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Customer Pages
import CustomerLayout from './components/layout/CustomerLayout';
import CustomerDashboard from './pages/customer/Dashboard';
import CustomerAppointments from './pages/customer/Appointments';
import BookAppointment from './pages/customer/BookAppointment';
import CustomerVehicles from './pages/customer/Vehicles';
import CustomerProfile from './pages/customer/Profile';
import CustomerFeedback from './pages/customer/Feedback';
import EmergencyRequest from './pages/customer/Emergency';
import PaymentHistory from './pages/customer/PaymentHistory';

// Mechanic Pages
import MechanicLayout from './components/layout/MechanicLayout';
import MechanicDashboard from './pages/mechanic/Dashboard';
import MechanicJobs from './pages/mechanic/Jobs';
import MechanicJobDetail from './pages/mechanic/JobDetail';
import MechanicProfile from './pages/mechanic/Profile';

// Admin Pages
import AdminLayout from './components/layout/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import AdminAppointments from './pages/admin/Appointments';
import AdminUsers from './pages/admin/Users';
import AdminInventory from './pages/admin/Inventory';
import AdminEmergencies from './pages/admin/Emergencies';
import AdminAnalytics from './pages/admin/Analytics';

// Guard
function ProtectedRoute({ children, role }: { children: React.ReactNode; role?: string | string[] }) {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role) {
    const allowed = Array.isArray(role) ? role : [role];
    if (!allowed.includes(user!.role)) return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function RoleRedirect() {
  const { user, isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <LandingPage />;
  if (user?.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (user?.role === 'mechanic') return <Navigate to="/mechanic/dashboard" replace />;
  return <Navigate to="/customer/dashboard" replace />;
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/" element={<RoleRedirect />} />

      {/* Customer */}
      <Route path="/customer" element={<ProtectedRoute role="customer"><CustomerLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<CustomerDashboard />} />
        <Route path="appointments" element={<CustomerAppointments />} />
        <Route path="book" element={<BookAppointment />} />
        <Route path="vehicles" element={<CustomerVehicles />} />
        <Route path="profile" element={<CustomerProfile />} />
        <Route path="feedback" element={<CustomerFeedback />} />
        <Route path="emergency" element={<EmergencyRequest />} />
        <Route path="payments" element={<PaymentHistory />} />
      </Route>

      {/* Mechanic */}
      <Route path="/mechanic" element={<ProtectedRoute role="mechanic"><MechanicLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<MechanicDashboard />} />
        <Route path="jobs" element={<MechanicJobs />} />
        <Route path="jobs/:id" element={<MechanicJobDetail />} />
        <Route path="profile" element={<MechanicProfile />} />
      </Route>

      {/* Admin */}
      <Route path="/admin" element={<ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="appointments" element={<AdminAppointments />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="inventory" element={<AdminInventory />} />
        <Route path="emergencies" element={<AdminEmergencies />} />
        <Route path="analytics" element={<AdminAnalytics />} />
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
