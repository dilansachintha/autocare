import { Vehicle, IVehicle } from '../models/Vehicle.model';
import { User } from '../models/User.model';
import { AppError } from '../middleware/errorHandler';

export const createVehicle = async (ownerId: string, data: Partial<IVehicle>): Promise<IVehicle> => {
  const vehicle = await Vehicle.create({ ...data, owner: ownerId });
  await User.findByIdAndUpdate(ownerId, { $push: { vehicles: vehicle._id } });
  return vehicle;
};

export const getVehiclesByOwner = async (ownerId: string): Promise<IVehicle[]> => {
  return Vehicle.find({ owner: ownerId }).populate('serviceHistory');
};

export const getVehicleById = async (id: string, ownerId?: string): Promise<IVehicle> => {
  const filter: Record<string, unknown> = { _id: id };
  if (ownerId) filter.owner = ownerId;
  const vehicle = await Vehicle.findOne(filter).populate('owner', 'name email phone');
  if (!vehicle) throw new AppError('Vehicle not found', 404);
  return vehicle;
};

export const updateVehicle = async (
  id: string,
  ownerId: string,
  data: Partial<IVehicle>
): Promise<IVehicle> => {
  const vehicle = await Vehicle.findOneAndUpdate(
    { _id: id, owner: ownerId },
    data,
    { new: true, runValidators: true }
  );
  if (!vehicle) throw new AppError('Vehicle not found or not owned by you', 404);
  return vehicle;
};

export const deleteVehicle = async (id: string, ownerId: string): Promise<void> => {
  const vehicle = await Vehicle.findOneAndDelete({ _id: id, owner: ownerId });
  if (!vehicle) throw new AppError('Vehicle not found or not owned by you', 404);
  await User.findByIdAndUpdate(ownerId, { $pull: { vehicles: id } });
};

export const getAllVehicles = async (page = 1, limit = 20, search = '') => {
  const filter: Record<string, unknown> = {};
  if (search) {
    filter.$or = [
      { make: { $regex: search, $options: 'i' } },
      { model: { $regex: search, $options: 'i' } },
      { licensePlate: { $regex: search, $options: 'i' } },
    ];
  }
  const skip = (page - 1) * limit;
  const [vehicles, total] = await Promise.all([
    Vehicle.find(filter).populate('owner', 'name email phone').sort({ createdAt: -1 }).skip(skip).limit(limit),
    Vehicle.countDocuments(filter),
  ]);
  return { vehicles, total, pages: Math.ceil(total / limit) };
};
