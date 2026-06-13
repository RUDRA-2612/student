import { z } from 'zod'
import { createTRPCRouter, protectedProcedure, adminProcedure } from '../trpc'
import { AnnouncementCreateSchema } from '@examedge/validators'

export const announcementsRouter = createTRPCRouter({
  list: protectedProcedure
    .input(z.object({
      subjectId: z.string().cuid().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const now = new Date()
      const expiryFilter = {
        OR: [
          { expiresAt: null },
          { expiresAt: { gte: now } },
        ],
      }

      const targetFilter = input?.subjectId
        ? {
            OR: [
              { targetAll: true },
              { subjects: { has: input.subjectId } },
            ],
          }
        : { targetAll: true }

      const where = {
        isActive: true,
        AND: [expiryFilter, targetFilter],
      }

      return ctx.db.announcement.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      })
    }),

  create: adminProcedure
    .input(AnnouncementCreateSchema)
    .mutation(async ({ ctx, input }) => {
      const { expiresAt, ...data } = input
      return ctx.db.announcement.create({
        data: {
          ...data,
          expiresAt: expiresAt ? new Date(expiresAt) : null,
          createdBy: (ctx.session.user as any).id,
        },
      })
    }),

  update: adminProcedure
    .input(AnnouncementCreateSchema.partial().extend({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      const { id, expiresAt, ...data } = input
      return ctx.db.announcement.update({
        where: { id },
        data: {
          ...data,
          ...(expiresAt !== undefined && { expiresAt: expiresAt ? new Date(expiresAt) : null }),
        },
      })
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.announcement.delete({
        where: { id: input.id },
      })
      return { success: true }
    }),
})
