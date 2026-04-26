import { Router } from 'express';
import * as feedbackController from '../controllers/feedback.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/', authorize('customer'), feedbackController.submitFeedback);
router.get('/', feedbackController.getAllFeedback);

export default router;
