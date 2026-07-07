import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { gamificationService } from '../services/gamificationService';
import { Notification } from '../models/Notification';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { BadRequestError } from '../utils/customErrors';
import { mockNotifications } from '../repositories/mockMemoryDb';

export const getAchievementsProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const studentId = req.user?.id;
  if (!studentId) throw new BadRequestError('User context required');

  const profile = await gamificationService.getStudentProgress(studentId);
  res.status(200).json(ApiResponse.success(profile, 'Achievements profile loaded successfully'));
});

export const checkAndUpdateStreak = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const studentId = req.user?.id;
  if (!studentId) throw new BadRequestError('User context required');

  const profile = await gamificationService.updateActiveStreak(studentId);
  res.status(200).json(ApiResponse.success(profile, 'Daily streak checked and updated successfully'));
});

export const getNotifications = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new BadRequestError('User context required');

  if (global.isMockDb) {
    const list = mockNotifications
      .filter((n) => n.user === userId)
      .slice(0, 30);
    return res.status(200).json(ApiResponse.success(list, 'Notifications alert feed loaded successfully'));
  }

  const notifications = await Notification.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(30);

  res.status(200).json(ApiResponse.success(notifications, 'Notifications alert feed loaded successfully'));
});

export const markNotificationsRead = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new BadRequestError('User context required');

  if (global.isMockDb) {
    mockNotifications.forEach((n) => {
      if (n.user === userId) n.isRead = true;
    });
    return res.status(200).json(ApiResponse.success(null, 'All notifications marked as read'));
  }

  await Notification.updateMany({ user: userId, isRead: false }, { isRead: true });
  res.status(200).json(ApiResponse.success(null, 'All notifications marked as read'));
});
