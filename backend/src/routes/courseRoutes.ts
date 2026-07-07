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
  uploadVideo,
  toggleLessonProgress,
  toggleLessonBookmark,
  updateLesson,
  deleteLesson,
  updateModule,
  deleteModule,
} from '../controllers/courseController';
import { protect, restrictTo } from '../middleware/authMiddleware';
import { upload } from '../middleware/uploadMiddleware';

const router = Router();

// ===== IMPORTANT: Static routes MUST come before parameterized routes ====
// to prevent Express from matching e.g. 'upload-video' as /:id

// Public
router.get('/', getCourses);
router.post('/', protect, restrictTo('instructor', 'admin'), createCourse);

// Instructor upload routes (static paths first!)
router.post('/upload-thumbnail', protect, restrictTo('instructor', 'admin'), upload.single('thumbnail'), uploadThumbnail);
router.post('/upload-video', protect, restrictTo('instructor', 'admin'), upload.single('video'), uploadVideo);

// Instructor-specific listing routes
router.get('/instructor/my-courses', protect, restrictTo('instructor', 'admin'), getInstructorCourses);
router.get('/student/enrolled', protect, getEnrolledCourses);

// Lesson progress/bookmark routes (static prefix 'lessons/')
router.post('/lessons/:lessonId/progress', protect, toggleLessonProgress);
router.post('/lessons/:lessonId/bookmark', protect, toggleLessonBookmark);

// Module & Lesson management (static prefixes / PUT / DELETE)
router.put('/lessons/:lessonId', protect, restrictTo('instructor', 'admin'), updateLesson);
router.delete('/lessons/:lessonId', protect, restrictTo('instructor', 'admin'), deleteLesson);
router.put('/modules/:moduleId', protect, restrictTo('instructor', 'admin'), updateModule);
router.delete('/modules/:moduleId', protect, restrictTo('instructor', 'admin'), deleteModule);

// Module & Lesson creation (param: moduleId)
router.post('/modules/:moduleId/lessons', protect, restrictTo('instructor', 'admin'), addLesson);

// Parameterized course routes (must come LAST among same-level routes)
router.get('/:id', protect, getCourseById); // protected to attach enrollment & lesson completion states
router.post('/:id/enroll', protect, enroll);
router.put('/:id', protect, restrictTo('instructor', 'admin'), updateCourse);
router.delete('/:id', protect, restrictTo('instructor', 'admin'), deleteCourse);
router.post('/:courseId/modules', protect, restrictTo('instructor', 'admin'), addModule);

export default router;
