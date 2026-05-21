import { Schema, model, Document, Types } from 'mongoose';

export interface ILesson extends Document {
  module: Types.ObjectId;
  course: Types.ObjectId;
  title: string;
  description: string;
  type: 'video' | 'pdf' | 'text';
  content?: string; // markdown or text
  videoUrl?: string;
  pdfUrl?: string;
  order: number;
  duration: number; // in minutes
  isFreePreview: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const LessonSchema = new Schema<ILesson>(
  {
    module: { type: Schema.Types.ObjectId, ref: 'Module', required: true, index: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    type: { type: String, enum: ['video', 'pdf', 'text'], default: 'text' },
    content: { type: String, default: '' },
    videoUrl: { type: String, default: '' },
    pdfUrl: { type: String, default: '' },
    order: { type: Number, required: true },
    duration: { type: Number, default: 0 },
    isFreePreview: { type: Boolean, default: false },
  },
  { timestamps: true }
);

LessonSchema.index({ module: 1, order: 1 });

export const Lesson = model<ILesson>('Lesson', LessonSchema);
