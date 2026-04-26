import { Notification } from '../models/Notification.model';
import nodemailer from 'nodemailer';

interface NotifyPayload {
  title: string;
  message: string;
  type: 'appointment' | 'payment' | 'service' | 'emergency' | 'system' | 'message';
  relatedId?: string;
}

export const notifyUser = async (userId: string, payload: NotifyPayload): Promise<void> => {
  await Notification.create({
    recipient: userId,
    title: payload.title,
    message: payload.message,
    type: payload.type,
    relatedId: payload.relatedId,
  });
};

export const getNotifications = async (userId: string, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find({ recipient: userId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Notification.countDocuments({ recipient: userId }),
    Notification.countDocuments({ recipient: userId, isRead: false }),
  ]);
  return { notifications, total, unreadCount, pages: Math.ceil(total / limit) };
};

export const markAsRead = async (notificationId: string, userId: string): Promise<void> => {
  await Notification.updateOne(
    { _id: notificationId, recipient: userId },
    { isRead: true }
  );
};

export const markAllAsRead = async (userId: string): Promise<void> => {
  await Notification.updateMany({ recipient: userId, isRead: false }, { isRead: true });
};

// Email notification via Nodemailer (Free with Gmail SMTP)
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: Number.parseInt(process.env.EMAIL_PORT || '587', 10),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const hasValidEmailConfig = (): boolean => {
  const emailUser = process.env.EMAIL_USER?.trim();
  const emailPass = process.env.EMAIL_PASS?.trim();

  if (!emailUser || !emailPass) {
    return false;
  }

  // Ignore template/default placeholder values from sample env files.
  const invalidTokens = new Set(['your_gmail@gmail.com', 'your_gmail_app_password']);
  if (invalidTokens.has(emailUser) || invalidTokens.has(emailPass)) {
    return false;
  }

  return true;
};

export const sendEmail = async (
  to: string,
  subject: string,
  html: string
): Promise<void> => {
  if (!hasValidEmailConfig()) {
    console.log(`📧 Email skipped (no config): To: ${to}, Subject: ${subject}`);
    return;
  }
  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'AUTO CARE <noreply@autocare.com>',
      to,
      subject,
      html,
    });
    console.log(`📧 Email sent to ${to}`);
  } catch (error) {
    console.error('Email send error:', error);
  }
};

// Free SMS via TextBelt (1 free SMS/day, no signup)
export const sendSMS = async (phone: string, message: string): Promise<void> => {
  try {
    const key = process.env.TEXTBELT_KEY || 'textbelt';
    const response = await fetch('https://textbelt.com/text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, message, key }),
    });
    const data = await response.json() as { success: boolean; error?: string };
    if (data.success) {
      console.log(`📱 SMS sent to ${phone}`);
    } else {
      console.log(`📱 SMS failed: ${data.error} (Free tier: 1 SMS/day)`);
    }
  } catch (error) {
    console.error('SMS send error:', error);
  }
};

export const sendAppointmentConfirmationEmail = async (
  customerEmail: string,
  customerName: string,
  appointmentDate: string,
  appointmentTime: string
): Promise<void> => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #1a1a2e; padding: 20px; text-align: center;">
        <h1 style="color: #f5a623; margin: 0;">🚗 AUTO CARE</h1>
      </div>
      <div style="padding: 30px; background: #f9f9f9;">
        <h2>Appointment Confirmed!</h2>
        <p>Dear <strong>${customerName}</strong>,</p>
        <p>Your vehicle service appointment has been successfully booked.</p>
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f5a623;">
          <p><strong>📅 Date:</strong> ${appointmentDate}</p>
          <p><strong>🕐 Time:</strong> ${appointmentTime}</p>
        </div>
        <p>We'll notify you when a mechanic is assigned to your vehicle.</p>
        <p>Thank you for choosing AUTO CARE!</p>
      </div>
      <div style="background: #1a1a2e; padding: 15px; text-align: center;">
        <p style="color: #888; margin: 0; font-size: 12px;">© 2024 AUTO CARE. All rights reserved.</p>
      </div>
    </div>
  `;
  await sendEmail(customerEmail, 'Appointment Confirmed - AUTO CARE', html);
};

const renderEmailLayout = (heading: string, body: string): string => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="background: #1a1a2e; padding: 20px; text-align: center;">
      <h1 style="color: #f5a623; margin: 0;">AUTO CARE</h1>
    </div>
    <div style="padding: 24px; background: #f9f9f9;">
      <h2 style="margin-top: 0;">${heading}</h2>
      ${body}
    </div>
    <div style="background: #1a1a2e; padding: 12px; text-align: center;">
      <p style="color: #aaa; margin: 0; font-size: 12px;">AUTO CARE Notifications</p>
    </div>
  </div>
`;

export const sendAppointmentStatusEmail = async (
  customerEmail: string,
  customerName: string,
  status: string,
  note?: string
): Promise<void> => {
  const body = `
    <p>Hi <strong>${customerName}</strong>,</p>
    <p>Your appointment status has been updated to <strong>${status}</strong>.</p>
    ${note ? `<p><strong>Update:</strong> ${note}</p>` : ''}
    <p>Thank you for using AUTO CARE.</p>
  `;
  await sendEmail(
    customerEmail,
    `Appointment ${status} - AUTO CARE`,
    renderEmailLayout('Appointment Status Update', body)
  );
};

export const sendMechanicAssignedEmail = async (
  customerEmail: string,
  customerName: string,
  mechanicName: string
): Promise<void> => {
  const body = `
    <p>Hi <strong>${customerName}</strong>,</p>
    <p>Your appointment is now confirmed.</p>
    <p><strong>${mechanicName}</strong> has been assigned to your service request.</p>
    <p>We will keep you updated as work progresses.</p>
  `;
  await sendEmail(
    customerEmail,
    'Mechanic Assigned - AUTO CARE',
    renderEmailLayout('Mechanic Assigned', body)
  );
};

export const sendAppointmentCancelledEmail = async (
  customerEmail: string,
  customerName: string
): Promise<void> => {
  const body = `
    <p>Hi <strong>${customerName}</strong>,</p>
    <p>Your appointment has been cancelled.</p>
    <p>If this was a mistake, please book a new slot from your dashboard.</p>
  `;
  await sendEmail(
    customerEmail,
    'Appointment Cancelled - AUTO CARE',
    renderEmailLayout('Appointment Cancelled', body)
  );
};

export const sendPaymentSuccessEmail = async (
  customerEmail: string,
  customerName: string,
  amount: number
): Promise<void> => {
  const body = `
    <p>Hi <strong>${customerName}</strong>,</p>
    <p>We have received your payment successfully.</p>
    <p><strong>Amount:</strong> LKR ${amount.toFixed(2)}</p>
    <p>Thank you for your payment.</p>
  `;
  await sendEmail(
    customerEmail,
    'Payment Successful - AUTO CARE',
    renderEmailLayout('Payment Received', body)
  );
};
