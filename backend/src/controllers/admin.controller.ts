import { Response, NextFunction } from 'express';
import * as adminService from '../services/admin.service';
import { AuthRequest } from '../types';

export const getDashboard = async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const stats = await adminService.getDashboardStats();
    res.json({ success: true, data: stats });
  } catch (error) { next(error); }
};

export const getUsers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { role, page, limit, search } = req.query;
    const result = await adminService.getAllUsers(
      role as string, Number(page) || 1, Number(limit) || 20, search as string
    );
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
};

export const toggleUserStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await adminService.toggleUserStatus(req.params.id);
    res.json({ success: true, message: `User ${result.isActive ? 'activated' : 'deactivated'}`, data: result });
  } catch (error) { next(error); }
};

export const createMechanic = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const mechanic = await adminService.createMechanic(req.body);
    res.status(201).json({ success: true, message: 'Mechanic account created', data: mechanic });
  } catch (error) { next(error); }
};

export const getAnalytics = async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const analytics = await adminService.getAppointmentAnalytics();
    res.json({ success: true, data: analytics });
  } catch (error) { next(error); }
};
