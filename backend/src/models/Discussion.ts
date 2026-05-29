import { Schema, model, Document, Types } from 'mongoose';

export interface IDiscussion extends Document {
  lesson: Types.ObjectId;
  user: Types.ObjectId;
  content: string;
  parentId?: Types.ObjectId; // For nested replies
  upvotes: Types.ObjectId[];
  isInstructorAnswer: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DiscussionSchema = new Schema<IDiscussion>(
  {
    lesson: { type: Schema.Types.ObjectId, ref: 'Lesson', required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    content: { type: String, required: true, trim: true },
    parentId: { type: Schema.Types.ObjectId, ref: 'Discussion', index: true },
    upvotes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    isInstructorAnswer: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Discussion = model<IDiscussion>('Discussion', DiscussionSchema);
