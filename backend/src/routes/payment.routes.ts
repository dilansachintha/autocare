import { Router, Response, NextFunction, Request } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { Appointment } from '../models/Appointment.model';
import { notifyUser, sendPaymentSuccessEmail } from '../services/notification.service';
import { User } from '../models/User.model';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../types';
import Stripe from 'stripe';

const router = Router();

const getStripeClient = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY || '';
  const hasKey = secretKey.startsWith('sk_') && !secretKey.includes('your_stripe_test_key');
  return hasKey ? new Stripe(secretKey) : null;
};

const getStripeWebhookSecret = () => process.env.STRIPE_WEBHOOK_SECRET || '';

const markAppointmentAsPaid = async (appointmentId: string, paymentId: string, amount?: number, customerId?: string) => {
  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) return;
  if (appointment.paymentStatus === 'paid') return;

  appointment.paymentStatus = 'paid';
  appointment.paymentId = paymentId;
  if (typeof amount === 'number' && amount > 0) {
    appointment.totalActualCost = amount;
  } else {
    appointment.totalActualCost = appointment.totalActualCost || appointment.totalEstimatedCost;
  }
  await appointment.save();

  if (customerId) {
    await notifyUser(customerId, {
      title: 'Payment Successful',
      message: `Payment of LKR ${appointment.totalActualCost} has been received.`,
      type: 'payment',
      relatedId: appointmentId,
    });

    const customer = await User.findById(customerId).select('name email');
    if (customer?.email) {
      await sendPaymentSuccessEmail(
        customer.email,
        customer.name,
        Number(appointment.totalActualCost || 0)
      );
    }
  }
};

export const stripeWebhookHandler = async (req: Request, res: Response) => {
  const stripe = getStripeClient();
  const stripeWebhookSecret = getStripeWebhookSecret();

  if (!stripe) {
    res.status(200).json({ received: true, skipped: 'Stripe not configured' });
    return;
  }

  if (!stripeWebhookSecret || stripeWebhookSecret.includes('your_webhook_secret')) {
    res.status(400).json({ success: false, message: 'Stripe webhook secret is not configured' });
    return;
  }

  const signature = req.headers['stripe-signature'];
  if (!signature || Array.isArray(signature)) {
    res.status(400).json({ success: false, message: 'Missing Stripe signature' });
    return;
  }

  let event: any;
  try {
    event = stripe.webhooks.constructEvent(req.body, signature, stripeWebhookSecret);
  } catch (error: any) {
    res.status(400).json({ success: false, message: `Webhook signature verification failed: ${error.message}` });
    return;
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const appointmentId = session.metadata?.appointmentId;
    const customerId = session.metadata?.customerId;
    if (appointmentId && session.payment_status === 'paid') {
      const amount = typeof session.amount_total === 'number' ? session.amount_total / 100 : undefined;
      await markAppointmentAsPaid(
        appointmentId,
        typeof session.payment_intent === 'string' ? session.payment_intent : session.id,
        amount,
        customerId
      );
    }
  }

  res.status(200).json({ received: true });
};

router.use(authenticate);

// Create hosted checkout session (Stripe redirect)
router.post('/create-checkout-session', authorize('customer'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const stripe = getStripeClient();
    const { appointmentId, successUrl, cancelUrl } = req.body;
    const appointment = await Appointment.findOne({ _id: appointmentId, customer: req.user!.id });
    if (!appointment) throw new AppError('Appointment not found', 404);
    if (appointment.paymentStatus === 'paid') throw new AppError('Already paid', 400);

    const amount = appointment.totalActualCost || appointment.totalEstimatedCost;
    if (!successUrl || !cancelUrl) throw new AppError('Missing checkout redirect URLs', 400);
    if (!stripe) throw new AppError('Stripe is not configured. Please set STRIPE_SECRET_KEY.', 500);

    const successUrlWithSession = `${successUrl}${successUrl.includes('?') ? '&' : '?'}session_id={CHECKOUT_SESSION_ID}`;

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `AUTO CARE service payment (${appointment._id.toString().slice(-6).toUpperCase()})`,
            },
            unit_amount: Math.round(Number(amount) * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        appointmentId: appointment._id.toString(),
        customerId: req.user!.id,
      },
      success_url: successUrlWithSession,
      cancel_url: cancelUrl,
    });

    res.json({
      success: true,
      data: {
        checkoutUrl: session.url,
        sessionId: session.id,
        amount,
        currency: 'USD',
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
    await markAppointmentAsPaid(appointmentId, paymentIntentId, undefined, req.user!.id);
    const updated = await Appointment.findById(appointmentId);
    res.json({ success: true, message: 'Payment confirmed', data: updated });
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
