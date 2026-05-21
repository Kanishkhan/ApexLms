import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { authService } from '../services/authService';
import { cloudinaryService } from '../services/cloudinaryService';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { registerSchema, loginSchema } from '../validators/authValidator';
import { BadRequestError } from '../utils/customErrors';

export const register = asyncHandler(async (req, res: Response) => {
  const result = registerSchema.safeParse(req.body);
  if (!result.success) {
    throw result.error;
  }

  const data = await authService.register(req.body);

  // Set refresh token in HTTP-only cookie
  res.cookie('refreshToken', data.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.status(201).json(
    ApiResponse.success(
      { user: data.user, accessToken: data.accessToken },
      'Registration successful'
    )
  );
});

export const login = asyncHandler(async (req, res: Response) => {
  const result = loginSchema.safeParse(req.body);
  if (!result.success) {
    throw result.error;
  }

  const data = await authService.login(req.body);

  res.cookie('refreshToken', data.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.status(200).json(
    ApiResponse.success(
      { user: data.user, accessToken: data.accessToken },
      'Login successful'
    )
  );
});

export const refresh = asyncHandler(async (req, res: Response) => {
  const token = req.cookies.refreshToken || req.body.refreshToken;
  if (!token) {
    throw new BadRequestError('Refresh token is required');
  }

  const data = await authService.refreshToken(token);

  res.cookie('refreshToken', data.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json(
    ApiResponse.success({ accessToken: data.accessToken }, 'Token refreshed successfully')
  );
});

export const logout = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (req.user) {
    await authService.logout(req.user.id);
  }
  res.clearCookie('refreshToken');
  res.status(200).json(ApiResponse.success(null, 'Logged out successfully'));
});

export const getMe = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) throw new BadRequestError('User context missing');
  const profile = await authService.getProfile(req.user.id);
  res.status(200).json(ApiResponse.success(profile, 'Profile fetched successfully'));
});

export const updateProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) throw new BadRequestError('User context missing');
  const profile = await authService.updateProfile(req.user.id, req.body);
  res.status(200).json(ApiResponse.success(profile, 'Profile updated successfully'));
});

export const uploadAvatar = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) throw new BadRequestError('User context missing');
  if (!req.file) throw new BadRequestError('No avatar file provided');

  const avatarUrl = await cloudinaryService.uploadFile(req.file.buffer, req.file.mimetype);
  const profile = await authService.updateProfile(req.user.id, { avatarUrl });

  res.status(200).json(ApiResponse.success(profile, 'Avatar uploaded successfully'));
});
