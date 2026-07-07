import { z } from 'zod';

export const createCourseSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  subtitle: z.string().optional().default(''),
  description: z.string().min(1, 'Description is required'),
  thumbnailUrl: z.string().optional(),
  category: z.string().min(1, 'Category must be defined'),
  tags: z.array(z.string()).optional().default([]),
  level: z.enum(['beginner', 'intermediate', 'advanced']).default('beginner'),
});

export const updateCourseSchema = createCourseSchema.partial();

export const createModuleSchema = z.object({
  title: z.string().min(1, 'Module title is required'),
  description: z.string().optional().default(''),
  order: z.preprocess((val) => Number(val), z.number().int().min(1)),
});

export const createLessonSchema = z.object({
  title: z.string().min(1, 'Lesson title is required'),
  description: z.string().optional().default(''),
  type: z.enum(['video', 'pdf', 'text']),
  content: z.string().optional(),
  videoUrl: z.string().optional(),
  pdfUrl: z.string().optional(),
  order: z.preprocess((val) => Number(val), z.number().int().min(1)),
  duration: z.preprocess((val) => Number(val), z.number().min(0)).default(0),
  isFreePreview: z.preprocess((val) => val === 'true' || val === true, z.boolean()).default(false),
});
