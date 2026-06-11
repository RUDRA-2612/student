import { z } from 'zod'
import { createTRPCRouter, publicProcedure, protectedProcedure, adminProcedure } from '../trpc'
import { QuestionCreateSchema } from '@examedge/validators'
import { TRPCError } from '@trpc/server'

export const questionsRouter = createTRPCRouter({
  list: publicProcedure
    .input(z.object({
      subjectId: z.string().cuid().optional(),
      topic:     z.string().optional(),
      importance: z.enum(['VERY_HIGH', 'HIGH', 'MEDIUM', 'LOW']).optional(),
      difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).optional(),
      isActive:   z.boolean().default(true),
    }))
    .query(async ({ ctx, input }) => {
      const { subjectId, topic, importance, isActive } = input
      const where: any = {}
      if (subjectId) where.subjectId = subjectId
      if (topic) where.topic = topic
      if (importance) where.importance = importance
      if (isActive !== undefined) where.isPublished = isActive

      return ctx.db.question.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      })
    }),

  byId: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const question = await ctx.db.question.findUnique({
        where: { id: input.id },
        include: { subject: true, tags: true },
      })
      if (!question) throw new TRPCError({ code: 'NOT_FOUND' })
      return question
    }),

  create: adminProcedure
    .input(QuestionCreateSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.question.create({
        data: {
          ...input,
          createdBy: (ctx.session.user as any).id,
        },
      })
    }),

  update: adminProcedure
    .input(QuestionCreateSchema.partial().extend({ id: z.string().cuid(), isPublished: z.boolean().optional() }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input
      return ctx.db.question.update({
        where: { id },
        data,
      })
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.question.delete({
        where: { id: input.id },
      })
      return { success: true }
    }),
})
