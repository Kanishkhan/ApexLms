import { Schema, model, Document, Types } from 'mongoose';

export interface IMatchPair {
  leftItem: string;
  rightItem: string;
}

export interface IDailyQuizQuestion {
  questionText: string;
  questionType: 'single-choice' | 'multiple-choice' | 'match-following' | 'fill-blank';
  options?: string[]; // for choice questions
  correctAnswers?: string[]; // for choice, fill-blank
  matchPairs?: IMatchPair[]; // for match-following
  points: number;
  timeLimit?: number; // in seconds (for live room)
}

export interface IDailyQuizAttempt {
  user: Types.ObjectId;
  score: number;
  xpEarned: number;
  answers: {
    questionIndex: number;
    answerValues: string[]; // answers submitted by user
    isCorrect: boolean;
  }[];
  completedAt: Date;
}

export interface IDailyQuiz extends Document {
  title: string;
  date: Date; // The specific day this quiz is active
  questions: IDailyQuizQuestion[];
  xpPoints: number;
  attempts: IDailyQuizAttempt[];
  createdAt: Date;
  updatedAt: Date;
}

const MatchPairSchema = new Schema<IMatchPair>({
  leftItem: { type: String, required: true },
  rightItem: { type: String, required: true },
});

const DailyQuizQuestionSchema = new Schema<IDailyQuizQuestion>({
  questionText: { type: String, required: true },
  questionType: {
    type: String,
    enum: ['single-choice', 'multiple-choice', 'match-following', 'fill-blank'],
    required: true,
  },
  options: [{ type: String }],
  correctAnswers: [{ type: String }],
  matchPairs: [MatchPairSchema],
  points: { type: Number, default: 10 },
  timeLimit: { type: Number, default: 30 }, // 30 seconds default
});

const DailyQuizAttemptSchema = new Schema<IDailyQuizAttempt>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  score: { type: Number, default: 0 },
  xpEarned: { type: Number, default: 0 },
  answers: [
    {
      questionIndex: { type: Number, required: true },
      answerValues: [{ type: String }],
      isCorrect: { type: Boolean, required: true },
    },
  ],
  completedAt: { type: Date, default: Date.now },
});

const DailyQuizSchema = new Schema<IDailyQuiz>(
  {
    title: { type: String, required: true, trim: true },
    date: { type: Date, required: true, unique: true, index: true },
    questions: [DailyQuizQuestionSchema],
    xpPoints: { type: Number, default: 50 },
    attempts: [DailyQuizAttemptSchema],
  },
  { timestamps: true }
);

export const DailyQuiz = model<IDailyQuiz>('DailyQuiz', DailyQuizSchema);
