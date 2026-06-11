import { z } from 'zod'
import { createTRPCRouter, publicProcedure, adminProcedure } from '../trpc'
import { SubjectCreateSchema } from '@examedge/validators'
import { TRPCError } from '@trpc/server'

export const subjectsRouter = createTRPCRouter({
  list: publicProcedure
    .input(z.object({
      category: z.string().optional(),
      isActive: z.boolean().default(true),
    }).optional())
    .query(async ({ ctx, input }) => {
      const where: any = {}
      if (input?.category) where.category = input.category
      if (input?.isActive !== undefined) where.isActive = input.isActive

      return ctx.db.subject.findMany({
        where,
        orderBy: { sortOrder: 'asc' },
      })
    }),

  byId: publicProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const subject = await ctx.db.subject.findUnique({
        where: { id: input.id },
        include: { papers: true, questions: true },
      })
      if (!subject) throw new TRPCError({ code: 'NOT_FOUND' })
      return subject
    }),

  create: adminProcedure
    .input(SubjectCreateSchema)
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
    .input(SubjectCreateSchema.partial().extend({ id: z.string().cuid(), isActive: z.boolean().optional() }))
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
