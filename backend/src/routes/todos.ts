import { Router } from 'express';
import { createTodo, updateTodo, deleteTodo } from '../controllers/todoController';
import { authenticate } from '../middlewares/auth';
import { checkPermission } from '../middlewares/permissions';
import { Permission } from '../types';

const router = Router();

router.use(authenticate);

router.post('/patient/:patientId', checkPermission(Permission.MANAGE_TODOS), createTodo);
router.put('/:todoId', checkPermission(Permission.MANAGE_TODOS), updateTodo);
router.delete('/:todoId', checkPermission(Permission.MANAGE_TODOS), deleteTodo);

export default router;
