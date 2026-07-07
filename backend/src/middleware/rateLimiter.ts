import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100000, // relaxed limit for development/testing
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100000, // relaxed limit for development/testing
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again in an hour',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
