import { apiClient } from '../api/client';

export const authService = {
  login: async (credentials: any) => {
    const res = await apiClient.post('/auth/login', credentials);
    return res.data;
  },
  register: async (userData: any) => {
    const res = await apiClient.post('/auth/register', userData);
    return res.data;
  },
  getMe: async () => {
    const res = await apiClient.get('/auth/me');
    return res.data;
  },
  updateProfile: async (data: any) => {
    const res = await apiClient.put('/auth/profile', data);
    return res.data;
  },
  uploadAvatar: async (formData: FormData) => {
    const res = await apiClient.post('/auth/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  logout: async () => {
    const res = await apiClient.post('/auth/logout');
    return res.data;
  },
};

export const courseService = {
  getCourses: async (params?: { category?: string; search?: string }) => {
    const res = await apiClient.get('/courses', { params });
    return res.data;
  },
  getCourseById: async (id: string) => {
    const res = await apiClient.get(`/courses/${id}`);
    return res.data;
  },
  enroll: async (courseId: string) => {
    const res = await apiClient.post(`/courses/${courseId}/enroll`);
    return res.data;
  },
  getEnrolledCourses: async () => {
    const res = await apiClient.get('/courses/student/enrolled');
    return res.data;
  },
  toggleProgress: async (lessonId: string, completed: boolean) => {
    const res = await apiClient.post(`/courses/lessons/${lessonId}/progress`, { completed });
    return res.data;
  },
  toggleBookmark: async (lessonId: string, bookmark: boolean) => {
    const res = await apiClient.post(`/courses/lessons/${lessonId}/bookmark`, { bookmark });
    return res.data;
  },
  
  // Instructor routes
  getInstructorCourses: async () => {
    const res = await apiClient.get('/courses/instructor/my-courses');
    return res.data;
  },
  createCourse: async (courseData: any) => {
    const res = await apiClient.post('/courses', courseData);
    return res.data;
  },
  updateCourse: async (id: string, courseData: any) => {
    const res = await apiClient.put(`/courses/${id}`, courseData);
    return res.data;
  },
  deleteCourse: async (id: string) => {
    const res = await apiClient.delete(`/courses/${id}`);
    return res.data;
  },
  addModule: async (courseId: string, moduleData: any) => {
    const res = await apiClient.post(`/courses/${courseId}/modules`, moduleData);
    return res.data;
  },
  addLesson: async (moduleId: string, lessonData: any) => {
    const res = await apiClient.post(`/courses/modules/${moduleId}/lessons`, lessonData);
    return res.data;
  },
  uploadThumbnail: async (formData: FormData) => {
    const res = await apiClient.post('/courses/upload-thumbnail', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
};

export const quizService = {
  getQuizByModule: async (moduleId: string) => {
    const res = await apiClient.get(`/quizzes/module/${moduleId}`);
    return res.data;
  },
  getQuizById: async (id: string) => {
    const res = await apiClient.get(`/quizzes/${id}`);
    return res.data;
  },
  createQuiz: async (quizData: any) => {
    const res = await apiClient.post('/quizzes', quizData);
    return res.data;
  },
  submitAttempt: async (quizId: string, answers: number[]) => {
    const res = await apiClient.post(`/quizzes/${quizId}/submit`, { answers });
    return res.data;
  },
  getAttempts: async (quizId: string) => {
    const res = await apiClient.get(`/quizzes/${quizId}/attempts`);
    return res.data;
  },
};

export const dashboardService = {
  getStudentDashboard: async () => {
    const res = await apiClient.get('/dashboard/student');
    return res.data;
  },
  getInstructorDashboard: async () => {
    const res = await apiClient.get('/dashboard/instructor');
    return res.data;
  },
  getAdminDashboard: async () => {
    const res = await apiClient.get('/dashboard/admin');
    return res.data;
  },
};

export const codingService = {
  getProblems: async () => {
    const res = await apiClient.get('/coding/problems');
    return res.data;
  },
  getProblemById: async (id: string) => {
    const res = await apiClient.get(`/coding/problems/${id}`);
    return res.data;
  },
  runCode: async (id: string, data: { code: string; language: string }) => {
    const res = await apiClient.post(`/coding/problems/${id}/run`, data);
    return res.data;
  },
  submitCode: async (id: string, data: { code: string; language: string }) => {
    const res = await apiClient.post(`/coding/problems/${id}/submit`, data);
    return res.data;
  },
  askTutor: async (data: { topic: string; code: string }) => {
    const res = await apiClient.post('/coding/tutor/ask', data);
    return res.data;
  },
  reviewCode: async (id: string, data: { code: string; language: string }) => {
    const res = await apiClient.post(`/coding/problems/${id}/review`, data);
    return res.data;
  },
};

export const assignmentService = {
  getAssignments: async (courseId: string) => {
    const res = await apiClient.get(`/assignments/course/${courseId}`);
    return res.data;
  },
  getStudentSubmissions: async () => {
    const res = await apiClient.get('/assignments/submissions/student');
    return res.data;
  },
  getAssignmentById: async (id: string) => {
    const res = await apiClient.get(`/assignments/${id}`);
    return res.data;
  },
  submitAssignment: async (id: string, data: { githubUrl: string; submissionText?: string }) => {
    const res = await apiClient.post(`/assignments/${id}/submit`, data);
    return res.data;
  },
  getAssignmentSubmissions: async (id: string) => {
    const res = await apiClient.get(`/assignments/${id}/submissions`);
    return res.data;
  },
  gradeSubmission: async (submissionId: string, data: { pointsAwarded: number[]; feedbackComments: string }) => {
    const res = await apiClient.post(`/assignments/submissions/${submissionId}/grade`, data);
    return res.data;
  },
};

export const discussionService = {
  getDiscussions: async (lessonId: string) => {
    const res = await apiClient.get(`/discussions/lesson/${lessonId}`);
    return res.data;
  },
  createPost: async (data: { lessonId: string; content: string; parentId?: string }) => {
    const res = await apiClient.post('/discussions', data);
    return res.data;
  },
  toggleUpvote: async (id: string) => {
    const res = await apiClient.post(`/discussions/${id}/upvote`);
    return res.data;
  },
  moderatePost: async (id: string, action: string) => {
    const res = await apiClient.post(`/discussions/${id}/moderate`, { action });
    return res.data;
  },
};

export const gamificationService = {
  getAchievementsProfile: async () => {
    const res = await apiClient.get('/gamification/profile');
    return res.data;
  },
  checkAndUpdateStreak: async () => {
    const res = await apiClient.post('/gamification/streak');
    return res.data;
  },
  getNotifications: async () => {
    const res = await apiClient.get('/gamification/notifications');
    return res.data;
  },
  markNotificationsRead: async (notificationIds: string[]) => {
    const res = await apiClient.post('/gamification/notifications/read', { notificationIds });
    return res.data;
  },
};
