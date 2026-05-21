import { Router } from 'express';
import {
  getCourses,
  getInstructorCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  enroll,
  getEnrolledCourses,
  addModule,
  addLesson,
  uploadThumbnail,
  toggleLessonProgress,
  toggleLessonBookmark,
} from '../controllers/courseController';
import { protect, restrictTo } from '../middleware/authMiddleware';
import { upload } from '../middleware/uploadMiddleware';

const router = Router();

// Public routes
router.get('/', getCourses);
router.get('/:id', protect, getCourseById); // protected to attach enrollment & lesson completion states

// Student routes
router.post('/:id/enroll', protect, enroll);
router.get('/student/enrolled', protect, getEnrolledCourses);
router.post('/lessons/:lessonId/progress', protect, toggleLessonProgress);
router.post('/lessons/:lessonId/bookmark', protect, toggleLessonBookmark);

// Instructor routes
router.get('/instructor/my-courses', protect, restrictTo('instructor', 'admin'), getInstructorCourses);
router.post('/', protect, restrictTo('instructor', 'admin'), createCourse);
router.put('/:id', protect, restrictTo('instructor', 'admin'), updateCourse);
router.delete('/:id', protect, restrictTo('instructor', 'admin'), deleteCourse);
router.post('/:courseId/modules', protect, restrictTo('instructor', 'admin'), addModule);
router.post('/modules/:moduleId/lessons', protect, restrictTo('instructor', 'admin'), addLesson);
router.post('/upload-thumbnail', protect, restrictTo('instructor', 'admin'), upload.single('thumbnail'), uploadThumbnail);

export default router;
