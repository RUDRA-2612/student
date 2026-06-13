import { z } from 'zod'
import { createTRPCRouter, publicProcedure, adminProcedure } from '../trpc'

export const roadmapsRouter = createTRPCRouter({
  list: publicProcedure
    .input(z.object({
      isPublishedOnly: z.boolean().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const where: any = {}
      if (input?.isPublishedOnly) where.isPublished = true

      return ctx.db.roadmap.findMany({
        where,
        include: {
          milestones: {
            orderBy: { order: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
      })
    }),

  byId: publicProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.roadmap.findUnique({
        where: { id: input.id },
        include: {
          milestones: {
            orderBy: { order: 'asc' },
          },
        },
      })
    }),

  create: adminProcedure
    .input(z.object({
      title: z.string().min(1),
      description: z.string().min(1),
      category: z.string().min(1),
      isPublished: z.boolean().default(false),
      milestones: z.array(z.object({
        title: z.string().min(1),
        description: z.string().min(1),
        order: z.number().int().default(0),
        resources: z.array(z.string()).optional(),
        checkpoints: z.array(z.string()).optional(),
      })),
    }))
    .mutation(async ({ ctx, input }) => {
      const { milestones, ...roadmapData } = input

      return ctx.db.roadmap.create({
        data: {
          ...roadmapData,
          milestones: {
            create: milestones.map(m => ({
              title: m.title,
              description: m.description,
              order: m.order,
              resources: m.resources || [],
              checkpoints: m.checkpoints || [],
            }))
          }
        },
        include: { milestones: true }
      })
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.roadmap.delete({
        where: { id: input.id },
      })
      return { success: true }
    }),
})
