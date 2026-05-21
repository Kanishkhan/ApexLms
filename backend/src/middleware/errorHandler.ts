import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/customErrors';
import { ApiResponse } from '../utils/ApiResponse';
import { ZodError } from 'zod';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let errors: any = null;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof ZodError) {
    statusCode = 400;
    message = 'Validation Error';
    errors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
  } else if (err.name === 'ValidationError') {
    // Mongoose validation error
    statusCode = 400;
    message = err.message;
  } else if (err.name === 'CastError') {
    // Mongoose cast error (invalid ID format)
    statusCode = 400;
    message = 'Invalid ID format';
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid JWT token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token has expired';
  }

  // In production, don't leak server error stack traces
  const isDev = process.env.NODE_ENV === 'development';
  if (!err.message && statusCode === 500) {
    message = 'Something went wrong on the server';
  }

  console.error(`[Error] [${req.method}] ${req.path} - ${err.message}`, isDev ? err.stack : '');

  res.status(statusCode).json(
    ApiResponse.error(message, {
      errors,
      stack: isDev ? err.stack : undefined,
    })
  );
};
