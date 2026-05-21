import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { quizService } from '../services/quizService';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { BadRequestError } from '../utils/customErrors';

export const getQuizByModule = asyncHandler(async (req, res: Response) => {
  const quiz = await quizService.getQuizByModule(req.params.moduleId);
  res.status(200).json(ApiResponse.success(quiz, 'Quiz fetched successfully'));
});

export const getQuizById = asyncHandler(async (req, res: Response) => {
  const quiz = await quizService.getQuizById(req.params.id);
  res.status(200).json(ApiResponse.success(quiz, 'Quiz fetched successfully'));
});

export const createQuiz = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) throw new BadRequestError('User context missing');
  const quiz = await quizService.createQuiz(req.user.id, req.body);
  res.status(201).json(ApiResponse.success(quiz, 'Quiz created successfully'));
});

export const submitAttempt = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) throw new BadRequestError('User context missing');
  const { answers } = req.body;
  if (!answers || !Array.isArray(answers)) {
    throw new BadRequestError('answers array is required');
  }

  const result = await quizService.submitAttempt(req.user.id, req.params.id, answers);
  res.status(200).json(ApiResponse.success(result, 'Quiz graded successfully'));
});

export const getAttempts = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) throw new BadRequestError('User context missing');
  const attempts = await quizService.getAttempts(req.user.id, req.params.id);
  res.status(200).json(ApiResponse.success(attempts, 'Quiz attempts history fetched successfully'));
});
