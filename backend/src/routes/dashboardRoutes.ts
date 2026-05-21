import { Router } from 'express';
import {
  getStudentDashboard,
  getInstructorDashboard,
  getAdminDashboard,
} from '../controllers/dashboardController';
import { protect, restrictTo } from '../middleware/authMiddleware';

const router = Router();

router.get('/student', protect, restrictTo('student'), getStudentDashboard);
router.get('/instructor', protect, restrictTo('instructor', 'admin'), getInstructorDashboard);
router.get('/admin', protect, restrictTo('admin'), getAdminDashboard);

export default router;
