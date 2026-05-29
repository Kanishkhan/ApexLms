import { Schema, model, Document, Types } from 'mongoose';

export interface IFeedback {
  instructor: Types.ObjectId;
  comments: string;
  pointsAwarded: number[]; // Scores matching assignment rubric indexes
  gradedAt: Date;
}

export interface ISubmission extends Document {
  assignment: Types.ObjectId;
  student: Types.ObjectId;
  githubUrl?: string;
  fileUrl?: string;
  submissionText?: string;
  status: 'submitted' | 'graded' | 'late';
  pointsEarned?: number;
  feedback?: IFeedback;
  submittedAt: Date;
}

const FeedbackSchema = new Schema<IFeedback>({
  instructor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  comments: { type: String, required: true },
  pointsAwarded: [{ type: Number, required: true }],
  gradedAt: { type: Date, default: Date.now },
});

const SubmissionSchema = new Schema<ISubmission>(
  {
    assignment: { type: Schema.Types.ObjectId, ref: 'Assignment', required: true, index: true },
    student: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    githubUrl: { type: String, trim: true },
    fileUrl: { type: String },
    submissionText: { type: String },
    status: {
      type: String,
      enum: ['submitted', 'graded', 'late'],
      default: 'submitted',
      index: true,
    },
    pointsEarned: { type: Number },
    feedback: FeedbackSchema,
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: { createdAt: 'submittedAt', updatedAt: false } }
);

export const Submission = model<ISubmission>('Submission', SubmissionSchema);
