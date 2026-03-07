import { Router } from 'express';
import { getClinics, getClinicById, createClinic } from '../controllers/clinicController';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.use(authenticate);

router.get('/', getClinics);
router.get('/:clinicId', getClinicById);
router.post('/', createClinic);

export default router;
