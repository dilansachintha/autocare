import { Response, NextFunction } from 'express';
import * as appointmentService from '../services/appointment.service';
import { AuthRequest } from '../types';

export const createAppointment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const appointment = await appointmentService.createAppointment(req.user!.id, req.body);
    res.status(201).json({ success: true, message: 'Appointment booked successfully', data: appointment });
  } catch (error) { next(error); }
};

export const getMyAppointments = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page, limit } = req.query;
    const result = await appointmentService.getAppointments(
      { customer: req.user!.id },
      Number(page) || 1,
      Number(limit) || 10
    );
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
};

export const getMechanicAppointments = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page, limit, status } = req.query;
    const filter: Record<string, unknown> = { mechanic: req.user!.id };
    if (status) filter.status = status;
    const result = await appointmentService.getAppointments(filter, Number(page) || 1, Number(limit) || 10);
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
};

export const getAllAppointments = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page, limit, status, mechanicId, customerId } = req.query;
    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;
    if (mechanicId) filter.mechanic = mechanicId;
    if (customerId) filter.customer = customerId;
    const result = await appointmentService.getAppointments(filter, Number(page) || 1, Number(limit) || 10);
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
};

export const getAppointmentById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const appointment = await appointmentService.getAppointmentById(req.params.id);
    res.json({ success: true, data: appointment });
  } catch (error) { next(error); }
};

export const updateStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { status, message } = req.body;
    const appointment = await appointmentService.updateAppointmentStatus(
      req.params.id, status, req.user!.id, message
    );
    res.json({ success: true, message: 'Status updated', data: appointment });
  } catch (error) { next(error); }
};

export const assignMechanic = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { mechanicId } = req.body;
    const appointment = await appointmentService.assignMechanic(req.params.id, mechanicId);
    res.json({ success: true, message: 'Mechanic assigned', data: appointment });
  } catch (error) { next(error); }
};

export const getAvailableSlots = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { date } = req.query;
    const slots = await appointmentService.getAvailableSlots(date as string);
    res.json({ success: true, data: slots });
  } catch (error) { next(error); }
};

export const cancelAppointment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const appointment = await appointmentService.cancelAppointment(
      req.params.id, req.user!.id, req.user!.role
    );
    res.json({ success: true, message: 'Appointment cancelled', data: appointment });
  } catch (error) { next(error); }
};
