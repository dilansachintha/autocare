import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/vehicles', authorize('customer'), userController.getMyVehicles);
router.post('/vehicles', authorize('customer'), userController.addVehicle);
router.put('/vehicles/:id', authorize('customer'), userController.updateVehicle);
router.delete('/vehicles/:id', authorize('customer'), userController.deleteVehicle);
router.get('/all-vehicles', authorize('admin'), userController.getAllVehicles);

export default router;
