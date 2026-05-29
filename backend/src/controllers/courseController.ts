import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { courseService } from '../services/courseService';
import { cloudinaryService } from '../services/cloudinaryService';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { BadRequestError } from '../utils/customErrors';
import { createCourseSchema, createModuleSchema, createLessonSchema } from '../validators/courseValidator';

export const getCourses = asyncHandler(async (req, res: Response) => {
  const courses = await courseService.getCourses(req.query);
  res.status(200).json(ApiResponse.success(courses, 'Courses fetched successfully'));
});

export const getInstructorCourses = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) throw new BadRequestError('User context missing');
  const courses = await courseService.getInstructorCourses(req.user.id);
  res.status(200).json(ApiResponse.success(courses, 'Instructor courses fetched successfully'));
});

export const getCourseById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  // studentId is optional for public viewing but useful to attach progress
  const studentId = req.user?.id;
  const course = await courseService.getCourseById(req.params.id, studentId);
  res.status(200).json(ApiResponse.success(course, 'Course details fetched successfully'));
});

export const createCourse = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) throw new BadRequestError('User context missing');
  
  const parsed = createCourseSchema.safeParse(req.body);
  if (!parsed.success) throw parsed.error;

  const course = await courseService.createCourse(req.user.id, parsed.data);
  res.status(201).json(ApiResponse.success(course, 'Course created successfully'));
});

export const updateCourse = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) throw new BadRequestError('User context missing');
  const course = await courseService.updateCourse(req.params.id, req.user.id, req.body, req.user.role);
  res.status(200).json(ApiResponse.success(course, 'Course updated successfully'));
});

export const deleteCourse = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) throw new BadRequestError('User context missing');
  await courseService.deleteCourse(req.params.id, req.user.id, req.user.role);
  res.status(200).json(ApiResponse.success(null, 'Course deleted successfully'));
});

export const enroll = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) throw new BadRequestError('User context missing');
  const enrollment = await courseService.enroll(req.user.id, req.params.id);
  res.status(200).json(ApiResponse.success(enrollment, 'Enrolled in course successfully'));
});

export const getEnrolledCourses = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) throw new BadRequestError('User context missing');
  const enrolled = await courseService.getEnrolledCourses(req.user.id);
  res.status(200).json(ApiResponse.success(enrolled, 'Enrolled courses fetched successfully'));
});

export const addModule = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) throw new BadRequestError('User context missing');
  
  const parsed = createModuleSchema.safeParse(req.body);
  if (!parsed.success) throw parsed.error;

  const mod = await courseService.addModule(req.params.courseId, req.user.id, parsed.data, req.user.role);
  res.status(201).json(ApiResponse.success(mod, 'Module added successfully'));
});

export const addLesson = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) throw new BadRequestError('User context missing');
  
  const parsed = createLessonSchema.safeParse(req.body);
  if (!parsed.success) throw parsed.error;

  const lesson = await courseService.addLesson(req.params.moduleId, req.user.id, parsed.data, req.user.role);
  res.status(201).json(ApiResponse.success(lesson, 'Lesson added successfully'));
});

export const uploadThumbnail = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.file) throw new BadRequestError('No image file provided');
  const url = await cloudinaryService.uploadFile(req.file.buffer, req.file.mimetype);
  res.status(200).json(ApiResponse.success({ url }, 'Thumbnail uploaded successfully'));
});

export const uploadVideo = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.file) throw new BadRequestError('No video file provided');
  const url = await cloudinaryService.uploadFile(req.file.buffer, req.file.mimetype);
  res.status(200).json(ApiResponse.success({ url }, 'Video uploaded successfully'));
});

export const toggleLessonProgress = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) throw new BadRequestError('User context missing');
  const { completed } = req.body;
  if (completed === undefined) throw new BadRequestError('completed field is required');

  const result = await courseService.toggleLessonProgress(req.user.id, req.params.lessonId, completed);
  res.status(200).json(ApiResponse.success(result, 'Lesson progress updated successfully'));
});

export const toggleLessonBookmark = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) throw new BadRequestError('User context missing');
  const { bookmark } = req.body;
  if (bookmark === undefined) throw new BadRequestError('bookmark field is required');

  const result = await courseService.toggleLessonBookmark(req.user.id, req.params.lessonId, bookmark);
  res.status(200).json(ApiResponse.success(result, 'Lesson bookmark updated successfully'));
});
