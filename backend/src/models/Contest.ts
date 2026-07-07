import { Schema, model, Document, Types } from 'mongoose';

export interface IContestParticipant {
  user: Types.ObjectId;
  username: string;
  score: number;
  totalTime: number; // For tie-breaking (penalty calculation in minutes)
  submissions: {
    problemId: Types.ObjectId;
    solved: boolean;
    attempts: number;
    solvedTime?: number; // in minutes from contest start
  }[];
}

export interface IContest extends Document {
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  problems: Types.ObjectId[]; // References to CodingProblem
  participants: IContestParticipant[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ContestParticipantSchema = new Schema<IContestParticipant>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  username: { type: String, required: true },
  score: { type: Number, default: 0 },
  totalTime: { type: Number, default: 0 },
  submissions: [
    {
      problemId: { type: Schema.Types.ObjectId, ref: 'CodingProblem', required: true },
      solved: { type: Boolean, default: false },
      attempts: { type: Number, default: 0 },
      solvedTime: { type: Number },
    },
  ],
});

const ContestSchema = new Schema<IContest>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    startTime: { type: Date, required: true, index: true },
    endTime: { type: Date, required: true, index: true },
    problems: [{ type: Schema.Types.ObjectId, ref: 'CodingProblem', required: true }],
    participants: [ContestParticipantSchema],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Contest = model<IContest>('Contest', ContestSchema);
