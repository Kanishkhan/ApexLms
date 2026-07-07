import { Schema, model, Document, Types } from 'mongoose';

export interface IAssessmentSubmission extends Document {
  user: Types.ObjectId;
  startedAt: Date;
  submittedAt?: Date;
  status: 'in-progress' | 'submitted' | 'expired';
  answers: {
    questionId: string;
    answerValue: string; // For MCQs/text or code submissions references
    isCorrect?: boolean;
    score?: number;
  }[];
  heartbeat: Date;
}

export interface IAssessmentQuestion {
  _id?: Types.ObjectId;
  questionText: string;
  questionType: 'mcq' | 'coding' | 'text';
  options?: string[]; // for mcq
  correctAnswer?: string; // for mcq/text validation
  codingProblemId?: Types.ObjectId; // if coding problem
  points: number;
}

export interface IAssessment extends Document {
  title: string;
  description: string;
  duration: number; // in minutes
  startTime: Date;
  endTime: Date;
  questions: IAssessmentQuestion[];
  isRandomized: boolean;
  isActive: boolean;
  submissions: IAssessmentSubmission[];
  createdAt: Date;
  updatedAt: Date;
}

const AssessmentQuestionSchema = new Schema<IAssessmentQuestion>({
  questionText: { type: String, required: true },
  questionType: { type: String, enum: ['mcq', 'coding', 'text'], required: true },
  options: [{ type: String }],
  correctAnswer: { type: String },
  codingProblemId: { type: Schema.Types.ObjectId, ref: 'CodingProblem' },
  points: { type: Number, default: 10 },
});

const AssessmentSubmissionSchema = new Schema<IAssessmentSubmission>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  startedAt: { type: Date, default: Date.now },
  submittedAt: { type: Date },
  status: { type: String, enum: ['in-progress', 'submitted', 'expired'], default: 'in-progress' },
  answers: [
    {
      questionId: { type: String, required: true },
      answerValue: { type: String, default: '' },
      isCorrect: { type: Boolean },
      score: { type: Number, default: 0 },
    },
  ],
  heartbeat: { type: Date, default: Date.now },
});

const AssessmentSchema = new Schema<IAssessment>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    duration: { type: Number, required: true }, // in minutes
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    questions: [AssessmentQuestionSchema],
    isRandomized: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true, index: true },
    submissions: [AssessmentSubmissionSchema],
  },
  { timestamps: true }
);

// Indexes for concurrent queries
AssessmentSchema.index({ 'submissions.user': 1 });
AssessmentSchema.index({ startTime: 1, endTime: 1 });

export const Assessment = model<IAssessment>('Assessment', AssessmentSchema);
