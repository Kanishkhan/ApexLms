import { courseRepository } from '../repositories/courseRepository';
import { moduleRepository } from '../repositories/moduleRepository';
import { lessonRepository } from '../repositories/lessonRepository';
import { enrollmentRepository } from '../repositories/enrollmentRepository';
import { progressRepository } from '../repositories/progressRepository';
import { NotFoundError, BadRequestError } from '../utils/customErrors';

export class CourseService {
  async getCourses(filters: any = {}): Promise<any[]> {
    const query: any = { status: 'published' };
    if (filters.category) {
      query.category = filters.category;
    }
    if (filters.search) {
      query.$text = { $search: filters.search };
    }
    return courseRepository.findAll(query);
  }

  async getInstructorCourses(instructorId: string): Promise<any[]> {
    return courseRepository.findAll({ instructor: instructorId });
  }

  async getCourseById(id: string, studentId?: string): Promise<any> {
    const course = await courseRepository.findById(id);
    if (!course) throw new NotFoundError('Course not found');

    const modules = await moduleRepository.findByCourseId(id);
    const modulesWithLessons = await Promise.all(
      modules.map(async (mod) => {
        const lessons = await lessonRepository.findByModuleId(mod._id);
        
        // If student is logged in, attach progress state to each lesson
        const lessonsWithProgress = await Promise.all(
          lessons.map(async (les) => {
            let isCompleted = false;
            let bookmark = false;
            if (studentId) {
              const prog = await progressRepository.findByStudentAndLesson(studentId, les._id);
              if (prog) {
                isCompleted = prog.isCompleted;
                bookmark = prog.bookmark;
              }
            }
            return {
              ...les.toObject ? les.toObject() : les,
              isCompleted,
              bookmark,
            };
          })
        );

        return {
          ...mod.toObject ? mod.toObject() : mod,
          lessons: lessonsWithProgress,
        };
      })
    );

    let isEnrolled = false;
    let progressPercentage = 0;
    if (studentId) {
      const enrollment = await enrollmentRepository.findByStudentAndCourse(studentId, id);
      if (enrollment) {
        isEnrolled = true;
        progressPercentage = enrollment.progressPercentage;
      }
    }

    return {
      ...course.toObject ? course.toObject() : course,
      modules: modulesWithLessons,
      isEnrolled,
      progressPercentage,
    };
  }

  async createCourse(instructorId: string, courseData: any): Promise<any> {
    return courseRepository.create({
      ...courseData,
      instructor: instructorId,
      status: 'draft',
    });
  }

  async updateCourse(courseId: string, instructorId: string, courseData: any): Promise<any> {
    const course = await courseRepository.findById(courseId);
    if (!course) throw new NotFoundError('Course not found');
    
    // Check ownership
    const instId = course.instructor._id ? String(course.instructor._id) : String(course.instructor);
    if (instId !== instructorId) {
      throw new BadRequestError('You do not own this course');
    }

    return courseRepository.update(courseId, courseData);
  }

  async deleteCourse(courseId: string, instructorId: string): Promise<void> {
    const course = await courseRepository.findById(courseId);
    if (!course) throw new NotFoundError('Course not found');
    
    const instId = course.instructor._id ? String(course.instructor._id) : String(course.instructor);
    if (instId !== instructorId) {
      throw new BadRequestError('You do not own this course');
    }

    await courseRepository.delete(courseId);
  }

  async addModule(courseId: string, instructorId: string, moduleData: any): Promise<any> {
    const course = await courseRepository.findById(courseId);
    if (!course) throw new NotFoundError('Course not found');

    const instId = course.instructor._id ? String(course.instructor._id) : String(course.instructor);
    if (instId !== instructorId) {
      throw new BadRequestError('You do not own this course');
    }

    return moduleRepository.create({
      ...moduleData,
      course: courseId,
    });
  }

  async addLesson(moduleId: string, instructorId: string, lessonData: any): Promise<any> {
    const mod = await moduleRepository.findById(moduleId);
    if (!mod) throw new NotFoundError('Module not found');

    const course = await courseRepository.findById(String(mod.course));
    if (!course) throw new NotFoundError('Parent course not found');

    const instId = course.instructor._id ? String(course.instructor._id) : String(course.instructor);
    if (instId !== instructorId) {
      throw new BadRequestError('You do not own this course');
    }

    return lessonRepository.create({
      ...lessonData,
      module: moduleId,
      course: course._id,
    });
  }

  async enroll(studentId: string, courseId: string): Promise<any> {
    const course = await courseRepository.findById(courseId);
    if (!course) throw new NotFoundError('Course not found');
    if (course.status !== 'published') {
      throw new BadRequestError('Cannot enroll in draft course');
    }

    const existing = await enrollmentRepository.findByStudentAndCourse(studentId, courseId);
    if (existing) {
      return existing;
    }

    const enrollment = await enrollmentRepository.create({
      student: studentId as any,
      course: courseId as any,
    });

    await courseRepository.enrollStudent(courseId, studentId);
    return enrollment;
  }

  async getEnrolledCourses(studentId: string): Promise<any[]> {
    const enrollments = await enrollmentRepository.findByStudentId(studentId);
    return Promise.all(
      enrollments.map(async (e) => {
        const course = e.course;
        return {
          id: course._id || course.id,
          title: course.title,
          subtitle: course.subtitle,
          thumbnailUrl: course.thumbnailUrl,
          instructor: course.instructor,
          progressPercentage: e.progressPercentage,
          completedAt: e.completedAt,
          enrolledAt: e.enrolledAt,
        };
      })
    );
  }

  async toggleLessonProgress(
    studentId: string,
    lessonId: string,
    completed: boolean
  ): Promise<any> {
    const lesson = await lessonRepository.findById(lessonId);
    if (!lesson) throw new NotFoundError('Lesson not found');

    const progress = await progressRepository.createOrUpdate(
      studentId,
      String(lesson.course),
      lessonId,
      { isCompleted: completed }
    );

    // Update aggregate progress for course enrollment
    const courseId = String(lesson.course);
    const allLessons = await lessonRepository.findByCourseId(courseId);
    const completedCount = await progressRepository.getCompletedLessonsCount(studentId, courseId);

    const progressPercentage = allLessons.length > 0 
      ? Math.round((completedCount / allLessons.length) * 100) 
      : 0;

    await enrollmentRepository.updateProgress(studentId, courseId, progressPercentage);

    return {
      progress,
      progressPercentage,
    };
  }

  async toggleLessonBookmark(
    studentId: string,
    lessonId: string,
    bookmark: boolean
  ): Promise<any> {
    const lesson = await lessonRepository.findById(lessonId);
    if (!lesson) throw new NotFoundError('Lesson not found');

    return progressRepository.createOrUpdate(
      studentId,
      String(lesson.course),
      lessonId,
      { bookmark }
    );
  }
}

export const courseService = new CourseService();
