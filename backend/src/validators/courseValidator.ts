import { z } from 'zod';

export const createCourseSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  subtitle: z.string().min(5, 'Subtitle must be at least 5 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  thumbnailUrl: z.string().optional(),
  price: z.preprocess((val) => Number(val), z.number().min(0, 'Price must be 0 or more')),
  category: z.string().min(2, 'Category must be defined'),
  tags: z.array(z.string()).optional().default([]),
  level: z.enum(['beginner', 'intermediate', 'advanced']).default('beginner'),
});

export const updateCourseSchema = createCourseSchema.partial();

export const createModuleSchema = z.object({
  title: z.string().min(3, 'Module title must be at least 3 characters'),
  description: z.string().optional().default(''),
  order: z.preprocess((val) => Number(val), z.number().int().min(1)),
});

export const createLessonSchema = z.object({
  title: z.string().min(3, 'Lesson title must be at least 3 characters'),
  description: z.string().optional().default(''),
  type: z.enum(['video', 'pdf', 'text']),
  content: z.string().optional(),
  videoUrl: z.string().optional(),
  pdfUrl: z.string().optional(),
  order: z.preprocess((val) => Number(val), z.number().int().min(1)),
  duration: z.preprocess((val) => Number(val), z.number().min(0)).default(0),
  isFreePreview: z.preprocess((val) => val === 'true' || val === true, z.boolean()).default(false),
});
