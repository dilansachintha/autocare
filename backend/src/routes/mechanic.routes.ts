import { Router } from 'express';
import * as mechanicController from '../controllers/mechanic.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', authorize('admin'), mechanicController.getAllMechanics);
router.get('/stats', authorize('mechanic'), mechanicController.getMechanicStats);
router.get('/:id/stats', authorize('admin'), mechanicController.getMechanicStats);

export default router;
