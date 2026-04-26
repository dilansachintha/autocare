import { Appointment, IAppointment } from '../models/Appointment.model';
import { Vehicle } from '../models/Vehicle.model';
import { User } from '../models/User.model';
import { AppError } from '../middleware/errorHandler';
import {
  notifyUser,
  sendAppointmentCancelledEmail,
  sendAppointmentConfirmationEmail,
  sendAppointmentStatusEmail,
  sendMechanicAssignedEmail,
} from './notification.service';

export const createAppointment = async (
  customerId: string,
  data: {
    vehicleId: string;
    services: { serviceType: string; description: string; estimatedCost: number }[];
    scheduledDate: string;
    scheduledTime: string;
    notes?: string;
    priority?: 'normal' | 'urgent' | 'emergency';
  }
): Promise<IAppointment> => {
  const vehicle = await Vehicle.findOne({ _id: data.vehicleId, owner: customerId });
  if (!vehicle) throw new AppError('Vehicle not found or not owned by you', 404);

  // Check for slot conflicts
  const conflict = await Appointment.findOne({
    scheduledDate: new Date(data.scheduledDate),
    scheduledTime: data.scheduledTime,
    status: { $nin: ['cancelled', 'completed'] },
  });
  if (conflict) throw new AppError('This time slot is already booked', 409);

  const totalEstimatedCost = data.services.reduce((sum, s) => sum + s.estimatedCost, 0);

  const appointment = await Appointment.create({
    customer: customerId,
    vehicle: data.vehicleId,
    services: data.services,
    scheduledDate: new Date(data.scheduledDate),
    scheduledTime: data.scheduledTime,
    notes: data.notes,
    priority: data.priority || 'normal',
    totalEstimatedCost,
    status: 'pending',
    paymentStatus: 'pending',
  });

  await notifyUser(customerId, {
    title: 'Appointment Booked',
    message: `Your appointment on ${data.scheduledDate} at ${data.scheduledTime} has been booked successfully.`,
    type: 'appointment',
    relatedId: appointment._id.toString(),
  });

  // Notify all admins
  const admins = await User.find({ role: 'admin' });
  for (const admin of admins) {
    await notifyUser(admin._id.toString(), {
      title: 'New Appointment',
      message: `A new appointment has been booked for ${data.scheduledDate} at ${data.scheduledTime}.`,
      type: 'appointment',
      relatedId: appointment._id.toString(),
    });
  }

  // Send appointment confirmation email when customer has an email.
  const customer = await User.findById(customerId).select('name email');
  if (customer?.email) {
    await sendAppointmentConfirmationEmail(
      customer.email,
      customer.name,
      new Date(data.scheduledDate).toLocaleDateString(),
      data.scheduledTime
    );
  }

  return appointment.populate(['customer', 'vehicle']);
};

export const getAppointments = async (
  filter: Record<string, unknown>,
  page = 1,
  limit = 10
): Promise<{ appointments: IAppointment[]; total: number; pages: number }> => {
  const skip = (page - 1) * limit;
  const [appointments, total] = await Promise.all([
    Appointment.find(filter)
      .populate('customer', 'name email phone')
      .populate('vehicle', 'make model year licensePlate')
      .populate('mechanic', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Appointment.countDocuments(filter),
  ]);
  return { appointments, total, pages: Math.ceil(total / limit) };
};

export const getAppointmentById = async (id: string): Promise<IAppointment> => {
  const appointment = await Appointment.findById(id)
    .populate('customer', 'name email phone')
    .populate('vehicle')
    .populate('mechanic', 'name email phone');
  if (!appointment) throw new AppError('Appointment not found', 404);
  return appointment;
};

export const updateAppointmentStatus = async (
  appointmentId: string,
  status: IAppointment['status'],
  updatedById: string,
  message?: string
): Promise<IAppointment> => {
  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) throw new AppError('Appointment not found', 404);

  appointment.status = status;
  appointment.progressUpdates.push({
    message: message || `Status updated to ${status}`,
    timestamp: new Date(),
    updatedBy: updatedById as unknown as import('mongoose').Types.ObjectId,
  });
  await appointment.save();

  // Notify customer
  await notifyUser(appointment.customer.toString(), {
    title: 'Appointment Update',
    message: message || `Your appointment status has been updated to: ${status}`,
    type: 'service',
    relatedId: appointmentId,
  });

  const customer = await User.findById(appointment.customer).select('name email');
  if (customer?.email) {
    await sendAppointmentStatusEmail(
      customer.email,
      customer.name,
      status,
      message
    );
  }

  return appointment.populate(['customer', 'vehicle', 'mechanic']);
};

export const assignMechanic = async (
  appointmentId: string,
  mechanicId: string
): Promise<IAppointment> => {
  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) throw new AppError('Appointment not found', 404);

  const mechanic = await User.findOne({ _id: mechanicId, role: 'mechanic' });
  if (!mechanic) throw new AppError('Mechanic not found', 404);

  appointment.mechanic = mechanicId as unknown as import('mongoose').Types.ObjectId;
  appointment.status = 'confirmed';
  appointment.progressUpdates.push({
    message: `Mechanic ${mechanic.name} assigned to this appointment`,
    timestamp: new Date(),
    updatedBy: mechanicId as unknown as import('mongoose').Types.ObjectId,
  });
  await appointment.save();

  await notifyUser(appointment.customer.toString(), {
    title: 'Mechanic Assigned',
    message: `${mechanic.name} has been assigned to your vehicle service.`,
    type: 'appointment',
    relatedId: appointmentId,
  });

  const customer = await User.findById(appointment.customer).select('name email');
  if (customer?.email) {
    await sendMechanicAssignedEmail(customer.email, customer.name, mechanic.name);
  }

  await notifyUser(mechanicId, {
    title: 'New Job Assigned',
    message: `You have been assigned a new service appointment.`,
    type: 'appointment',
    relatedId: appointmentId,
  });

  return appointment.populate(['customer', 'vehicle', 'mechanic']);
};

export const getAvailableSlots = async (date: string): Promise<string[]> => {
  const allSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00',
  ];

  const booked = await Appointment.find({
    scheduledDate: new Date(date),
    status: { $nin: ['cancelled'] },
  }).select('scheduledTime');

  const bookedTimes = new Set(booked.map((a) => a.scheduledTime));
  return allSlots.filter((slot) => !bookedTimes.has(slot));
};

export const cancelAppointment = async (
  appointmentId: string,
  userId: string,
  role: string
): Promise<IAppointment> => {
  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) throw new AppError('Appointment not found', 404);

  if (role === 'customer' && appointment.customer.toString() !== userId) {
    throw new AppError('Not authorized to cancel this appointment', 403);
  }

  if (['in_progress', 'completed'].includes(appointment.status)) {
    throw new AppError('Cannot cancel an appointment that is in progress or completed', 400);
  }

  appointment.status = 'cancelled';
  appointment.progressUpdates.push({
    message: 'Appointment cancelled',
    timestamp: new Date(),
    updatedBy: userId as unknown as import('mongoose').Types.ObjectId,
  });
  await appointment.save();

  await notifyUser(appointment.customer.toString(), {
    title: 'Appointment Cancelled',
    message: 'Your appointment has been cancelled.',
    type: 'appointment',
    relatedId: appointmentId,
  });

  const customer = await User.findById(appointment.customer).select('name email');
  if (customer?.email) {
    await sendAppointmentCancelledEmail(customer.email, customer.name);
  }

  return appointment;
};
