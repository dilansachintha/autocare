import mongoose, { Document, Schema } from 'mongoose';

export interface IInventory extends Document {
  name: string;
  category: string;
  sku: string;
  quantity: number;
  minStockLevel: number;
  unitPrice: number;
  supplier?: string;
  location?: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  lastRestocked?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const inventorySchema = new Schema<IInventory>(
  {
    name: { type: String, required: true },
    category: { type: String, required: true },
    sku: { type: String, required: true, unique: true, uppercase: true },
    quantity: { type: Number, required: true, default: 0 },
    minStockLevel: { type: Number, required: true, default: 10 },
    unitPrice: { type: Number, required: true },
    supplier: { type: String },
    location: { type: String },
    status: { type: String, enum: ['in_stock', 'low_stock', 'out_of_stock'], default: 'in_stock' },
    lastRestocked: { type: Date },
  },
  { timestamps: true }
);

// Auto-update status before save
inventorySchema.pre('save', function (next) {
  if (this.quantity === 0) {
    this.status = 'out_of_stock';
  } else if (this.quantity <= this.minStockLevel) {
    this.status = 'low_stock';
  } else {
    this.status = 'in_stock';
  }
  next();
});

export const Inventory = mongoose.model<IInventory>('Inventory', inventorySchema);
