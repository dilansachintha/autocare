import { Router } from 'express';
import * as inventoryController from '../controllers/inventory.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', inventoryController.getInventory);
router.get('/low-stock', authorize('admin'), inventoryController.getLowStock);
router.get('/stats', authorize('admin'), inventoryController.getStats);
router.post('/', authorize('admin'), inventoryController.createItem);
router.put('/:id', authorize('admin'), inventoryController.updateItem);
router.put('/:id/restock', authorize('admin'), inventoryController.restockItem);
router.delete('/:id', authorize('admin'), inventoryController.deleteItem);

export default router;
