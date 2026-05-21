import { Schema, model, Document, Types } from 'mongoose';

export interface IQuizAttempt extends Document {
  student: Types.ObjectId;
  quiz: Types.ObjectId;
  score: number; // percentage
  passed: boolean;
  answers: number[]; // index of options selected
  attemptedAt: Date;
}

const QuizAttemptSchema = new Schema<IQuizAttempt>(
  {
    student: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    quiz: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true, index: true },
    score: { type: Number, required: true },
    passed: { type: Boolean, required: true },
    answers: [{ type: Number }],
    attemptedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

QuizAttemptSchema.index({ student: 1, quiz: 1 });

export const QuizAttempt = model<IQuizAttempt>('QuizAttempt', QuizAttemptSchema);
