import { Router } from 'express';
import { getProblems, getProblemById, runCode, submitCode, submitCodeAsync, getSubmissionStatus, askTutor, reviewCode } from '../controllers/codingController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// Protect all routes
router.use(protect);

router.get('/problems', getProblems);
router.get('/problems/:id', getProblemById);
router.post('/problems/:id/run', runCode);
router.post('/problems/:id/submit', submitCode);
router.post('/problems/:id/submit-async', submitCodeAsync);
router.get('/submissions/:jobId/status', getSubmissionStatus);
router.post('/tutor/ask', askTutor);
router.post('/problems/:id/review', reviewCode);

export default router;
