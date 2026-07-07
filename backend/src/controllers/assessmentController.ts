import { Request, Response, NextFunction } from 'express';
import { Assessment } from '../models/Assessment';
import { AppError } from '../utils/customErrors';

// Create assessment (Instructor only)
export const createAssessment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, description, duration, startTime, endTime, questions, isRandomized } = req.body;

    const newAssessment = await Assessment.create({
      title,
      description,
      duration,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      questions,
      isRandomized: isRandomized || false,
    });

    res.status(201).json({
      status: 'success',
      data: { assessment: newAssessment },
    });
  } catch (err) {
    next(err);
  }
};

// Get all active assessments
export const getActiveAssessments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const now = new Date();
    const assessments = await Assessment.find({
      isActive: true,
      startTime: { $lte: now },
      endTime: { $gte: now },
    }).select('-submissions.answers'); // omit answers for list view

    res.status(200).json({
      status: 'success',
      results: assessments.length,
      data: { assessments },
    });
  } catch (err) {
    next(err);
  }
};

// Get assessment detail (with specific questions, optionally randomized)
export const getAssessmentById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const assessment = await Assessment.findById(req.params.id);
    if (!assessment) {
      return next(new AppError('Assessment not found', 404));
    }

    // Shuffle questions if randomized
    let questions = [...assessment.questions];
    if (assessment.isRandomized) {
      questions = questions.sort(() => Math.random() - 0.5);
    }

    res.status(200).json({
      status: 'success',
      data: {
        _id: assessment._id,
        title: assessment.title,
        description: assessment.description,
        duration: assessment.duration,
        startTime: assessment.startTime,
        endTime: assessment.endTime,
        questions,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Start / Join assessment (Creates a submission entry)
export const startAssessment = async (req: any, res: Response, next: NextFunction) => {
  try {
    const assessmentId = req.params.id;
    const userId = req.user.id;

    const assessment = await Assessment.findById(assessmentId);
    if (!assessment) {
      return next(new AppError('Assessment not found', 404));
    }

    const now = new Date();
    if (now < assessment.startTime || now > assessment.endTime) {
      return next(new AppError('Assessment is not currently active', 400));
    }

    // Check if user already has an active or submitted attempt
    let submission = assessment.submissions.find(s => s.user.toString() === userId.toString());

    if (!submission) {
      // Create new submission
      const newSub = {
        user: userId,
        startedAt: new Date(),
        status: 'in-progress' as const,
        answers: [],
        heartbeat: new Date(),
      };
      assessment.submissions.push(newSub as any);
      await assessment.save();
      submission = assessment.submissions.find(s => s.user.toString() === userId.toString());
    } else if (submission.status !== 'in-progress') {
      return next(new AppError('Assessment already submitted', 400));
    }

    res.status(200).json({
      status: 'success',
      data: { submission },
    });
  } catch (err) {
    next(err);
  }
};

// Submit assessment answers
export const submitAssessment = async (req: any, res: Response, next: NextFunction) => {
  try {
    const assessmentId = req.params.id;
    const userId = req.user.id;
    const { answers } = req.body; // Array of { questionId, answerValue }

    const assessment = await Assessment.findById(assessmentId);
    if (!assessment) {
      return next(new AppError('Assessment not found', 404));
    }

    const submissionIndex = assessment.submissions.findIndex(s => s.user.toString() === userId.toString());
    if (submissionIndex === -1) {
      return next(new AppError('Assessment has not been started yet', 400));
    }

    const submission = assessment.submissions[submissionIndex];
    if (submission.status !== 'in-progress') {
      return next(new AppError('Assessment already submitted', 400));
    }

    // Grade MCQs & save answers
    let totalScore = 0;
    const gradedAnswers = answers.map((ans: any) => {
      const q = assessment.questions.find(quest => quest._id?.toString() === ans.questionId);
      let isCorrect = false;
      let score = 0;

      if (q) {
        if (q.questionType === 'mcq') {
          isCorrect = q.correctAnswer === ans.answerValue;
          score = isCorrect ? q.points : 0;
        } else if (q.questionType === 'text') {
          isCorrect = q.correctAnswer?.trim().toLowerCase() === ans.answerValue?.trim().toLowerCase();
          score = isCorrect ? q.points : 0;
        }
        totalScore += score;
      }

      return {
        questionId: ans.questionId,
        answerValue: ans.answerValue,
        isCorrect,
        score,
      };
    });

    // Update submission fields
    submission.answers = gradedAnswers;
    submission.status = 'submitted';
    submission.submittedAt = new Date();

    await assessment.save();

    res.status(200).json({
      status: 'success',
      message: 'Assessment submitted successfully',
      data: {
        score: totalScore,
        submission,
      },
    });
  } catch (err) {
    next(err);
  }
};
