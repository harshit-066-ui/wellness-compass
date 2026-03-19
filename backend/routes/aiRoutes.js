import { Router } from 'express';
import { chat, generatePlan, getChatHistory } from '../controllers/aiController.js';

const router = Router();
router.post('/chat', chat);
router.post('/plan', generatePlan);
router.get('/history', getChatHistory);
export default router;
