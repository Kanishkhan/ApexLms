import { Quiz, IQuiz } from '../models/Quiz';
import { mockQuizzes } from './mockMemoryDb';
import { Types } from 'mongoose';

export class QuizRepository {
  async findByModuleId(moduleId: string): Promise<any | null> {
    if (global.isMockDb) {
      return mockQuizzes.find((q) => q.module === moduleId) || null;
    }
    return Quiz.findOne({ module: moduleId });
  }

  async findById(id: string): Promise<any | null> {
    if (global.isMockDb) {
      return mockQuizzes.find((q) => q._id === id) || null;
    }
    if (!Types.ObjectId.isValid(id)) return null;
    return Quiz.findById(id);
  }

  async create(quizData: Partial<IQuiz>): Promise<any> {
    if (global.isMockDb) {
      const newQuiz = {
        ...quizData,
        _id: `q-${mockQuizzes.length + 1}`,
        course: String(quizData.course),
        module: String(quizData.module),
        title: quizData.title || '',
        description: quizData.description || '',
        passingScore: Number(quizData.passingScore) || 70,
        questions: quizData.questions || [],
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any;
      mockQuizzes.push(newQuiz);
      return newQuiz;
    }
    return Quiz.create(quizData);
  }

  async delete(id: string): Promise<boolean> {
    if (global.isMockDb) {
      const idx = mockQuizzes.findIndex((q) => q._id === id);
      if (idx === -1) return false;
      mockQuizzes.splice(idx, 1);
      return true;
    }
    const result = await Quiz.findByIdAndDelete(id);
    return !!result;
  }
}

export const quizRepository = new QuizRepository();
