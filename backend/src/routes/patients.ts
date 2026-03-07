import { Router } from 'express';
import {
  getPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
  transferPatient,
} from '../controllers/patientController';
import { authenticate } from '../middlewares/auth';
import { checkPermission } from '../middlewares/permissions';
import { Permission } from '../types';

const router = Router();

router.use(authenticate);

router.get('/clinic/:clinicId', checkPermission(Permission.VIEW_PATIENTS), getPatients);
router.get('/:patientId', checkPermission(Permission.VIEW_PATIENTS), getPatientById);
router.post('/clinic/:clinicId', checkPermission(Permission.ADD_PATIENTS), createPatient);
router.put('/:patientId', checkPermission(Permission.EDIT_PATIENTS), updatePatient);
router.delete('/:patientId', checkPermission(Permission.DELETE_PATIENTS), deletePatient);
router.post('/:patientId/transfer', checkPermission(Permission.TRANSFER_PATIENTS), transferPatient);

export default router;
