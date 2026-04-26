import { Emergency, IEmergency } from '../models/Emergency.model';
import { User } from '../models/User.model';
import { AppError } from '../middleware/errorHandler';
import { notifyUser, sendSMS } from './notification.service';

export const createEmergency = async (
  customerId: string,
  data: { vehicleId?: string; description: string; location: string; phone: string }
): Promise<IEmergency> => {
  const emergency = await Emergency.create({
    customer: customerId,
    vehicle: data.vehicleId,
    description: data.description,
    location: data.location,
    phone: data.phone,
    status: 'open',
  });

  // Notify all admins
  const admins = await User.find({ role: 'admin' });
  for (const admin of admins) {
    await notifyUser(admin._id.toString(), {
      title: '🚨 Emergency Request',
      message: `Emergency at ${data.location}: ${data.description}`,
      type: 'emergency',
      relatedId: emergency._id.toString(),
    });
    // Send SMS to admin if configured (TextBelt free tier)
    if (admin.phone) {
      await sendSMS(admin.phone, `🚨 AUTO CARE Emergency: ${data.description} at ${data.location}. Call: ${data.phone}`);
    }
  }

  return emergency.populate(['customer', 'vehicle']);
};

export const getEmergencies = async (status?: string) => {
  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;
  return Emergency.find(filter)
    .populate('customer', 'name phone')
    .populate('vehicle', 'make model licensePlate')
    .populate('assignedMechanic', 'name phone')
    .sort({ createdAt: -1 });
};

export const assignEmergencyMechanic = async (
  emergencyId: string,
  mechanicId: string
): Promise<IEmergency> => {
  const emergency = await Emergency.findByIdAndUpdate(
    emergencyId,
    { assignedMechanic: mechanicId, status: 'assigned' },
    { new: true }
  ).populate(['customer', 'assignedMechanic']);
  if (!emergency) throw new AppError('Emergency not found', 404);

  await notifyUser(emergency.customer.toString(), {
    title: 'Help is on the way!',
    message: 'A mechanic has been assigned to your emergency request.',
    type: 'emergency',
    relatedId: emergencyId,
  });

  await notifyUser(mechanicId, {
    title: 'Emergency Assignment',
    message: `You have been assigned to an emergency at ${emergency.location}`,
    type: 'emergency',
    relatedId: emergencyId,
  });

  return emergency;
};

export const resolveEmergency = async (emergencyId: string): Promise<IEmergency> => {
  const emergency = await Emergency.findByIdAndUpdate(
    emergencyId,
    { status: 'resolved' },
    { new: true }
  );
  if (!emergency) throw new AppError('Emergency not found', 404);
  await notifyUser(emergency.customer.toString(), {
    title: 'Emergency Resolved',
    message: 'Your emergency request has been resolved.',
    type: 'emergency',
    relatedId: emergencyId,
  });
  return emergency;
};
