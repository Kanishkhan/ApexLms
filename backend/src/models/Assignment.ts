import { Schema, model, Document, Types } from 'mongoose';

export interface IRubricItem {
  criteria: string;
  maxPoints: number;
}

export interface IAssignment extends Document {
  course: Types.ObjectId;
  module: Types.ObjectId;
  title: string;
  description: string;
  deadline: Date;
  rubric: IRubricItem[];
  maxPoints: number;
  createdAt: Date;
  updatedAt: Date;
}

const RubricItemSchema = new Schema<IRubricItem>({
  criteria: { type: String, required: true },
  maxPoints: { type: Number, required: true },
});

const AssignmentSchema = new Schema<IAssignment>(
  {
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    module: { type: Schema.Types.ObjectId, ref: 'Module', required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    deadline: { type: Date, required: true },
    rubric: [RubricItemSchema],
    maxPoints: { type: Number, required: true },
  },
  { timestamps: true }
);

export const Assignment = model<IAssignment>('Assignment', AssignmentSchema);
