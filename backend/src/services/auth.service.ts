import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User.model';
import { JWTPayload, UserRole } from '../types';
import { AppError } from '../middleware/errorHandler';

const generateToken = (user: IUser): string => {
  const payload: JWTPayload = {
    id: user._id.toString(),
    email: user.email,
    role: user.role as UserRole,
  };
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  } as jwt.SignOptions);
};

export const registerUser = async (data: {
  name: string;
  email: string;
  password: string;
  phone: string;
  role?: UserRole;
}): Promise<{ user: Partial<IUser>; token: string }> => {
  const existing = await User.findOne({ email: data.email });
  if (existing) throw new AppError('Email already registered', 400);

  const user = await User.create({
    name: data.name,
    email: data.email,
    password: data.password,
    phone: data.phone,
    role: data.role || 'customer',
  });

  const token = generateToken(user);
  const { password: _, ...userWithoutPassword } = user.toObject();

  return { user: userWithoutPassword, token };
};

export const loginUser = async (
  email: string,
  password: string
): Promise<{ user: Partial<IUser>; token: string }> => {
  const user = await User.findOne({ email }).select('+password');
  if (!user) throw new AppError('Invalid email or password', 401);
  if (!user.isActive) throw new AppError('Account is deactivated. Contact admin.', 401);

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new AppError('Invalid email or password', 401);

  const token = generateToken(user);
  const { password: _, ...userWithoutPassword } = user.toObject();

  return { user: userWithoutPassword, token };
};

export const getProfile = async (userId: string): Promise<IUser> => {
  const user = await User.findById(userId).populate('vehicles');
  if (!user) throw new AppError('User not found', 404);
  return user;
};

export const updateProfile = async (
  userId: string,
  data: Partial<IUser>
): Promise<IUser> => {
  const user = await User.findByIdAndUpdate(userId, data, { new: true, runValidators: true });
  if (!user) throw new AppError('User not found', 404);
  return user;
};

export const changePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<void> => {
  const user = await User.findById(userId).select('+password');
  if (!user) throw new AppError('User not found', 404);

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) throw new AppError('Current password is incorrect', 400);

  user.password = newPassword;
  await user.save();
};
