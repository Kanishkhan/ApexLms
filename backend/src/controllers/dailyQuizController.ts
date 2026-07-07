import { Request, Response, NextFunction } from 'express';
import { DailyQuiz } from '../models/DailyQuiz';
import { Achievement } from '../models/Achievement';
import { AppError } from '../utils/customErrors';

// Helper to standardise dates to UTC midnight
const getUTCOfDate = (d: Date) => {
  const date = new Date(d);
  date.setUTCHours(0, 0, 0, 0);
  return date;
};

// Create Daily Quiz (Instructor/Admin only)
export const createDailyQuiz = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, date, questions, xpPoints } = req.body;
    const quizDate = getUTCOfDate(new Date(date));

    // Check if daily quiz for this date already exists
    const existing = await DailyQuiz.findOne({ date: quizDate });
    if (existing) {
      return next(new AppError('Daily Quiz already exists for this date', 400));
    }

    const dailyQuiz = await DailyQuiz.create({
      title,
      date: quizDate,
      questions,
      xpPoints: xpPoints || 50,
    });

    res.status(201).json({
      status: 'success',
      data: { dailyQuiz },
    });
  } catch (err) {
    next(err);
  }
};

// Get Daily Quiz for Today (or specific date)
export const getDailyQuiz = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dateQuery = req.query.date ? new Date(req.query.date as string) : new Date();
    const targetDate = getUTCOfDate(dateQuery);

    const dailyQuiz = await DailyQuiz.findOne({ date: targetDate });
    if (!dailyQuiz) {
      return next(new AppError('No Daily Quiz found for this date', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { dailyQuiz },
    });
  } catch (err) {
    next(err);
  }
};

// Submit Daily Quiz Attempt (solo timed/gamified)
export const attemptDailyQuiz = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { answers } = req.body; // Array of { questionIndex, answerValues }

    const dailyQuiz = await DailyQuiz.findById(id);
    if (!dailyQuiz) {
      return next(new AppError('Daily Quiz not found', 404));
    }

    // Check if already attempted
    const alreadyAttempted = dailyQuiz.attempts.some(att => att.user.toString() === userId.toString());
    if (alreadyAttempted) {
      return next(new AppError('You have already completed this daily quiz', 400));
    }

    let correctCount = 0;
    const gradedAnswers = dailyQuiz.questions.map((q, idx) => {
      const userAns = answers.find((ans: any) => ans.questionIndex === idx);
      const userVals = userAns ? userAns.answerValues : [];
      let isCorrect = false;

      if (q.questionType === 'single-choice') {
        isCorrect = q.correctAnswers?.[0] === userVals[0];
      } else if (q.questionType === 'multiple-choice') {
        const correct = q.correctAnswers || [];
        isCorrect = correct.length === userVals.length && correct.every(v => userVals.includes(v));
      } else if (q.questionType === 'fill-blank') {
        isCorrect = q.correctAnswers?.[0]?.trim().toLowerCase() === userVals[0]?.trim().toLowerCase();
      } else if (q.questionType === 'match-following') {
        const correctPairs = q.matchPairs?.map(p => `${p.leftItem}:${p.rightItem}`) || [];
        isCorrect = correctPairs.length === userVals.length && correctPairs.every(v => userVals.includes(v));
      }

      if (isCorrect) correctCount++;

      return {
        questionIndex: idx,
        answerValues: userVals,
        isCorrect,
      };
    });

    const pctCorrect = gradedAnswers.length > 0 ? correctCount / gradedAnswers.length : 0;
    const xpPointsAwarded = Math.round(pctCorrect * dailyQuiz.xpPoints);

    // Save attempt
    dailyQuiz.attempts.push({
      user: userId,
      score: correctCount,
      xpEarned: xpPointsAwarded,
      answers: gradedAnswers,
      completedAt: new Date(),
    });
    await dailyQuiz.save();

    // Update User Achievements (XP points & Streaks)
    let achievement = await Achievement.findOne({ student: userId });
    if (!achievement) {
      achievement = new Achievement({
        student: userId,
        totalXp: 0,
        level: 1,
        currentStreak: 0,
        longestStreak: 0,
        badges: [],
      });
    }

    // Streak update logic
    const now = new Date();
    const todayStr = getUTCOfDate(now).toISOString();
    let streakIncremented = false;

    if (achievement.lastActiveDate) {
      const lastActive = getUTCOfDate(achievement.lastActiveDate);
      const diffTime = Math.abs(getUTCOfDate(now).getTime() - lastActive.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        achievement.currentStreak += 1;
        streakIncremented = true;
      } else if (diffDays > 1) {
        achievement.currentStreak = 1;
        streakIncremented = true;
      }
    } else {
      achievement.currentStreak = 1;
      streakIncremented = true;
    }

    if (achievement.currentStreak > achievement.longestStreak) {
      achievement.longestStreak = achievement.currentStreak;
    }

    achievement.totalXp += xpPointsAwarded;
    achievement.lastActiveDate = now;
    // Simple level up: 1 level per 500 XP
    achievement.level = Math.floor(achievement.totalXp / 500) + 1;

    // Award badge if they completed a streak
    if (achievement.currentStreak >= 7 && !achievement.badges.some(b => b.badgeId === 'streak-7')) {
      achievement.badges.push({ badgeId: 'streak-7', title: '7-Day Streak Warrior', unlockedAt: new Date() });
    }

    await achievement.save();

    res.status(200).json({
      status: 'success',
      data: {
        score: correctCount,
        xpEarned: xpPointsAwarded,
        streak: achievement.currentStreak,
        level: achievement.level,
        gradedAnswers,
      },
    });
  } catch (err) {
    next(err);
  }
};
