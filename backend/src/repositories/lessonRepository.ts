import { Lesson, ILesson } from '../models/Lesson';
import { mockLessons } from './mockMemoryDb';
import { Types } from 'mongoose';

export class LessonRepository {
  async findByModuleId(moduleId: string): Promise<any[]> {
    if (global.isMockDb) {
      return mockLessons
        .filter((l) => l.module === moduleId)
        .sort((a, b) => a.order - b.order);
    }
    return Lesson.find({ module: moduleId }).sort({ order: 1 });
  }

  async findByCourseId(courseId: string): Promise<any[]> {
    if (global.isMockDb) {
      return mockLessons.filter((l) => l.course === courseId);
    }
    return Lesson.find({ course: courseId }).sort({ order: 1 });
  }

  async findById(id: string): Promise<any | null> {
    if (global.isMockDb) {
      return mockLessons.find((l) => l._id === id) || null;
    }
    if (!Types.ObjectId.isValid(id)) return null;
    return Lesson.findById(id);
  }

  async create(lessonData: Partial<ILesson>): Promise<any> {
    if (global.isMockDb) {
      const newLesson = {
        ...lessonData,
        _id: `l-${mockLessons.length + 1}`,
        module: String(lessonData.module),
        course: String(lessonData.course),
        title: lessonData.title || '',
        description: lessonData.description || '',
        type: lessonData.type || 'text',
        content: lessonData.content || '',
        videoUrl: lessonData.videoUrl || '',
        pdfUrl: lessonData.pdfUrl || '',
        order: Number(lessonData.order) || 1,
        duration: Number(lessonData.duration) || 0,
        isFreePreview: !!lessonData.isFreePreview,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any;
      mockLessons.push(newLesson);
      return newLesson;
    }
    return Lesson.create(lessonData);
  }

  async update(id: string, lessonData: Partial<ILesson>): Promise<any | null> {
    if (global.isMockDb) {
      const idx = mockLessons.findIndex((l) => l._id === id);
      if (idx === -1) return null;
      mockLessons[idx] = {
        ...mockLessons[idx],
        ...lessonData,
        updatedAt: new Date(),
      } as any;
      return mockLessons[idx];
    }
    return Lesson.findByIdAndUpdate(id, lessonData, { new: true });
  }

  async delete(id: string): Promise<boolean> {
    if (global.isMockDb) {
      const idx = mockLessons.findIndex((l) => l._id === id);
      if (idx === -1) return false;
      mockLessons.splice(idx, 1);
      return true;
    }
    const result = await Lesson.findByIdAndDelete(id);
    return !!result;
  }
}

export const lessonRepository = new LessonRepository();
