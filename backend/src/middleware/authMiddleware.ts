import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError, ForbiddenError } from '../utils/customErrors';
import { verifyAccessToken } from '../utils/jwt';
import { userRepository } from '../repositories/userRepository';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'instructor' | 'student';
  };
}

export const protect = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  let token: string | undefined;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new UnauthorizedError('Please log in to access this resource'));
  }

  try {
    const decoded = verifyAccessToken(token);
    const user = await userRepository.findById(decoded.userId);
    
    if (!user) {
      return next(new UnauthorizedError('The user belonging to this token no longer exists'));
    }

    req.user = {
      id: String(user._id),
      name: user.name,
      email: user.email,
      role: user.role,
    };
    next();
  } catch (error) {
    return next(new UnauthorizedError('Invalid token or session expired'));
  }
};

export const restrictTo = (...roles: Array<'admin' | 'instructor' | 'student'>) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ForbiddenError('You do not have permission to perform this action'));
    }
    next();
  };
};
