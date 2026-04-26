import mongoose, { Document, Schema } from 'mongoose';

export interface IAppointment extends Document {
  customer: mongoose.Types.ObjectId;
  vehicle: mongoose.Types.ObjectId;
  mechanic?: mongoose.Types.ObjectId;
  services: {
    serviceType: string;
    description: string;
    estimatedCost: number;
    actualCost?: number;
    status: 'pending' | 'in_progress' | 'completed';
  }[];
  scheduledDate: Date;
  scheduledTime: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'normal' | 'urgent' | 'emergency';
  notes?: string;
  mechanicNotes?: string;
  totalEstimatedCost: number;
  totalActualCost?: number;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentId?: string;
  progressUpdates: {
    message: string;
    timestamp: Date;
    updatedBy: mongoose.Types.ObjectId;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const appointmentSchema = new Schema<IAppointment>(
  {
    customer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    vehicle: { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    mechanic: { type: Schema.Types.ObjectId, ref: 'User' },
    services: [
      {
        serviceType: { type: String, required: true },
        description: { type: String },
        estimatedCost: { type: Number, required: true },
        actualCost: { type: Number },
        status: { type: String, enum: ['pending', 'in_progress', 'completed'], default: 'pending' },
      },
    ],
    scheduledDate: { type: Date, required: true },
    scheduledTime: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'],
      default: 'pending',
    },
    priority: { type: String, enum: ['normal', 'urgent', 'emergency'], default: 'normal' },
    notes: { type: String },
    mechanicNotes: { type: String },
    totalEstimatedCost: { type: Number, required: true },
    totalActualCost: { type: Number },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentId: { type: String },
    progressUpdates: [
      {
        message: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
      },
    ],
  },
  { timestamps: true }
);

export const Appointment = mongoose.model<IAppointment>('Appointment', appointmentSchema);
