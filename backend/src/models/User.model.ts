import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password: string;
  phone: string;
  role: 'customer' | 'mechanic' | 'admin';
  avatar?: string;
  isActive: boolean;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  vehicles?: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    phone: { type: String, required: true },
    role: { type: String, enum: ['customer', 'mechanic', 'admin'], default: 'customer' },
    avatar: { type: String },
    isActive: { type: Boolean, default: true },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
    },
    vehicles: [{ type: Schema.Types.ObjectId, ref: 'Vehicle' }],
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>('User', userSchema);
