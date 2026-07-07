import { Router } from 'express';
import {
  createDailyQuiz,
  getDailyQuiz,
  attemptDailyQuiz,
} from '../controllers/dailyQuizController';
import { protect, restrictTo } from '../middleware/authMiddleware';

const router = Router();

router.post('/', protect, restrictTo('instructor', 'admin'), createDailyQuiz);
router.get('/today', protect, getDailyQuiz);
router.post('/:id/submit', protect, attemptDailyQuiz);

export default router;
