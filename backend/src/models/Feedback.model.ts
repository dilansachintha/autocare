import mongoose, { Document, Schema } from 'mongoose';

export interface IFeedback extends Document {
  customer: mongoose.Types.ObjectId;
  appointment: mongoose.Types.ObjectId;
  mechanic?: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
  serviceQuality: number;
  timeliness: number;
  valueForMoney: number;
  createdAt: Date;
}

const feedbackSchema = new Schema<IFeedback>(
  {
    customer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    appointment: { type: Schema.Types.ObjectId, ref: 'Appointment', required: true, unique: true },
    mechanic: { type: Schema.Types.ObjectId, ref: 'User' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    serviceQuality: { type: Number, required: true, min: 1, max: 5 },
    timeliness: { type: Number, required: true, min: 1, max: 5 },
    valueForMoney: { type: Number, required: true, min: 1, max: 5 },
  },
  { timestamps: true }
);

export const Feedback = mongoose.model<IFeedback>('Feedback', feedbackSchema);
