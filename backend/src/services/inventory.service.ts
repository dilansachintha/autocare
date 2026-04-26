import { Inventory, IInventory } from '../models/Inventory.model';
import { AppError } from '../middleware/errorHandler';

export const getAllInventory = async (
  page = 1,
  limit = 20,
  search = '',
  status = ''
) => {
  const filter: Record<string, unknown> = {};
  if (search) filter.name = { $regex: search, $options: 'i' };
  if (status) filter.status = status;

  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Inventory.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Inventory.countDocuments(filter),
  ]);
  return { items, total, pages: Math.ceil(total / limit) };
};

export const createInventoryItem = async (data: Partial<IInventory>): Promise<IInventory> => {
  const existing = await Inventory.findOne({ sku: data.sku });
  if (existing) throw new AppError('SKU already exists', 400);
  return Inventory.create(data);
};

export const updateInventoryItem = async (
  id: string,
  data: Partial<IInventory>
): Promise<IInventory> => {
  const item = await Inventory.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!item) throw new AppError('Inventory item not found', 404);
  return item;
};

export const deleteInventoryItem = async (id: string): Promise<void> => {
  const item = await Inventory.findByIdAndDelete(id);
  if (!item) throw new AppError('Inventory item not found', 404);
};

export const getLowStockItems = async (): Promise<IInventory[]> => {
  return Inventory.find({ status: { $in: ['low_stock', 'out_of_stock'] } }).sort({ quantity: 1 });
};

export const restockItem = async (id: string, quantity: number): Promise<IInventory> => {
  const item = await Inventory.findById(id);
  if (!item) throw new AppError('Inventory item not found', 404);
  item.quantity += quantity;
  item.lastRestocked = new Date();
  await item.save();
  return item;
};

export const getInventoryStats = async () => {
  const [total, inStock, lowStock, outOfStock] = await Promise.all([
    Inventory.countDocuments(),
    Inventory.countDocuments({ status: 'in_stock' }),
    Inventory.countDocuments({ status: 'low_stock' }),
    Inventory.countDocuments({ status: 'out_of_stock' }),
  ]);
  const totalValue = await Inventory.aggregate([
    { $group: { _id: null, total: { $sum: { $multiply: ['$quantity', '$unitPrice'] } } } },
  ]);
  return {
    total,
    inStock,
    lowStock,
    outOfStock,
    totalValue: totalValue[0]?.total || 0,
  };
};
