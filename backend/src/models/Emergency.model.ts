import mongoose, { Document, Schema } from 'mongoose';

export interface IEmergency extends Document {
  customer: mongoose.Types.ObjectId;
  vehicle?: mongoose.Types.ObjectId;
  description: string;
  location: string;
  phone: string;
  status: 'open' | 'assigned' | 'resolved';
  assignedMechanic?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const emergencySchema = new Schema<IEmergency>(
  {
    customer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    vehicle: { type: Schema.Types.ObjectId, ref: 'Vehicle' },
    description: { type: String, required: true },
    location: { type: String, required: true },
    phone: { type: String, required: true },
    status: { type: String, enum: ['open', 'assigned', 'resolved'], default: 'open' },
    assignedMechanic: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export const Emergency = mongoose.model<IEmergency>('Emergency', emergencySchema);
