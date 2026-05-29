import { Schema, model, Document, Types } from 'mongoose';

export interface IBadge {
  badgeId: string;
  title: string;
  unlockedAt: Date;
}

export interface IAchievement extends Document {
  student: Types.ObjectId;
  totalXp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate?: Date;
  badges: IBadge[];
  createdAt: Date;
  updatedAt: Date;
}

const BadgeSchema = new Schema<IBadge>({
  badgeId: { type: String, required: true },
  title: { type: String, required: true },
  unlockedAt: { type: Date, default: Date.now },
});

const AchievementSchema = new Schema<IAchievement>(
  {
    student: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    totalXp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastActiveDate: { type: Date },
    badges: [BadgeSchema],
  },
  { timestamps: true }
);

export const Achievement = model<IAchievement>('Achievement', AchievementSchema);
