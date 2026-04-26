import { Response, NextFunction } from 'express';
import * as vehicleService from '../services/vehicle.service';
import { AuthRequest } from '../types';

export const getMyVehicles = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const vehicles = await vehicleService.getVehiclesByOwner(req.user!.id);
    res.json({ success: true, data: vehicles });
  } catch (error) { next(error); }
};

export const addVehicle = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const vehicle = await vehicleService.createVehicle(req.user!.id, req.body);
    res.status(201).json({ success: true, message: 'Vehicle added', data: vehicle });
  } catch (error) { next(error); }
};

export const updateVehicle = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const vehicle = await vehicleService.updateVehicle(req.params.id, req.user!.id, req.body);
    res.json({ success: true, message: 'Vehicle updated', data: vehicle });
  } catch (error) { next(error); }
};

export const deleteVehicle = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await vehicleService.deleteVehicle(req.params.id, req.user!.id);
    res.json({ success: true, message: 'Vehicle removed' });
  } catch (error) { next(error); }
};

export const getAllVehicles = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page, limit, search } = req.query;
    const result = await vehicleService.getAllVehicles(Number(page) || 1, Number(limit) || 20, search as string);
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
};
