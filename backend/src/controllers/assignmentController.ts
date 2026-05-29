import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { assignmentService } from '../services/assignmentService';
import { gamificationService } from '../services/gamificationService';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { BadRequestError, UnauthorizedError } from '../utils/customErrors';

export const getAssignments = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const assignments = await assignmentService.getAssignmentsByCourse(req.params.courseId);
  res.status(200).json(ApiResponse.success(assignments, 'Course assignments fetched successfully'));
});

export const getAssignmentById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const assignment = await assignmentService.getAssignmentById(req.params.id);
  res.status(200).json(ApiResponse.success(assignment, 'Assignment details loaded successfully'));
});

export const createAssignment = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (req.user?.role !== 'instructor' && req.user?.role !== 'admin') {
    throw new UnauthorizedError('Instructor privileges required to create assignments');
  }

  const assignment = await assignmentService.createAssignment(req.body);
  res.status(201).json(ApiResponse.success(assignment, 'Project assignment authored successfully'));
});

export const submitAssignment = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const studentId = req.user?.id;
  if (!studentId) throw new BadRequestError('User context required');

  const { githubUrl, fileUrl, submissionText } = req.body;
  if (!githubUrl && !fileUrl && !submissionText) {
    throw new BadRequestError('Provide at least a GitHub URL, file upload, or a submission text');
  }

  const submission = await assignmentService.submitAssignment(studentId, req.params.id, {
    githubUrl,
    fileUrl,
    submissionText,
  });

  // Award XP for submitting a project homework (+50 XP)
  await gamificationService.addXp(studentId, 50, `Submitted Project Assignment: ${req.params.id}`);

  res.status(200).json(ApiResponse.success(submission, 'Assignment submitted successfully'));
});

export const getStudentSubmissions = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const studentId = req.user?.id;
  if (!studentId) throw new BadRequestError('User context required');

  const submissions = await assignmentService.getStudentSubmissions(studentId);
  res.status(200).json(ApiResponse.success(submissions, 'Your project submissions loaded successfully'));
});

export const getAssignmentSubmissions = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (req.user?.role !== 'instructor' && req.user?.role !== 'admin') {
    throw new UnauthorizedError('Privileged access required to view submissions');
  }

  const submissions = await assignmentService.getSubmissionsForInstructor(req.params.id);
  res.status(200).json(ApiResponse.success(submissions, 'Student submissions fetched successfully'));
});

export const gradeSubmission = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) throw new BadRequestError('User context required');
  const instructorId = req.user.id;
  if (req.user.role !== 'instructor' && req.user.role !== 'admin') {
    throw new UnauthorizedError('Instructor privileges required to grade submissions');
  }

  const { comments, pointsAwarded } = req.body;
  if (!comments || !pointsAwarded) throw new BadRequestError('Graded scores and comments are required');

  const submission = await assignmentService.gradeSubmission(req.params.id, instructorId, {
    comments,
    pointsAwarded,
  });

  // Award extra XP based on the high score achieved!
  if (submission.pointsEarned && submission.pointsEarned > 0) {
    await gamificationService.addXp(
      String(submission.student),
      submission.pointsEarned * 10,
      `Achieved Grade on Project Assignment`
    );
  }

  res.status(200).json(ApiResponse.success(submission, 'Student submission evaluated and graded successfully'));
});
