import { Schema, model, Document, Types } from 'mongoose';

export interface ICourse extends Document {
  title: string;
  subtitle: string;
  description: string;
  thumbnailUrl: string;
  instructor: Types.ObjectId;
  price: number;
  category: string;
  tags: string[];
  level: 'beginner' | 'intermediate' | 'advanced';
  status: 'draft' | 'published';
  studentsEnrolled: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const CourseSchema = new Schema<ICourse>(
  {
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    thumbnailUrl: { type: String, default: '' },
    instructor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    price: { type: Number, default: 0 },
    category: { type: String, required: true, index: true },
    tags: [{ type: String }],
    level: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
    status: { type: String, enum: ['draft', 'published'], default: 'draft', index: true },
    studentsEnrolled: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

// Search indexes for text search
CourseSchema.index({ title: 'text', subtitle: 'text', description: 'text' });
CourseSchema.index({ instructor: 1 });

export const Course = model<ICourse>('Course', CourseSchema);
