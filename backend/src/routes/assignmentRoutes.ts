import { Router } from 'express';
import {
  getAssignments,
  getAssignmentById,
  createAssignment,
  submitAssignment,
  getStudentSubmissions,
  getAssignmentSubmissions,
  gradeSubmission,
} from '../controllers/assignmentController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.use(protect);

router.post('/', createAssignment);
router.get('/course/:courseId', getAssignments);
router.get('/submissions/student', getStudentSubmissions);
router.get('/:id', getAssignmentById);
router.post('/:id/submit', submitAssignment);
router.get('/:id/submissions', getAssignmentSubmissions);
router.post('/submissions/:id/grade', gradeSubmission);

export default router;
