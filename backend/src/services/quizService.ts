import { quizRepository } from '../repositories/quizRepository';
import { quizAttemptRepository } from '../repositories/quizAttemptRepository';
import { moduleRepository } from '../repositories/moduleRepository';
import { NotFoundError, BadRequestError } from '../utils/customErrors';

export class QuizService {
  async getQuizByModule(moduleId: string): Promise<any> {
    const quiz = await quizRepository.findByModuleId(moduleId);
    if (!quiz) throw new NotFoundError('Quiz not found for this module');
    return quiz;
  }

  async getQuizById(id: string): Promise<any> {
    const quiz = await quizRepository.findById(id);
    if (!quiz) throw new NotFoundError('Quiz not found');
    return quiz;
  }

  async createQuiz(instructorId: string, quizData: any): Promise<any> {
    const mod = await moduleRepository.findById(quizData.moduleId);
    if (!mod) throw new NotFoundError('Module not found');

    const newQuiz = await quizRepository.create({
      course: mod.course,
      module: mod._id,
      title: quizData.title,
      description: quizData.description || '',
      passingScore: quizData.passingScore || 70,
      questions: quizData.questions,
    });

    return newQuiz;
  }

  async submitAttempt(studentId: string, quizId: string, answers: number[]): Promise<any> {
    const quiz = await quizRepository.findById(quizId);
    if (!quiz) throw new NotFoundError('Quiz not found');

    if (answers.length !== quiz.questions.length) {
      throw new BadRequestError('Must provide answers to all quiz questions');
    }

    let correctCount = 0;
    quiz.questions.forEach((q: any, idx: number) => {
      if (answers[idx] === q.correctAnswerIndex) {
        correctCount++;
      }
    });

    const score = Math.round((correctCount / quiz.questions.length) * 100);
    const passed = score >= quiz.passingScore;

    const attempt = await quizAttemptRepository.create({
      student: studentId as any,
      quiz: quizId as any,
      score,
      passed,
      answers,
    });

    return {
      attempt,
      correctCount,
      totalQuestions: quiz.questions.length,
      passingScore: quiz.passingScore,
      score,
      passed,
    };
  }

  async getAttempts(studentId: string, quizId: string): Promise<any[]> {
    return quizAttemptRepository.findByStudentAndQuiz(studentId, quizId);
  }
}

export const quizService = new QuizService();
