import mongoose, { Schema } from 'mongoose';

export interface IVehicle {
  owner: mongoose.Types.ObjectId;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  vin?: string;
  color?: string;
  mileage?: number;
  fuelType: 'petrol' | 'diesel' | 'electric' | 'hybrid';
  transmission: 'manual' | 'automatic';
  serviceHistory: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const vehicleSchema = new Schema<IVehicle>(
  {
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    make: { type: String, required: true },
    model: { type: String, required: true },
    year: { type: Number, required: true },
    licensePlate: { type: String, required: true, unique: true, uppercase: true },
    vin: { type: String },
    color: { type: String },
    mileage: { type: Number, default: 0 },
    fuelType: { type: String, enum: ['petrol', 'diesel', 'electric', 'hybrid'], default: 'petrol' },
    transmission: { type: String, enum: ['manual', 'automatic'], default: 'manual' },
    serviceHistory: [{ type: Schema.Types.ObjectId, ref: 'Appointment' }],
  },
  { timestamps: true }
);

export const Vehicle = mongoose.model<IVehicle>('Vehicle', vehicleSchema);
