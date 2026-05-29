import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { apiLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';
import { NotFoundError } from './utils/customErrors';

// Route imports
import authRoutes from './routes/authRoutes';
import courseRoutes from './routes/courseRoutes';
import quizRoutes from './routes/quizRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import codingRoutes from './routes/codingRoutes';
import assignmentRoutes from './routes/assignmentRoutes';
import discussionRoutes from './routes/discussionRoutes';
import gamificationRoutes from './routes/gamificationRoutes';

const app = express();

// Security Middlewares
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  })
);

// Logging and parsing
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Rate Limiter
app.use('/api/', apiLimiter);

// API Routes Mounting
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/courses', courseRoutes);
app.use('/api/v1/quizzes', quizRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/coding', codingRoutes);
app.use('/api/v1/assignments', assignmentRoutes);
app.use('/api/v1/discussions', discussionRoutes);
app.use('/api/v1/gamification', gamificationRoutes);

// Fallback for undefined routes
app.use('*', (req, res, next) => {
  next(new NotFoundError(`Route ${req.originalUrl} not found`));
});

// Centralized error handling
app.use(errorHandler);

export default app;
