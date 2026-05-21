import { Progress, IProgress } from '../models/Progress';
import { mockProgress } from './mockMemoryDb';
import { Types } from 'mongoose';

export class ProgressRepository {
  async findByStudentAndCourse(studentId: string, courseId: string): Promise<any[]> {
    if (global.isMockDb) {
      return mockProgress.filter((p) => p.student === studentId && p.course === courseId);
    }
    return Progress.find({ student: studentId, course: courseId });
  }

  async findByStudentAndLesson(studentId: string, lessonId: string): Promise<any | null> {
    if (global.isMockDb) {
      return mockProgress.find((p) => p.student === studentId && p.lesson === lessonId) || null;
    }
    return Progress.findOne({ student: studentId, lesson: lessonId });
  }

  async createOrUpdate(
    studentId: string,
    courseId: string,
    lessonId: string,
    updateData: { isCompleted?: boolean; bookmark?: boolean }
  ): Promise<any> {
    if (global.isMockDb) {
      let progressObj = mockProgress.find((p) => p.student === studentId && p.lesson === lessonId);
      if (!progressObj) {
        progressObj = {
          _id: `p-${mockProgress.length + 1}`,
          student: studentId,
          course: courseId,
          lesson: lessonId,
          isCompleted: false,
          bookmark: false,
          lastViewedAt: new Date(),
        };
        mockProgress.push(progressObj);
      }
      if (updateData.isCompleted !== undefined) {
        progressObj.isCompleted = updateData.isCompleted;
      }
      if (updateData.bookmark !== undefined) {
        progressObj.bookmark = updateData.bookmark;
      }
      progressObj.lastViewedAt = new Date();
      return progressObj;
    }
    return Progress.findOneAndUpdate(
      { student: studentId, lesson: lessonId },
      {
        $set: {
          ...updateData,
          course: courseId,
          lastViewedAt: new Date(),
        },
      },
      { new: true, upsert: true }
    );
  }

  async getCompletedLessonsCount(studentId: string, courseId: string): Promise<number> {
    if (global.isMockDb) {
      return mockProgress.filter((p) => p.student === studentId && p.course === courseId && p.isCompleted).length;
    }
    return Progress.countDocuments({ student: studentId, course: courseId, isCompleted: true });
  }
}

export const progressRepository = new ProgressRepository();
