import { z } from 'zod'
import { createTRPCRouter, publicProcedure, adminProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

const SolutionUpsertSchema = z.object({
  paperId:     z.string().cuid(),
  content:     z.string().min(5),
  videoUrl:    z.string().url().optional().nullable(),
  isPublished: z.boolean().default(true),
})

export const solutionsRouter = createTRPCRouter({
  byPaperId: publicProcedure
    .input(z.object({ paperId: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const solution = await ctx.db.solution.findUnique({
        where: { paperId: input.paperId },
      })
      if (!solution) throw new TRPCError({ code: 'NOT_FOUND', message: 'No solution found for this paper' })
      return solution
    }),

  upsert: adminProcedure
    .input(SolutionUpsertSchema)
    .mutation(async ({ ctx, input }) => {
      const { paperId, ...data } = input
      const existing = await ctx.db.solution.findUnique({
        where: { paperId },
      })

      if (existing) {
        return ctx.db.solution.update({
          where: { paperId },
          data: {
            ...data,
            createdBy: (ctx.session.user as any).id,
          },
        })
      } else {
        return ctx.db.solution.create({
          data: {
            paperId,
            ...data,
            createdBy: (ctx.session.user as any).id,
          },
        })
      }
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.solution.delete({
        where: { id: input.id },
      })
      return { success: true }
    }),
})
