import { Router, Request, Response, NextFunction } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { Appointment } from '../models/Appointment.model';
import { notifyUser } from '../services/notification.service';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../types';

const router = Router();

router.use(authenticate);

// Create payment intent (Stripe sandbox)
router.post('/create-intent', authorize('customer'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { appointmentId } = req.body;
    const appointment = await Appointment.findOne({ _id: appointmentId, customer: req.user!.id });
    if (!appointment) throw new AppError('Appointment not found', 404);
    if (appointment.paymentStatus === 'paid') throw new AppError('Already paid', 400);

    const amount = appointment.totalActualCost || appointment.totalEstimatedCost;

    // NOTE: In production, create Stripe PaymentIntent here
    // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    // const intent = await stripe.paymentIntents.create({ amount: amount * 100, currency: 'lkr' });

    // For sandbox/demo: simulate payment intent
    const mockClientSecret = `pi_mock_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`;

    res.json({
      success: true,
      data: {
        clientSecret: mockClientSecret,
        amount,
        currency: 'LKR',
        appointmentId,
      },
    });
  } catch (error) { next(error); }
});

// Confirm payment (called after successful Stripe payment)
router.post('/confirm', authorize('customer'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { appointmentId, paymentIntentId } = req.body;
    const appointment = await Appointment.findOne({ _id: appointmentId, customer: req.user!.id });
    if (!appointment) throw new AppError('Appointment not found', 404);

    appointment.paymentStatus = 'paid';
    appointment.paymentId = paymentIntentId;
    appointment.totalActualCost = appointment.totalActualCost || appointment.totalEstimatedCost;
    await appointment.save();

    await notifyUser(req.user!.id, {
      title: 'Payment Successful',
      message: `Payment of LKR ${appointment.totalActualCost} has been received.`,
      type: 'payment',
      relatedId: appointmentId,
    });

    res.json({ success: true, message: 'Payment confirmed', data: appointment });
  } catch (error) { next(error); }
});

// Get payment history
router.get('/history', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const filter: Record<string, unknown> = { paymentStatus: 'paid' };
    if (req.user!.role === 'customer') filter.customer = req.user!.id;

    const payments = await Appointment.find(filter)
      .populate('customer', 'name email')
      .populate('vehicle', 'make model licensePlate')
      .select('totalActualCost paymentStatus paymentId scheduledDate services customer vehicle createdAt')
      .sort({ updatedAt: -1 });

    res.json({ success: true, data: payments });
  } catch (error) { next(error); }
});

export default router;
