import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getStats } from '../controllers/statsController.js';

const router = Router();

router.use(requireAuth);
router.get('/', getStats);

export default router;
