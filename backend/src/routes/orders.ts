import { Router } from 'express';
import { createOrder, updateOrder, deleteOrder } from '../controllers/orderController';
import { authenticate } from '../middlewares/auth';
import { checkPermission } from '../middlewares/permissions';
import { Permission } from '../types';

const router = Router();

router.use(authenticate);

router.post('/patient/:patientId', checkPermission(Permission.MANAGE_ORDERS), createOrder);
router.put('/:orderId', checkPermission(Permission.MANAGE_ORDERS), updateOrder);
router.delete('/:orderId', checkPermission(Permission.MANAGE_ORDERS), deleteOrder);

export default router;
