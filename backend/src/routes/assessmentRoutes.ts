import { Router } from 'express';
import {
  createAssessment,
  getActiveAssessments,
  getAssessmentById,
  startAssessment,
  submitAssessment,
} from '../controllers/assessmentController';
import { protect, restrictTo } from '../middleware/authMiddleware';

const router = Router();

router.post('/', protect, restrictTo('instructor', 'admin'), createAssessment);
router.get('/active', protect, getActiveAssessments);
router.get('/:id', protect, getAssessmentById);
router.post('/:id/start', protect, startAssessment);
router.post('/:id/submit', protect, submitAssessment);

export default router;
