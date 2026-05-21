import { courseRepository } from '../repositories/courseRepository';
import { enrollmentRepository } from '../repositories/enrollmentRepository';
import { quizAttemptRepository } from '../repositories/quizAttemptRepository';
import { userRepository } from '../repositories/userRepository';
import { mockProgress } from '../repositories/mockMemoryDb';
import { Progress } from '../models/Progress';

export class DashboardService {
  async getStudentDashboard(studentId: string): Promise<any> {
    const enrollments = await enrollmentRepository.findByStudentId(studentId);
    
    // Bookmarked lessons retrieval
    let bookmarks: any[] = [];
    if (global.isMockDb) {
      bookmarks = mockProgress.filter((p) => p.student === studentId && p.bookmark);
    } else {
      bookmarks = await Progress.find({ student: studentId, bookmark: true }).populate('lesson');
    }

    // Dynamic recommendations based on category of enrolled courses
    const allCourses = await courseRepository.findAll({ status: 'published' });
    const enrolledIds = enrollments.map((e: any) => String(e.course._id || e.course));
    const notEnrolled = allCourses.filter((c) => !enrolledIds.includes(String(c._id)));
    
    const enrolledCategories = enrollments.map((e: any) => e.course.category);
    const recommended = notEnrolled
      .filter((c) => enrolledCategories.includes(c.category))
      .slice(0, 3);

    // Fallback if no matching categories, show first 3
    const finalRecommended = recommended.length > 0 ? recommended : notEnrolled.slice(0, 3);

    return {
      enrolledCount: enrollments.length,
      completedCount: enrollments.filter((e: any) => e.progressPercentage >= 100).length,
      inProgressCount: enrollments.filter((e: any) => e.progressPercentage < 100).length,
      enrollments: enrollments.map((e) => ({
        id: e.course._id || e.course.id,
        title: e.course.title,
        subtitle: e.course.subtitle,
        thumbnailUrl: e.course.thumbnailUrl,
        progressPercentage: e.progressPercentage,
      })),
      bookmarks: bookmarks.map((b) => ({
        lessonId: b.lesson?._id || b.lesson,
        title: b.lesson?.title || 'Bookmarked Lesson',
        courseId: b.course,
      })),
      recommendations: finalRecommended.map((c) => ({
        id: c._id,
        title: c.title,
        subtitle: c.subtitle,
        thumbnailUrl: c.thumbnailUrl,
        category: c.category,
        price: c.price,
      })),
    };
  }

  async getInstructorDashboard(instructorId: string): Promise<any> {
    const courses = await courseRepository.findAll({ instructor: instructorId });
    const courseIds = courses.map((c) => String(c._id));

    const enrollments = await enrollmentRepository.findAll();
    const courseEnrollments = enrollments.filter((e: any) => 
      courseIds.includes(String(e.course._id || e.course))
    );

    const totalStudents = new Set(courseEnrollments.map((e) => String(e.student._id || e.student))).size;
    const revenue = courseEnrollments.reduce((acc, curr) => acc + (curr.course.price || 0), 0);

    const courseStats = courses.map((course) => {
      const courseEnrs = courseEnrollments.filter((e: any) => String(e.course._id || e.course) === String(course._id));
      return {
        id: course._id,
        title: course.title,
        status: course.status,
        enrollments: courseEnrs.length,
        completions: courseEnrs.filter((e) => e.progressPercentage >= 100).length,
      };
    });

    return {
      courseCount: courses.length,
      totalStudents,
      revenue,
      courseStats,
      recentEnrollments: courseEnrollments.slice(0, 5).map((e) => ({
        studentName: e.student.name,
        courseTitle: e.course.title,
        enrolledAt: e.enrolledAt,
      })),
    };
  }

  async getAdminDashboard(): Promise<any> {
    const users = await userRepository.findAll();
    const courses = await courseRepository.findAll();
    const enrollmentsCount = await enrollmentRepository.countAll();
    const quizAttemptsCount = await quizAttemptRepository.countAll();

    const students = users.filter((u) => u.role === 'student');
    const instructors = users.filter((u) => u.role === 'instructor');

    return {
      totalUsers: users.length,
      studentCount: students.length,
      instructorCount: instructors.length,
      courseCount: courses.length,
      publishedCourseCount: courses.filter((c) => c.status === 'published').length,
      draftCourseCount: courses.filter((c) => c.status === 'draft').length,
      enrollmentsCount,
      quizAttemptsCount,
      users: users.slice(0, 10).map((u) => ({
        id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
        createdAt: u.createdAt,
      })),
    };
  }
}

export const dashboardService = new DashboardService();
