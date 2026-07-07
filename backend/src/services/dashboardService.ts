import { Types } from 'mongoose';
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
    const enrolledIds = enrollments
      .filter((e: any) => e.course) // null guard
      .map((e: any) => String(e.course._id || e.course));
    const notEnrolled = allCourses.filter((c) => !enrolledIds.includes(String(c._id)));

    const enrolledCategories = enrollments
      .filter((e: any) => e.course)
      .map((e: any) => e.course.category);
    const recommended = notEnrolled
      .filter((c) => enrolledCategories.includes(c.category))
      .slice(0, 3);

    // Fallback if no matching categories, show first 3
    const finalRecommended = recommended.length > 0 ? recommended : notEnrolled.slice(0, 3);

    return {
      enrolledCount: enrollments.length,
      completedCount: enrollments.filter((e: any) => e.progressPercentage >= 100).length,
      inProgressCount: enrollments.filter((e: any) => e.progressPercentage < 100).length,
      enrollments: enrollments
        .filter((e: any) => e.course) // skip orphaned
        .map((e) => ({
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
      })),
    };
  }

  async getInstructorDashboard(instructorId: string): Promise<any> {
    // In MongoDB mode, cast instructorId to ObjectId for proper query matching
    let instructorFilter: any;
    if (global.isMockDb) {
      instructorFilter = { instructor: instructorId };
    } else {
      if (Types.ObjectId.isValid(instructorId)) {
        instructorFilter = { instructor: new Types.ObjectId(instructorId) };
      } else {
        instructorFilter = { instructor: instructorId };
      }
    }

    const courses = await courseRepository.findAll(instructorFilter);
    const courseIds = courses.map((c) => String(c._id));

    const allEnrollments = await enrollmentRepository.findAll();
    // Filter out any enrollments with null/deleted course references
    const courseEnrollments = allEnrollments.filter((e: any) => {
      if (!e.course) return false;
      const eCourseId = String(e.course._id || e.course);
      return courseIds.includes(eCourseId);
    });

    const totalStudents = new Set(
      courseEnrollments.map((e) => String(e.student?._id || e.student))
    ).size;

    // Revenue metric removed

    const courseStats = courses.map((course) => {
      const courseEnrs = courseEnrollments.filter(
        (e: any) => String(e.course?._id || e.course) === String(course._id)
      );
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
      courseStats,
      recentEnrollments: courseEnrollments.slice(0, 5).map((e) => ({
        studentName: e.student?.name || 'Unknown Student',
        courseTitle: e.course?.title || 'Unknown Course',
        enrolledAt: e.enrolledAt,
      })),
    };
  }

  async getAdminDashboard(): Promise<any> {
    const users = await userRepository.findAll();
    const courses = await courseRepository.findAll({});
    const enrollmentsCount = await enrollmentRepository.countAll();
    const quizAttemptsCount = await quizAttemptRepository.countAll();

    const byRole = users.reduce((acc: any, u) => {
      acc[u.role] = (acc[u.role] || 0) + 1;
      return acc;
    }, {});

    return {
      totalUsers: users.length,
      usersByRole: byRole,
      totalCourses: courses.length,
      publishedCourses: courses.filter((c) => c.status === 'published').length,
      draftCourses: courses.filter((c) => c.status === 'draft').length,
      totalEnrollments: enrollmentsCount,
      totalQuizAttempts: quizAttemptsCount,
      recentUsers: users
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)
        .map((u) => ({
          id: u._id,
          name: u.name,
          email: u.email,
          role: u.role,
          createdAt: u.createdAt,
        })),
      topCourses: courses
        .sort((a, b) => (b.studentsEnrolled?.length || 0) - (a.studentsEnrolled?.length || 0))
        .slice(0, 5)
        .map((c) => ({
          id: c._id,
          title: c.title,
          category: c.category,
          enrollments: c.studentsEnrolled?.length || 0,
          status: c.status,
        })),
    };
  }
}

export const dashboardService = new DashboardService();
