import { Router } from 'express';
import { getHabits, updateHabit } from '../controllers/habitController.js';

const router = Router();
router.get('/', getHabits);
router.patch('/:id', updateHabit);
export default router;
