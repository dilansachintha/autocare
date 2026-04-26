export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'mechanic' | 'admin';
  avatar?: string;
  isActive: boolean;
  address?: { street: string; city: string; state: string; zipCode: string };
  createdAt: string;
}

export interface Vehicle {
  _id: string;
  owner: string | User;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  vin?: string;
  color?: string;
  mileage?: number;
  fuelType: 'petrol' | 'diesel' | 'electric' | 'hybrid';
  transmission: 'manual' | 'automatic';
  createdAt: string;
}

export interface ServiceItem {
  serviceType: string;
  description: string;
  estimatedCost: number;
  actualCost?: number;
  status: 'pending' | 'in_progress' | 'completed';
}

export interface ProgressUpdate {
  message: string;
  timestamp: string;
  updatedBy: string | User;
}

export interface Appointment {
  _id: string;
  customer: User;
  vehicle: Vehicle;
  mechanic?: User;
  services: ServiceItem[];
  scheduledDate: string;
  scheduledTime: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'normal' | 'urgent' | 'emergency';
  notes?: string;
  mechanicNotes?: string;
  totalEstimatedCost: number;
  totalActualCost?: number;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentId?: string;
  progressUpdates: ProgressUpdate[];
  createdAt: string;
}

export interface InventoryItem {
  _id: string;
  name: string;
  category: string;
  sku: string;
  quantity: number;
  minStockLevel: number;
  unitPrice: number;
  supplier?: string;
  location?: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  lastRestocked?: string;
  createdAt: string;
}

export interface Notification {
  _id: string;
  recipient: string;
  title: string;
  message: string;
  type: 'appointment' | 'payment' | 'service' | 'emergency' | 'system' | 'message';
  isRead: boolean;
  relatedId?: string;
  createdAt: string;
}

export interface Feedback {
  _id: string;
  customer: User;
  appointment: Appointment;
  mechanic?: User;
  rating: number;
  comment: string;
  serviceQuality: number;
  timeliness: number;
  valueForMoney: number;
  createdAt: string;
}

export interface Emergency {
  _id: string;
  customer: User;
  vehicle?: Vehicle;
  description: string;
  location: string;
  phone: string;
  status: 'open' | 'assigned' | 'resolved';
  assignedMechanic?: User;
  createdAt: string;
}

export interface Message {
  _id: string;
  sender: User;
  recipient: User;
  content: string;
  appointment?: string;
  isRead: boolean;
  createdAt: string;
}

export interface ServiceCatalogItem {
  id: string;
  name: string;
  category: string;
  estimatedCost: number;
  duration: number;
  description: string;
}

export interface DashboardStats {
  totalCustomers: number;
  totalMechanics: number;
  totalAppointments: number;
  todayAppointments: number;
  pendingAppointments: number;
  completedAppointments: number;
  lowStockItems: number;
  openEmergencies: number;
  totalRevenue: number;
  monthlyRevenue: { _id: { year: number; month: number }; revenue: number; count: number }[];
  recentAppointments: Appointment[];
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface PaginatedResponse<T> {
  items?: T[];
  appointments?: T[];
  users?: T[];
  vehicles?: T[];
  total: number;
  pages: number;
}
