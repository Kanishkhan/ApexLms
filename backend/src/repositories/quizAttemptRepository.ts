import { QuizAttempt, IQuizAttempt } from '../models/QuizAttempt';
import { mockQuizAttempts } from './mockMemoryDb';
import { Types } from 'mongoose';

export class QuizAttemptRepository {
  async findByStudentAndQuiz(studentId: string, quizId: string): Promise<any[]> {
    if (global.isMockDb) {
      return mockQuizAttempts.filter((qa) => qa.student === studentId && qa.quiz === quizId);
    }
    return QuizAttempt.find({ student: studentId, quiz: quizId }).sort({ attemptedAt: -1 });
  }

  async create(attemptData: Partial<IQuizAttempt>): Promise<any> {
    if (global.isMockDb) {
      const newAttempt = {
        _id: `qa-${mockQuizAttempts.length + 1}`,
        student: String(attemptData.student),
        quiz: String(attemptData.quiz),
        score: Number(attemptData.score) || 0,
        passed: !!attemptData.passed,
        answers: attemptData.answers || [],
        attemptedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any;
      mockQuizAttempts.push(newAttempt);
      return newAttempt;
    }
    return QuizAttempt.create(attemptData);
  }

  async countAll(): Promise<number> {
    if (global.isMockDb) {
      return mockQuizAttempts.length;
    }
    return QuizAttempt.countDocuments({});
  }
}

export const quizAttemptRepository = new QuizAttemptRepository();
