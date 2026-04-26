import { Response, NextFunction } from 'express';
import { User } from '../models/User.model';
import { Appointment } from '../models/Appointment.model';
import { AuthRequest } from '../types';

export const getAllMechanics = async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const mechanics = await User.find({ role: 'mechanic', isActive: true }).select('-password');
    res.json({ success: true, data: mechanics });
  } catch (error) { next(error); }
};

export const getMechanicStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const mechanicId = req.params.id || req.user!.id;
    const [total, completed, inProgress, pending] = await Promise.all([
      Appointment.countDocuments({ mechanic: mechanicId }),
      Appointment.countDocuments({ mechanic: mechanicId, status: 'completed' }),
      Appointment.countDocuments({ mechanic: mechanicId, status: 'in_progress' }),
      Appointment.countDocuments({ mechanic: mechanicId, status: 'confirmed' }),
    ]);
    res.json({ success: true, data: { total, completed, inProgress, pending } });
  } catch (error) { next(error); }
};
