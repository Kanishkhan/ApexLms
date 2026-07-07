import { Request, Response, NextFunction } from 'express';
import { Contest } from '../models/Contest';
import { CodingProblem } from '../models/CodingProblem';
import { AppError } from '../utils/customErrors';

// Create Contest (Instructor/Admin only)
export const createContest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, description, startTime, endTime, problems } = req.body;

    const contest = await Contest.create({
      title,
      description,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      problems,
    });

    res.status(201).json({
      status: 'success',
      data: { contest },
    });
  } catch (err) {
    next(err);
  }
};

// List all contests
export const getContests = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const contests = await Contest.find().select('-participants');
    res.status(200).json({
      status: 'success',
      data: { contests },
    });
  } catch (err) {
    next(err);
  }
};

// Get contest by ID with problem details
export const getContestById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const contest = await Contest.findById(req.params.id).populate('problems', 'title description difficulty points topicTags starterTemplates');
    if (!contest) {
      return next(new AppError('Contest not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { contest },
    });
  } catch (err) {
    next(err);
  }
};

// Register for Contest
export const registerForContest = async (req: any, res: Response, next: NextFunction) => {
  try {
    const contestId = req.params.id;
    const userId = req.user.id;
    const username = req.user.username || req.user.email.split('@')[0];

    const contest = await Contest.findById(contestId);
    if (!contest) {
      return next(new AppError('Contest not found', 404));
    }

    const isRegistered = contest.participants.some(p => p.user.toString() === userId.toString());
    if (isRegistered) {
      return res.status(200).json({
        status: 'success',
        message: 'Already registered for this contest',
        data: { contest },
      });
    }

    // Initialize contest record for the student
    const initialSubmissions = contest.problems.map(probId => ({
      problemId: probId,
      solved: false,
      attempts: 0,
    }));

    contest.participants.push({
      user: userId,
      username,
      score: 0,
      totalTime: 0,
      submissions: initialSubmissions,
    });

    await contest.save();

    res.status(200).json({
      status: 'success',
      message: 'Registered successfully',
      data: { contest },
    });
  } catch (err) {
    next(err);
  }
};

// Get Leaderboard
export const getContestLeaderboard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const contest = await Contest.findById(req.params.id);
    if (!contest) {
      return next(new AppError('Contest not found', 404));
    }

    // Sort participants by score descending, then totalTime penalty ascending
    const leaderboard = [...contest.participants].sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return a.totalTime - b.totalTime;
    });

    res.status(200).json({
      status: 'success',
      data: { leaderboard },
    });
  } catch (err) {
    next(err);
  }
};
