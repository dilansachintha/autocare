import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// ─── Auth ─────────────────────────────────────────────────────────────────
export const authAPI = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  register: (data: object) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data: object) => api.put('/auth/profile', data),
  changePassword: (data: object) => api.put('/auth/change-password', data),
  verify: () => api.get('/auth/verify'),
};

// ─── Appointments ──────────────────────────────────────────────────────────
export const appointmentAPI = {
  create: (data: object) => api.post('/appointments', data),
  getAvailableSlots: (date: string) => api.get(`/appointments/slots?date=${date}`),
  getMy: (params?: object) => api.get('/appointments/my', { params }),
  getMechanicJobs: (params?: object) => api.get('/appointments/mechanic', { params }),
  getAll: (params?: object) => api.get('/appointments', { params }),
  getById: (id: string) => api.get(`/appointments/${id}`),
  updateStatus: (id: string, data: object) => api.put(`/appointments/${id}/status`, data),
  assignMechanic: (id: string, mechanicId: string) => api.put(`/appointments/${id}/assign`, { mechanicId }),
  cancel: (id: string) => api.put(`/appointments/${id}/cancel`),
};

// ─── Vehicles ──────────────────────────────────────────────────────────────
export const vehicleAPI = {
  getMyVehicles: () => api.get('/users/vehicles'),
  add: (data: object) => api.post('/users/vehicles', data),
  update: (id: string, data: object) => api.put(`/users/vehicles/${id}`, data),
  delete: (id: string) => api.delete(`/users/vehicles/${id}`),
  getAll: (params?: object) => api.get('/users/all-vehicles', { params }),
};

// ─── Services ──────────────────────────────────────────────────────────────
export const serviceAPI = {
  getCatalog: () => api.get('/services'),
  getCategories: () => api.get('/services/categories'),
};

// ─── Inventory ─────────────────────────────────────────────────────────────
export const inventoryAPI = {
  getAll: (params?: object) => api.get('/inventory', { params }),
  getLowStock: () => api.get('/inventory/low-stock'),
  getStats: () => api.get('/inventory/stats'),
  create: (data: object) => api.post('/inventory', data),
  update: (id: string, data: object) => api.put(`/inventory/${id}`, data),
  restock: (id: string, quantity: number) => api.put(`/inventory/${id}/restock`, { quantity }),
  delete: (id: string) => api.delete(`/inventory/${id}`),
};

// ─── Admin ─────────────────────────────────────────────────────────────────
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params?: object) => api.get('/admin/users', { params }),
  toggleUserStatus: (id: string) => api.put(`/admin/users/${id}/toggle`),
  createMechanic: (data: object) => api.post('/admin/mechanics', data),
  getAnalytics: () => api.get('/admin/analytics'),
};

// ─── Mechanics ─────────────────────────────────────────────────────────────
export const mechanicAPI = {
  getAll: () => api.get('/mechanics'),
  getStats: () => api.get('/mechanics/stats'),
};

// ─── Notifications ─────────────────────────────────────────────────────────
export const notificationAPI = {
  getAll: (params?: object) => api.get('/notifications', { params }),
  markRead: (id: string) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
};

// ─── Feedback ──────────────────────────────────────────────────────────────
export const feedbackAPI = {
  submit: (data: object) => api.post('/feedback', data),
  getAll: (params?: object) => api.get('/feedback', { params }),
};

// ─── Emergency ─────────────────────────────────────────────────────────────
export const emergencyAPI = {
  create: (data: object) => api.post('/emergency', data),
  getAll: (params?: object) => api.get('/emergency', { params }),
  assignMechanic: (id: string, mechanicId: string) => api.put(`/emergency/${id}/assign`, { mechanicId }),
  resolve: (id: string) => api.put(`/emergency/${id}/resolve`),
};

// ─── Messages ──────────────────────────────────────────────────────────────
export const messageAPI = {
  send: (data: object) => api.post('/messages', data),
  getConversations: () => api.get('/messages/conversations'),
  getConversation: (userId: string) => api.get(`/messages/conversation/${userId}`),
};

// ─── Payments ──────────────────────────────────────────────────────────────
export const paymentAPI = {
  createIntent: (appointmentId: string) => api.post('/payments/create-intent', { appointmentId }),
  confirm: (appointmentId: string, paymentIntentId: string) =>
    api.post('/payments/confirm', { appointmentId, paymentIntentId }),
  getHistory: () => api.get('/payments/history'),
};
