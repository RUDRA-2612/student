import { z } from 'zod'
import { createTRPCRouter, publicProcedure, adminProcedure } from '../trpc'

export const semestersRouter = createTRPCRouter({
  list: publicProcedure
    .input(z.object({
      isActiveOnly: z.boolean().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const where: any = {}
      if (input?.isActiveOnly) {
        where.isActive = true
      }
      return ctx.db.semester.findMany({
        where,
        include: {
          subjects: {
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' },
          },
        },
        orderBy: { sortOrder: 'asc' },
      })
    }),

  create: adminProcedure
    .input(z.object({
      name: z.string().min(1),
      academicYear: z.string().min(1),
      isActive: z.boolean().default(true),
      sortOrder: z.number().default(0),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.semester.create({
        data: input,
      })
    }),

  update: adminProcedure
    .input(z.object({
      id: z.string().cuid(),
      name: z.string().min(1).optional(),
      academicYear: z.string().min(1).optional(),
      isActive: z.boolean().optional(),
      sortOrder: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input
      return ctx.db.semester.update({
        where: { id },
        data,
      })
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.semester.delete({
        where: { id: input.id },
      })
      return { success: true }
    }),

  reorder: adminProcedure
    .input(z.object({
      orders: z.array(z.object({
        id: z.string().cuid(),
        sortOrder: z.number(),
      }))
    }))
    .mutation(async ({ ctx, input }) => {
      await Promise.all(
        input.orders.map(order => 
          ctx.db.semester.update({
            where: { id: order.id },
            data: { sortOrder: order.sortOrder }
          })
        )
      )
      return { success: true }
    }),
})
