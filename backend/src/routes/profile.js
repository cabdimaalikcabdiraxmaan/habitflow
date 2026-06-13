import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getProfile, updateProfile, deleteAccount } from '../controllers/profileController.js';

const router = Router();

router.use(requireAuth);
router.get('/', getProfile);
router.put('/', updateProfile);
router.delete('/', deleteAccount);

export default router;
