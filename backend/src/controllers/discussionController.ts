import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { discussionService } from '../services/discussionService';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { BadRequestError, UnauthorizedError } from '../utils/customErrors';

export const getDiscussions = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const threads = await discussionService.getLessonDiscussions(req.params.lessonId);
  res.status(200).json(ApiResponse.success(threads, 'Lesson discussions loaded successfully'));
});

export const createPost = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  const { lessonId, content, parentId } = req.body;
  if (!userId) throw new BadRequestError('User context required');
  if (!lessonId || !content) throw new BadRequestError('Lesson ID and comment text are required');

  const isInstructor = req.user.role === 'instructor' || req.user.role === 'admin';
  const post = await discussionService.createPost(userId, {
    lessonId,
    content,
    parentId,
    isInstructor,
  });

  res.status(201).json(ApiResponse.success(post, 'Comment posted successfully'));
});

export const toggleUpvote = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new BadRequestError('User context required');

  const comment = await discussionService.toggleUpvote(userId, req.params.id);
  res.status(200).json(ApiResponse.success(comment, 'Upvote status toggled successfully'));
});

export const moderatePost = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const moderatorId = req.user?.id;
  if (!moderatorId) throw new BadRequestError('User context required');
  if (req.user.role !== 'instructor' && req.user.role !== 'admin') {
    throw new UnauthorizedError('Moderator privileges required');
  }

  const { action } = req.body; // 'delete' | 'verify'
  if (action !== 'delete' && action !== 'verify') throw new BadRequestError('Invalid moderator action');

  const result = await discussionService.moderatePost(req.params.id, moderatorId, action);
  res.status(200).json(ApiResponse.success(result, `Moderator action '${action}' completed successfully`));
});
