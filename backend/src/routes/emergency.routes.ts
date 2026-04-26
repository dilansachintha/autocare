import { Router } from 'express';
import * as emergencyController from '../controllers/emergency.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/', authorize('customer'), emergencyController.createEmergency);
router.get('/', authorize('admin', 'mechanic'), emergencyController.getEmergencies);
router.put('/:id/assign', authorize('admin'), emergencyController.assignMechanic);
router.put('/:id/resolve', authorize('admin', 'mechanic'), emergencyController.resolveEmergency);

export default router;
