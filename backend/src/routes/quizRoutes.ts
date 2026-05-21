import { Router } from 'express';
import {
  getQuizByModule,
  getQuizById,
  createQuiz,
  submitAttempt,
  getAttempts,
} from '../controllers/quizController';
import { protect, restrictTo } from '../middleware/authMiddleware';

const router = Router();

router.get('/module/:moduleId', protect, getQuizByModule);
router.get('/:id', protect, getQuizById);
router.post('/', protect, restrictTo('instructor', 'admin'), createQuiz);
router.post('/:id/submit', protect, submitAttempt);
router.get('/:id/attempts', protect, getAttempts);

export default router;
