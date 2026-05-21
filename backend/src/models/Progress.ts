import { Schema, model, Document, Types } from 'mongoose';

export interface IProgress extends Document {
  student: Types.ObjectId;
  course: Types.ObjectId;
  lesson: Types.ObjectId;
  isCompleted: boolean;
  bookmark: boolean;
  lastViewedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ProgressSchema = new Schema<IProgress>(
  {
    student: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    lesson: { type: Schema.Types.ObjectId, ref: 'Lesson', required: true },
    isCompleted: { type: Boolean, default: false },
    bookmark: { type: Boolean, default: false },
    lastViewedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Compounded index to quickly retrieve completion states for a user in a course
ProgressSchema.index({ student: 1, course: 1 });
ProgressSchema.index({ student: 1, lesson: 1 }, { unique: true });

export const Progress = model<IProgress>('Progress', ProgressSchema);
