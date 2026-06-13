import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { listHabits, createHabit, getHabit, updateHabit, deleteHabit } from '../controllers/habitController.js';
import { listHabitLogs, toggleHabitLog, getCalendarLogs } from '../controllers/habitLogController.js';

const router = Router();

router.use(requireAuth);

router.get('/', listHabits);
router.post('/', createHabit);
router.get('/logs/calendar', getCalendarLogs);
router.get('/:id', getHabit);
router.put('/:id', updateHabit);
router.delete('/:id', deleteHabit);
router.get('/:id/logs', listHabitLogs);
router.post('/:id/logs', toggleHabitLog);

export default router;
