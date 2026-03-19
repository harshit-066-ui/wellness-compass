import { Router } from 'express';
import { submitSurvey, getSurveyHistory } from '../controllers/surveyController.js';

const router = Router();
router.post('/', submitSurvey);
router.get('/history', getSurveyHistory);
export default router;
