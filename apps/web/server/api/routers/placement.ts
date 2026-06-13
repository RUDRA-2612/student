import { z } from 'zod'
import { createTRPCRouter, publicProcedure, adminProcedure } from '../trpc'

export const placementRouter = createTRPCRouter({
  list: publicProcedure
    .input(z.object({
      category: z.enum(['DSA_SHEET', 'APTITUDE', 'INTERVIEW_Q', 'RESUME', 'HR', 'CODING_CHALLENGE']).optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const where: any = {}
      if (input?.category) where.category = input.category

      return ctx.db.placementResource.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      })
    }),

  create: adminProcedure
    .input(z.object({
      title: z.string().min(1),
      category: z.enum(['DSA_SHEET', 'APTITUDE', 'INTERVIEW_Q', 'RESUME', 'HR', 'CODING_CHALLENGE']),
      content: z.string().optional(),
      url: z.string().url().optional(),
      fileKey: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.placementResource.create({
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
      category: z.enum(['DSA_SHEET', 'APTITUDE', 'INTERVIEW_Q', 'RESUME', 'HR', 'CODING_CHALLENGE']).optional(),
      content: z.string().optional(),
      url: z.string().url().optional(),
      fileKey: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input
      return ctx.db.placementResource.update({
        where: { id },
        data,
      })
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.placementResource.delete({
        where: { id: input.id },
      })
      return { success: true }
    }),
})
