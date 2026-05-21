import { Schema, model, Document, Types } from 'mongoose';

export interface IQuestion {
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
  points: number;
}

export interface IQuiz extends Document {
  course: Types.ObjectId;
  module: Types.ObjectId;
  title: string;
  description: string;
  passingScore: number; // percentage, e.g. 70
  questions: IQuestion[];
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema<IQuestion>({
  questionText: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswerIndex: { type: Number, required: true },
  points: { type: Number, default: 1 },
});

const QuizSchema = new Schema<IQuiz>(
  {
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    module: { type: Schema.Types.ObjectId, ref: 'Module', required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    passingScore: { type: Number, default: 70 },
    questions: [QuestionSchema],
  },
  { timestamps: true }
);

export const Quiz = model<IQuiz>('Quiz', QuizSchema);
