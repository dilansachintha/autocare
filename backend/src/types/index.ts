import { Request } from 'express';

export type UserRole = 'customer' | 'mechanic' | 'admin';

export interface JWTPayload {
  id: string;
  email: string;
  role: UserRole;
}

export interface AuthRequest extends Request {
  user?: JWTPayload;
}

export type AppointmentStatus =
  | 'pending'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export type ServiceStatus = 'pending' | 'in_progress' | 'completed';

export type InventoryStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}
