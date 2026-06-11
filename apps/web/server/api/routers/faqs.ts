import { z } from 'zod'
import { createTRPCRouter, publicProcedure, adminProcedure } from '../trpc'
import { FAQCreateSchema } from '@examedge/validators'

export const faqsRouter = createTRPCRouter({
  list: publicProcedure
    .input(z.object({
      category:  z.string().optional(),
      subjectId: z.string().cuid().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const where: any = { isPublished: true }
      if (input?.category) where.category = input.category
      if (input?.subjectId) where.subjectId = input.subjectId

      return ctx.db.fAQ.findMany({
        where,
        orderBy: { sortOrder: 'asc' },
      })
    }),

  create: adminProcedure
    .input(FAQCreateSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.fAQ.create({
        data: {
          ...input,
          isPublished: true,
          createdBy: (ctx.session.user as any).id,
        },
      })
    }),

  update: adminProcedure
    .input(FAQCreateSchema.partial().extend({ id: z.string().cuid(), isPublished: z.boolean().optional() }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input
      return ctx.db.fAQ.update({
        where: { id },
        data,
      })
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.fAQ.delete({
        where: { id: input.id },
      })
      return { success: true }
    }),
})
