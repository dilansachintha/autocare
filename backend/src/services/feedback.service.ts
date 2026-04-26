import { Feedback, IFeedback } from '../models/Feedback.model';
import { Appointment } from '../models/Appointment.model';
import { AppError } from '../middleware/errorHandler';

export const createFeedback = async (
  customerId: string,
  data: {
    appointmentId: string;
    rating: number;
    comment: string;
    serviceQuality: number;
    timeliness: number;
    valueForMoney: number;
  }
): Promise<IFeedback> => {
  const appointment = await Appointment.findOne({
    _id: data.appointmentId,
    customer: customerId,
    status: 'completed',
  });
  if (!appointment) throw new AppError('Appointment not found or not completed', 404);

  const existing = await Feedback.findOne({ appointment: data.appointmentId });
  if (existing) throw new AppError('Feedback already submitted for this appointment', 400);

  return Feedback.create({
    customer: customerId,
    appointment: data.appointmentId,
    mechanic: appointment.mechanic,
    rating: data.rating,
    comment: data.comment,
    serviceQuality: data.serviceQuality,
    timeliness: data.timeliness,
    valueForMoney: data.valueForMoney,
  });
};

export const getFeedbacks = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const [feedbacks, total] = await Promise.all([
    Feedback.find()
      .populate('customer', 'name avatar')
      .populate('appointment', 'scheduledDate services')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Feedback.countDocuments(),
  ]);
  const avgRating = await Feedback.aggregate([
    { $group: { _id: null, avg: { $avg: '$rating' } } },
  ]);
  return { feedbacks, total, pages: Math.ceil(total / limit), avgRating: avgRating[0]?.avg || 0 };
};
