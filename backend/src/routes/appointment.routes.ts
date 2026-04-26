import { Router } from 'express';
import * as appointmentController from '../controllers/appointment.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/slots', appointmentController.getAvailableSlots);
router.post('/', authorize('customer'), appointmentController.createAppointment);
router.get('/my', authorize('customer'), appointmentController.getMyAppointments);
router.get('/mechanic', authorize('mechanic'), appointmentController.getMechanicAppointments);
router.get('/', authorize('admin'), appointmentController.getAllAppointments);
router.get('/:id', appointmentController.getAppointmentById);
router.put('/:id/status', authorize('mechanic', 'admin'), appointmentController.updateStatus);
router.put('/:id/assign', authorize('admin'), appointmentController.assignMechanic);
router.put('/:id/cancel', appointmentController.cancelAppointment);

export default router;
