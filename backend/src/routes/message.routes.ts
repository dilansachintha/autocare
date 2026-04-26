import { Router } from 'express';
import * as messageController from '../controllers/message.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/', messageController.sendMessage);
router.get('/conversations', messageController.getConversations);
router.get('/conversation/:userId', messageController.getConversation);

export default router;
