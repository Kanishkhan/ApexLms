export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'instructor' | 'student';
  avatarUrl: string;
}

export interface Lesson {
  _id: string;
  title: string;
  description: string;
  type: 'video' | 'pdf' | 'text';
  content?: string;
  videoUrl?: string;
  pdfUrl?: string;
  order: number;
  duration: number;
  isFreePreview: boolean;
  isCompleted?: boolean;
  bookmark?: boolean;
}

export interface Module {
  _id: string;
  title: string;
  description: string;
  order: number;
  lessons: Lesson[];
}

export interface Course {
  _id: string;
  title: string;
  subtitle: string;
  description: string;
  thumbnailUrl: string;
  instructor: {
    _id?: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
  category: string;
  tags: string[];
  level: 'beginner' | 'intermediate' | 'advanced';
  status: 'draft' | 'published';
  studentsEnrolled: string[];
  modules?: Module[];
  isEnrolled?: boolean;
  progressPercentage?: number;
}

export interface Enrollment {
  id: string;
  title: string;
  subtitle: string;
  thumbnailUrl: string;
  instructor: any;
  progressPercentage: number;
  enrolledAt: string;
  completedAt?: string;
}

export interface QuizQuestion {
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
  points: number;
}

export interface Quiz {
  _id: string;
  course: string;
  module: string;
  title: string;
  description: string;
  passingScore: number;
  questions: QuizQuestion[];
}

export interface QuizAttempt {
  _id: string;
  student: string;
  quiz: string;
  score: number;
  passed: boolean;
  answers: number[];
  attemptedAt: string;
}
