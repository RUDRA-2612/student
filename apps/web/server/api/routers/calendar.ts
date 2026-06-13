import { z } from 'zod'
import { createTRPCRouter, publicProcedure, adminProcedure } from '../trpc'

export const calendarRouter = createTRPCRouter({
  list: publicProcedure
    .input(z.object({
      type: z.enum(['MIDTERM1', 'MIDTERM2', 'QUIZ', 'ENDTERM', 'REGISTRATION', 'HOLIDAY', 'EVENT', 'PLACEMENT']).optional(),
      year: z.number().optional(),
      month: z.number().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const where: any = {}
      if (input?.type) where.type = input.type

      if (input?.year !== undefined && input?.month !== undefined) {
        const startDate = new Date(input.year, input.month, 1)
        const endDate = new Date(input.year, input.month + 1, 0, 23, 59, 59)
        where.date = {
          gte: startDate,
          lte: endDate,
        }
      }

      return ctx.db.calendarEvent.findMany({
        where,
        orderBy: { date: 'asc' },
      })
    }),

  create: adminProcedure
    .input(z.object({
      title: z.string().min(1),
      description: z.string().optional(),
      type: z.enum(['MIDTERM1', 'MIDTERM2', 'QUIZ', 'ENDTERM', 'REGISTRATION', 'HOLIDAY', 'EVENT', 'PLACEMENT']),
      date: z.date(),
      startDate: z.date().optional(),
      endDate: z.date().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.calendarEvent.create({
        data: {
          ...input,
          createdBy: (ctx.session.user as any).id,
        },
      })
    }),

  update: adminProcedure
    .input(z.object({
      id: z.string().cuid(),
      title: z.string().min(1).optional(),
      description: z.string().optional(),
      type: z.enum(['MIDTERM1', 'MIDTERM2', 'QUIZ', 'ENDTERM', 'REGISTRATION', 'HOLIDAY', 'EVENT', 'PLACEMENT']).optional(),
      date: z.date().optional(),
      startDate: z.date().optional(),
      endDate: z.date().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input
      return ctx.db.calendarEvent.update({
        where: { id },
        data,
      })
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.calendarEvent.delete({
        where: { id: input.id },
      })
      return { success: true }
    }),
})
