import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
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
import assessmentRoutes from './routes/assessmentRoutes';
import contestRoutes from './routes/contestRoutes';
import dailyQuizRoutes from './routes/dailyQuizRoutes';

const app = express();

// Security Middlewares
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);
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

// Static uploads serving
const uploadsDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

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
app.use('/api/v1/assessments', assessmentRoutes);
app.use('/api/v1/contests', contestRoutes);
app.use('/api/v1/daily-quizzes', dailyQuizRoutes);

// Fallback for undefined routes
app.use('*', (req, res, next) => {
  next(new NotFoundError(`Route ${req.originalUrl} not found`));
});

// Centralized error handling
app.use(errorHandler);

export default app;
