import { Schema, model, Document, Types } from 'mongoose';

export interface IModule extends Document {
  course: Types.ObjectId;
  title: string;
  description: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const ModuleSchema = new Schema<IModule>(
  {
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    order: { type: Number, required: true },
  },
  { timestamps: true }
);

ModuleSchema.index({ course: 1, order: 1 });

export const Module = model<IModule>('Module', ModuleSchema);
