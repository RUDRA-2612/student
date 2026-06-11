import { z } from 'zod'

export const PaperCreateSchema = z.object({
  title:       z.string().min(3).max(200),
  subjectId:   z.string().cuid(),
  year:        z.number().int().min(1990).max(new Date().getFullYear() + 1),
  examType:    z.enum(['MIDTERM', 'FINAL', 'COMPETITIVE', 'MOCK', 'ASSIGNMENT']),
  university:  z.string().min(2).max(200),
  difficulty:  z.enum(['EASY', 'MEDIUM', 'HARD']).default('MEDIUM'),
  pdfUrl:      z.string().url().optional().nullable(),
  pdfKey:      z.string().optional().nullable(),
  videoUrl:    z.string().url().optional().nullable(),
  tags:        z.array(z.string()).default([]),
})

export const SubjectCreateSchema = z.object({
  name:        z.string().min(2).max(100),
  code:        z.string().min(2).max(20),
  description: z.string().max(1000).optional(),
  category:    z.string().min(2).max(50),
  sortOrder:   z.number().int().default(0),
})

export const QuestionCreateSchema = z.object({
  subjectId:     z.string().cuid(),
  text:          z.string().min(5),
  topic:         z.string().min(2),
  chapter:       z.string().optional().nullable(),
  type:          z.enum(['SHORT_ANSWER', 'LONG_ANSWER', 'MCQ', 'NUMERICAL', 'CASE_STUDY']),
  marks:         z.number().int().min(1),
  importance:    z.enum(['VERY_HIGH', 'HIGH', 'MEDIUM', 'LOW']),
  yearLastAsked: z.number().int().optional().nullable(),
  modelAnswer:   z.string().optional().nullable(),
})

export const RequestCreateSchema = z.object({
  subjectId: z.string().cuid().optional().nullable(),
  type:      z.enum(['PAPER_REQUEST', 'SOLUTION_REQUEST', 'TOPIC_CLARIFICATION', 'BUG_REPORT', 'FEATURE_REQUEST', 'OTHER']),
  title:     z.string().min(3).max(200),
  message:   z.string().min(10),
})

export const FAQCreateSchema = z.object({
  question:    z.string().min(5),
  answer:      z.string().min(5),
  category:    z.string().min(2),
  subjectId:   z.string().cuid().optional().nullable(),
  sortOrder:   z.number().int().default(0),
})

export const AnnouncementCreateSchema = z.object({
  title:     z.string().min(3).max(200),
  message:   z.string().min(5),
  type:      z.enum(['INFO', 'WARNING', 'IMPORTANT', 'MAINTENANCE']).default('INFO'),
  isActive:  z.boolean().default(true),
  targetAll: z.boolean().default(true),
  subjects:  z.array(z.string()).default([]),
  expiresAt: z.string().datetime().optional().nullable(),
})
