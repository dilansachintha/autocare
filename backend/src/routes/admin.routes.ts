import { Router } from 'express';
import * as adminController from '../controllers/admin.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate, authorize('admin'));

router.get('/dashboard', adminController.getDashboard);
router.get('/users', adminController.getUsers);
router.put('/users/:id/toggle', adminController.toggleUserStatus);
router.post('/mechanics', adminController.createMechanic);
router.get('/analytics', adminController.getAnalytics);

export default router;
