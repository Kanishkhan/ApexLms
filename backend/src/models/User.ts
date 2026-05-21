import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: 'admin' | 'instructor' | 'student';
  avatarUrl?: string;
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['admin', 'instructor', 'student'], default: 'student' },
    avatarUrl: { type: String, default: '' },
    refreshToken: { type: String },
  },
  { timestamps: true }
);

// Indexing for faster email searches
UserSchema.index({ email: 1 });

export const User = model<IUser>('User', UserSchema);
