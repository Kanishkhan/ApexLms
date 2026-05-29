import { Schema, model, Document } from 'mongoose';

export interface ITestCase {
  input: string;
  expectedOutput: string;
  isHidden: boolean;
}

export interface ICodingProblem extends Document {
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topicTags: string[];
  starterTemplates: { language: string; templateCode: string }[];
  testCases: ITestCase[];
  points: number; // XP points awarded
  createdAt: Date;
  updatedAt: Date;
}

const TestCaseSchema = new Schema<ITestCase>({
  input: { type: String, required: true },
  expectedOutput: { type: String, required: true },
  isHidden: { type: Boolean, default: false },
});

const CodingProblemSchema = new Schema<ICodingProblem>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'easy', index: true },
    topicTags: [{ type: String, index: true }],
    starterTemplates: [
      {
        language: { type: String, required: true },
        templateCode: { type: String, required: true },
      },
    ],
    testCases: [TestCaseSchema],
    points: { type: Number, default: 100 },
  },
  { timestamps: true }
);

export const CodingProblem = model<ICodingProblem>('CodingProblem', CodingProblemSchema);
