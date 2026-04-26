import { Response, NextFunction } from 'express';
import * as emergencyService from '../services/emergency.service';
import { AuthRequest } from '../types';

export const createEmergency = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const emergency = await emergencyService.createEmergency(req.user!.id, req.body);
    res.status(201).json({ success: true, message: 'Emergency request submitted', data: emergency });
  } catch (error) { next(error); }
};

export const getEmergencies = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { status } = req.query;
    const emergencies = await emergencyService.getEmergencies(status as string);
    res.json({ success: true, data: emergencies });
  } catch (error) { next(error); }
};

export const assignMechanic = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const emergency = await emergencyService.assignEmergencyMechanic(req.params.id, req.body.mechanicId);
    res.json({ success: true, message: 'Mechanic assigned to emergency', data: emergency });
  } catch (error) { next(error); }
};

export const resolveEmergency = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const emergency = await emergencyService.resolveEmergency(req.params.id);
    res.json({ success: true, message: 'Emergency resolved', data: emergency });
  } catch (error) { next(error); }
};
