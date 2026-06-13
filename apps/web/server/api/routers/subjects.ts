import { z } from 'zod'
import { createTRPCRouter, publicProcedure, adminProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

export const subjectsRouter = createTRPCRouter({
  list: publicProcedure
    .input(z.object({
      category: z.string().optional(),
      isActive: z.boolean().default(true),
      semesterId: z.string().cuid().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const where: any = {}
      if (input?.category) where.category = input.category
      if (input?.isActive !== undefined) where.isActive = input.isActive
      if (input?.semesterId) where.semesterId = input.semesterId

      return ctx.db.subject.findMany({
        where,
        include: {
          semester: true
        },
        orderBy: { sortOrder: 'asc' },
      })
    }),

  byId: publicProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const subject = await ctx.db.subject.findUnique({
        where: { id: input.id },
        include: { 
          papers: true, 
          questions: true,
          semester: true,
          studyResources: true,
          syllabusVersions: { orderBy: { version: 'desc' } }
        },
      })
      if (!subject) throw new TRPCError({ code: 'NOT_FOUND' })
      return subject
    }),

  create: adminProcedure
    .input(z.object({
      name: z.string().min(2),
      code: z.string().min(2),
      description: z.string().optional(),
      category: z.string().min(2),
      sortOrder: z.number().int().default(0),
      credits: z.number().int().default(3),
      semesterId: z.string().cuid().optional().nullable(),
      facultyName: z.string().optional().nullable(),
      facultyEmail: z.string().email().optional().nullable(),
      thumbnail: z.string().optional().nullable(),
    }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.subject.findUnique({
        where: { code: input.code },
      })
      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Subject with this code already exists',
        })
      }
      return ctx.db.subject.create({
        data: input,
      })
    }),

  update: adminProcedure
    .input(z.object({
      id: z.string().cuid(),
      name: z.string().min(2).optional(),
      code: z.string().min(2).optional(),
      description: z.string().optional(),
      category: z.string().optional(),
      sortOrder: z.number().int().optional(),
      credits: z.number().int().optional(),
      semesterId: z.string().cuid().optional().nullable(),
      facultyName: z.string().optional().nullable(),
      facultyEmail: z.string().email().optional().nullable(),
      thumbnail: z.string().optional().nullable(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input
      return ctx.db.subject.update({
        where: { id },
        data,
      })
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.subject.delete({
        where: { id: input.id },
      })
      return { success: true }
    }),
})
