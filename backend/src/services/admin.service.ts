import { User } from '../models/User.model';
import { Appointment } from '../models/Appointment.model';
import { Inventory } from '../models/Inventory.model';
import { Feedback } from '../models/Feedback.model';
import { Emergency } from '../models/Emergency.model';
import { AppError } from '../middleware/errorHandler';

export const getDashboardStats = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [
    totalCustomers,
    totalMechanics,
    totalAppointments,
    todayAppointments,
    pendingAppointments,
    completedAppointments,
    lowStockItems,
    openEmergencies,
    revenueData,
    recentAppointments,
  ] = await Promise.all([
    User.countDocuments({ role: 'customer' }),
    User.countDocuments({ role: 'mechanic' }),
    Appointment.countDocuments(),
    Appointment.countDocuments({ scheduledDate: { $gte: today, $lt: tomorrow } }),
    Appointment.countDocuments({ status: 'pending' }),
    Appointment.countDocuments({ status: 'completed' }),
    Inventory.countDocuments({ status: { $in: ['low_stock', 'out_of_stock'] } }),
    Emergency.countDocuments({ status: 'open' }),
    Appointment.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalActualCost' } } },
    ]),
    Appointment.find()
      .populate('customer', 'name email')
      .populate('vehicle', 'make model licensePlate')
      .populate('mechanic', 'name')
      .sort({ createdAt: -1 })
      .limit(5),
  ]);

  // Monthly revenue for chart (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const monthlyRevenue = await Appointment.aggregate([
    { $match: { paymentStatus: 'paid', updatedAt: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: { year: { $year: '$updatedAt' }, month: { $month: '$updatedAt' } },
        revenue: { $sum: '$totalActualCost' },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  return {
    totalCustomers,
    totalMechanics,
    totalAppointments,
    todayAppointments,
    pendingAppointments,
    completedAppointments,
    lowStockItems,
    openEmergencies,
    totalRevenue: revenueData[0]?.total || 0,
    monthlyRevenue,
    recentAppointments,
  };
};

export const getAllUsers = async (role?: string, page = 1, limit = 20, search = '') => {
  const filter: Record<string, unknown> = {};
  if (role) filter.role = role;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }
  const skip = (page - 1) * limit;
  const [users, total] = await Promise.all([
    User.find(filter).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);
  return { users, total, pages: Math.ceil(total / limit) };
};

export const toggleUserStatus = async (userId: string): Promise<{ isActive: boolean }> => {
  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found', 404);
  user.isActive = !user.isActive;
  await user.save();
  return { isActive: user.isActive };
};

export const createMechanic = async (data: {
  name: string;
  email: string;
  password: string;
  phone: string;
}): Promise<typeof User.prototype> => {
  const existing = await User.findOne({ email: data.email });
  if (existing) throw new AppError('Email already registered', 400);
  const mechanic = await User.create({ ...data, role: 'mechanic' });
  return mechanic;
};

export const getAppointmentAnalytics = async () => {
  const statusDistribution = await Appointment.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);
  const serviceTypeDistribution = await Appointment.aggregate([
    { $unwind: '$services' },
    { $group: { _id: '$services.serviceType', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ]);
  const avgRating = await Feedback.aggregate([
    { $group: { _id: null, avg: { $avg: '$rating' } } },
  ]);
  return { statusDistribution, serviceTypeDistribution, avgRating: avgRating[0]?.avg || 0 };
};
