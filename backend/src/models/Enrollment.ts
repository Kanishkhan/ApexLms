import { Schema, model, Document, Types } from 'mongoose';

export interface IEnrollment extends Document {
  student: Types.ObjectId;
  course: Types.ObjectId;
  progressPercentage: number;
  enrolledAt: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const EnrollmentSchema = new Schema<IEnrollment>(
  {
    student: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    progressPercentage: { type: Number, default: 0 },
    enrolledAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

// Compounded index to guarantee a user is enrolled in a course only once
EnrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

export const Enrollment = model<IEnrollment>('Enrollment', EnrollmentSchema);
