import { Enrollment, IEnrollment } from '../models/Enrollment';
import { mockEnrollments } from './mockMemoryDb';
import { Types } from 'mongoose';

export class EnrollmentRepository {
  async findByStudentAndCourse(studentId: string, courseId: string): Promise<any | null> {
    if (global.isMockDb) {
      return mockEnrollments.find((e) => e.student === studentId && e.course === courseId) || null;
    }
    return Enrollment.findOne({ student: studentId, course: courseId });
  }

  async findByStudentId(studentId: string): Promise<any[]> {
    if (global.isMockDb) {
      return mockEnrollments.filter((e) => e.student === studentId);
    }
    return Enrollment.find({ student: studentId }).populate({
      path: 'course',
      populate: { path: 'instructor', select: 'name email avatarUrl' }
    });
  }

  async findByCourseId(courseId: string): Promise<any[]> {
    if (global.isMockDb) {
      return mockEnrollments.filter((e) => e.course === courseId);
    }
    return Enrollment.find({ course: courseId }).populate('student', 'name email avatarUrl');
  }

  async create(enrollmentData: Partial<IEnrollment>): Promise<any> {
    if (global.isMockDb) {
      const newEnrollment = {
        _id: `e-${mockEnrollments.length + 1}`,
        student: String(enrollmentData.student),
        course: String(enrollmentData.course),
        progressPercentage: 0,
        enrolledAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any;
      mockEnrollments.push(newEnrollment);
      return newEnrollment;
    }
    return Enrollment.create(enrollmentData);
  }

  async updateProgress(studentId: string, courseId: string, progressPercentage: number): Promise<any | null> {
    if (global.isMockDb) {
      const enrollment = mockEnrollments.find((e) => e.student === studentId && e.course === courseId);
      if (!enrollment) return null;
      enrollment.progressPercentage = progressPercentage;
      if (progressPercentage >= 100 && !enrollment.completedAt) {
        enrollment.completedAt = new Date();
      }
      return enrollment;
    }
    const update: any = { progressPercentage };
    if (progressPercentage >= 100) {
      update.completedAt = new Date();
    }
    return Enrollment.findOneAndUpdate(
      { student: studentId, course: courseId },
      { $set: update },
      { new: true }
    );
  }

  async countAll(): Promise<number> {
    if (global.isMockDb) {
      return mockEnrollments.length;
    }
    return Enrollment.countDocuments({});
  }

  async findAll(): Promise<any[]> {
    if (global.isMockDb) {
      return mockEnrollments;
    }
    return Enrollment.find({}).populate('student', 'name email').populate('course', 'title price');
  }
}

export const enrollmentRepository = new EnrollmentRepository();
