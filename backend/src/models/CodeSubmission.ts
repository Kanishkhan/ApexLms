import { Schema, model, Document, Types } from 'mongoose';

export interface ICodeSubmission extends Document {
  student: Types.ObjectId;
  problem: Types.ObjectId;
  code: string;
  language: string;
  status: 'accepted' | 'wrong_answer' | 'runtime_error' | 'time_limit_exceeded';
  runtimeMs?: number;
  memoryKb?: number;
  errorMessage?: string;
  passedCount: number;
  totalCount: number;
  attemptedAt: Date;
}

const CodeSubmissionSchema = new Schema<ICodeSubmission>(
  {
    student: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    problem: { type: Schema.Types.ObjectId, ref: 'CodingProblem', required: true, index: true },
    code: { type: String, required: true },
    language: { type: String, required: true },
    status: {
      type: String,
      enum: ['accepted', 'wrong_answer', 'runtime_error', 'time_limit_exceeded'],
      required: true,
      index: true,
    },
    runtimeMs: { type: Number },
    memoryKb: { type: Number },
    errorMessage: { type: String },
    passedCount: { type: Number, required: true },
    totalCount: { type: Number, required: true },
    attemptedAt: { type: Date, default: Date.now },
  },
  { timestamps: { createdAt: 'attemptedAt', updatedAt: false } }
);

export const CodeSubmission = model<ICodeSubmission>('CodeSubmission', CodeSubmissionSchema);
