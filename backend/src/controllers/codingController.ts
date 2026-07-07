import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { codingService } from '../services/codingService';
import { gamificationService } from '../services/gamificationService';
import { aiServiceGateway } from '../services/aiService';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { BadRequestError } from '../utils/customErrors';

export const getProblems = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const problems = await codingService.getProblems();
  res.status(200).json(ApiResponse.success(problems, 'Coding problems catalog fetched successfully'));
});

export const getProblemById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const problem = await codingService.getProblemById(req.params.id);
  res.status(200).json(ApiResponse.success(problem, 'Problem workspace loaded successfully'));
});

export const runCode = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { code, language } = req.body;
  if (!code || !language) throw new BadRequestError('Code string and programming language are required');

  const result = await codingService.runCode(req.params.id, code, language);
  res.status(200).json(ApiResponse.success(result, 'Code run executed successfully'));
});

export const submitCode = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { code, language } = req.body;
  const studentId = req.user?.id;
  if (!studentId) throw new BadRequestError('User context required');
  if (!code || !language) throw new BadRequestError('Code string and programming language are required');

  const result = await codingService.submitCode(studentId, req.params.id, code, language);

  // If code is accepted, grant XP through the gamification service
  if (result.xpEarned > 0) {
    await gamificationService.addXp(studentId, result.xpEarned, `Solved Coding Problem: ${req.params.id}`);
  }

  res.status(200).json(ApiResponse.success(result, 'Code submission evaluated successfully'));
});

export const submitCodeAsync = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { code, language } = req.body;
  const studentId = req.user?.id;
  if (!studentId) throw new BadRequestError('User context required');
  if (!code || !language) throw new BadRequestError('Code string and programming language are required');

  const result = await codingService.submitCodeAsync(studentId, req.params.id, code, language);
  res.status(202).json(ApiResponse.success(result, 'Code submission queued successfully'));
});

export const getSubmissionStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await codingService.getSubmissionStatus(req.params.jobId);
  res.status(200).json(ApiResponse.success(result, 'Submission status retrieved successfully'));
});

// AI Tutor help context trigger
export const askTutor = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const studentId = req.user?.id;
  const { topic, code, question } = req.body;
  if (!studentId) throw new BadRequestError('User context required');
  if (!topic) throw new BadRequestError('Tutor topic context is required');

  const hint = await aiServiceGateway.getTutorHint(studentId, { topic, code, question });
  res.status(200).json(ApiResponse.success({ hint }, 'AI Tutor hint generated successfully'));
});

// AI automated code reviews
export const reviewCode = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { code, language } = req.body;
  if (!code || !language) throw new BadRequestError('Code string and language are required');

  const review = await aiServiceGateway.reviewCodeSubmission(req.params.id, code, language);
  res.status(200).json(ApiResponse.success(review, 'AI Code Review generated successfully'));
});
