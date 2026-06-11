import { z } from 'zod'
import { createTRPCRouter, protectedProcedure, adminProcedure } from '../trpc'
import { RequestCreateSchema } from '@examedge/validators'
import { inngest } from '@/lib/inngest/client'

export const requestsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(RequestCreateSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.studentRequest.create({
        data: {
          ...input,
          userId: (ctx.session.user as any).id,
        },
      })
    }),

  list: protectedProcedure
    .input(z.object({
      status: z.enum(['PENDING', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']).optional(),
      page:   z.number().int().min(1).default(1),
      limit:  z.number().int().min(1).max(50).default(20),
    }).optional())
    .query(async ({ ctx, input }) => {
      const page = input?.page ?? 1
      const limit = input?.limit ?? 20
      const skip = (page - 1) * limit
      const status = input?.status

      const role = (ctx.session.user as any).role
      const isStudent = role === 'STUDENT'

      const whereClause: any = {}
      if (status) whereClause.status = status
      if (isStudent) whereClause.userId = (ctx.session.user as any).id

      const [requests, total] = await Promise.all([
        ctx.db.studentRequest.findMany({
          where: whereClause,
          include: { user: { select: { name: true, email: true } }, subject: true },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        ctx.db.studentRequest.count({ where: whereClause }),
      ])

      return { requests, total, pages: Math.ceil(total / limit) }
    }),

  pendingCount: protectedProcedure
    .query(async ({ ctx }) => {
      return ctx.db.studentRequest.count({
        where: { status: 'PENDING' },
      })
    }),

  resolve: adminProcedure
    .input(z.object({
      id:         z.string().cuid(),
      adminReply: z.string().min(5),
    }))
    .mutation(async ({ ctx, input }) => {
      const request = await ctx.db.studentRequest.update({
        where: { id: input.id },
        data: {
          adminReply: input.adminReply,
          status:     'RESOLVED',
          repliedAt:  new Date(),
          repliedBy:  (ctx.session.user as any).id,
        },
      })

      // Send background job email
      await inngest.send({
        name: 'request/resolved',
        data: { requestId: request.id },
      }).catch(console.error)

      return request
    }),
})
