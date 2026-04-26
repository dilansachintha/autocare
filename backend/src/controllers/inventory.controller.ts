import { Response, NextFunction } from 'express';
import * as inventoryService from '../services/inventory.service';
import { AuthRequest } from '../types';

export const getInventory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page, limit, search, status } = req.query;
    const result = await inventoryService.getAllInventory(
      Number(page) || 1, Number(limit) || 20, search as string, status as string
    );
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
};

export const createItem = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const item = await inventoryService.createInventoryItem(req.body);
    res.status(201).json({ success: true, message: 'Item added', data: item });
  } catch (error) { next(error); }
};

export const updateItem = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const item = await inventoryService.updateInventoryItem(req.params.id, req.body);
    res.json({ success: true, message: 'Item updated', data: item });
  } catch (error) { next(error); }
};

export const deleteItem = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await inventoryService.deleteInventoryItem(req.params.id);
    res.json({ success: true, message: 'Item deleted' });
  } catch (error) { next(error); }
};

export const getLowStock = async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const items = await inventoryService.getLowStockItems();
    res.json({ success: true, data: items });
  } catch (error) { next(error); }
};

export const restockItem = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const item = await inventoryService.restockItem(req.params.id, req.body.quantity);
    res.json({ success: true, message: 'Item restocked', data: item });
  } catch (error) { next(error); }
};

export const getStats = async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const stats = await inventoryService.getInventoryStats();
    res.json({ success: true, data: stats });
  } catch (error) { next(error); }
};
