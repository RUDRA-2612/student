import { z } from 'zod'
import { createTRPCRouter, protectedProcedure, adminProcedure } from '../trpc'

export const notificationsRouter = createTRPCRouter({
  list: protectedProcedure
    .query(async ({ ctx }) => {
      const userId = (ctx.session.user as any).id

      return ctx.db.notification.findMany({
        where: {
          OR: [
            { userId },
            { userId: null }
          ]
        },
        orderBy: { createdAt: 'desc' },
      })
    }),

  markAsRead: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.notification.update({
        where: { id: input.id },
        data: { isRead: true },
      })
    }),

  markAllAsRead: protectedProcedure
    .mutation(async ({ ctx }) => {
      const userId = (ctx.session.user as any).id
      await ctx.db.notification.updateMany({
        where: {
          OR: [
            { userId },
            { userId: null }
          ],
          isRead: false
        },
        data: { isRead: true },
      })
      return { success: true }
    }),

  create: adminProcedure
    .input(z.object({
      userId: z.string().cuid().optional().nullable(),
      title: z.string().min(1),
      message: z.string().min(1),
      type: z.string().default('INFO'),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.notification.create({
        data: input,
      })
    }),
})
