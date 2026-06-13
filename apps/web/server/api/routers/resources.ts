import { z } from 'zod'
import { createTRPCRouter, publicProcedure, adminProcedure } from '../trpc'

export const resourcesRouter = createTRPCRouter({
  list: publicProcedure
    .input(z.object({
      subjectId: z.string().cuid().optional(),
      type: z.enum(['NOTES', 'PPT', 'LAB_MANUAL', 'CHEAT_SHEET', 'YOUTUBE_PLAYLIST', 'VIDEO', 'EXTERNAL']).optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const where: any = {}
      if (input?.subjectId) where.subjectId = input.subjectId
      if (input?.type) where.type = input.type

      return ctx.db.studyResource.findMany({
        where,
        include: {
          subject: { select: { name: true, code: true } }
        },
        orderBy: { createdAt: 'desc' },
      })
    }),

  create: adminProcedure
    .input(z.object({
      title: z.string().min(1),
      type: z.enum(['NOTES', 'PPT', 'LAB_MANUAL', 'CHEAT_SHEET', 'YOUTUBE_PLAYLIST', 'VIDEO', 'EXTERNAL']),
      url: z.string().url(),
      fileKey: z.string().optional(),
      subjectId: z.string().cuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.studyResource.create({
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
      type: z.enum(['NOTES', 'PPT', 'LAB_MANUAL', 'CHEAT_SHEET', 'YOUTUBE_PLAYLIST', 'VIDEO', 'EXTERNAL']).optional(),
      url: z.string().url().optional(),
      fileKey: z.string().optional(),
      subjectId: z.string().cuid().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input
      return ctx.db.studyResource.update({
        where: { id },
        data,
      })
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.studyResource.delete({
        where: { id: input.id },
      })
      return { success: true }
    }),
})
