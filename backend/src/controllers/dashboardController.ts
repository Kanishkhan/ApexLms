import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { dashboardService } from '../services/dashboardService';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { BadRequestError } from '../utils/customErrors';

export const getStudentDashboard = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) throw new BadRequestError('User context missing');
  const data = await dashboardService.getStudentDashboard(req.user.id);
  res.status(200).json(ApiResponse.success(data, 'Student dashboard metrics loaded'));
});

export const getInstructorDashboard = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) throw new BadRequestError('User context missing');
  const data = await dashboardService.getInstructorDashboard(req.user.id);
  res.status(200).json(ApiResponse.success(data, 'Instructor studio metrics loaded'));
});

export const getAdminDashboard = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const data = await dashboardService.getAdminDashboard();
  res.status(200).json(ApiResponse.success(data, 'Admin enterprise metrics loaded'));
});
