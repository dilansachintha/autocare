// notification.controller.ts
import { Response, NextFunction } from 'express';
import * as notificationService from '../services/notification.service';
import { AuthRequest } from '../types';

export const getNotifications = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page, limit } = req.query;
    const result = await notificationService.getNotifications(req.user!.id, Number(page) || 1, Number(limit) || 20);
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
};

export const markRead = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await notificationService.markAsRead(req.params.id, req.user!.id);
    res.json({ success: true, message: 'Marked as read' });
  } catch (error) { next(error); }
};

export const markAllRead = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await notificationService.markAllAsRead(req.user!.id);
    res.json({ success: true, message: 'All marked as read' });
  } catch (error) { next(error); }
};
