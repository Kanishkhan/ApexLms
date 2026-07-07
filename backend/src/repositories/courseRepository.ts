import { Course, ICourse } from '../models/Course';
import { mockCourses } from './mockMemoryDb';
import { Types } from 'mongoose';

export class CourseRepository {
  async findAll(filter: any = {}): Promise<any[]> {
    if (global.isMockDb) {
      let result = [...mockCourses];
      
      // Basic mock filtering for search and status
      if (filter.status) {
        result = result.filter((c) => c.status === filter.status);
      }
      if (filter.category) {
        result = result.filter((c) => c.category.toLowerCase() === filter.category.toLowerCase());
      }
      if (filter.$text && filter.$text.$search) {
        const query = filter.$text.$search.toLowerCase();
        result = result.filter((c) => 
          c.title.toLowerCase().includes(query) || 
          c.subtitle.toLowerCase().includes(query) || 
          c.description.toLowerCase().includes(query)
        );
      }
      return result;
    }
    return Course.find(filter).populate('instructor', 'name email avatarUrl');
  }

  async findById(id: string): Promise<any | null> {
    if (global.isMockDb) {
      return mockCourses.find((c) => c._id === id) || null;
    }
    if (!Types.ObjectId.isValid(id)) return null;
    return Course.findById(id).populate('instructor', 'name email avatarUrl');
  }

  async create(courseData: Partial<ICourse>): Promise<any> {
    if (global.isMockDb) {
      const newCourse = {
        ...courseData,
        _id: `c-${mockCourses.length + 1}`,
        instructor: String(courseData.instructor),
        studentsEnrolled: [],
        tags: courseData.tags || [],
        status: courseData.status || 'draft',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any;
      mockCourses.push(newCourse);
      return newCourse;
    }
    return Course.create(courseData);
  }

  async update(id: string, courseData: Partial<ICourse>): Promise<any | null> {
    if (global.isMockDb) {
      const idx = mockCourses.findIndex((c) => c._id === id);
      if (idx === -1) return null;
      mockCourses[idx] = {
        ...mockCourses[idx],
        ...courseData,
        updatedAt: new Date(),
      } as any;
      return mockCourses[idx];
    }
    return Course.findByIdAndUpdate(id, courseData, { new: true });
  }

  async delete(id: string): Promise<boolean> {
    if (global.isMockDb) {
      const idx = mockCourses.findIndex((c) => c._id === id);
      if (idx === -1) return false;
      mockCourses.splice(idx, 1);
      return true;
    }
    const result = await Course.findByIdAndDelete(id);
    return !!result;
  }

  async enrollStudent(courseId: string, studentId: string): Promise<boolean> {
    if (global.isMockDb) {
      const course = mockCourses.find((c) => c._id === courseId);
      if (!course) return false;
      if (!course.studentsEnrolled.includes(studentId)) {
        course.studentsEnrolled.push(studentId);
      }
      return true;
    }
    await Course.findByIdAndUpdate(courseId, {
      $addToSet: { studentsEnrolled: studentId },
    });
    return true;
  }
}

export const courseRepository = new CourseRepository();
