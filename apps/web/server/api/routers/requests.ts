import { z } from 'zod'
import { createTRPCRouter, protectedProcedure, adminProcedure } from '../trpc'
import { RequestCreateSchema } from '@examedge/validators'
import { inngest } from '@/lib/inngest/client'
import { TRPCError } from '@trpc/server'

export const requestsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(RequestCreateSchema)
    .mutation(async ({ ctx, input }) => {
      const request = await ctx.db.studentRequest.create({
        data: {
          ...input,
          userId: (ctx.session.user as any).id,
        },
      })

      const ip = ctx.req.ip ?? ctx.req.headers.get('x-forwarded-for') ?? 'unknown'
      const userAgent = ctx.req.headers.get('user-agent') ?? 'unknown'

      // Log request creation to ActivityLog for silent tracking/auditing
      await ctx.db.activityLog.create({
        data: {
          userId: (ctx.session.user as any).id,
          action: 'CREATE_REQUEST',
          entity: 'StudentRequest',
          entityId: request.id,
          ip: ip === 'unknown' ? null : ip,
          userAgent: userAgent === 'unknown' ? null : userAgent,
        }
      }).catch(console.error)

      // Send background event for admin email alert
      await ctx.inngest.send({
        name: 'request/created',
        data: {
          requestId: request.id,
          ip,
          userAgent,
        },
      }).catch(console.error)

      return request
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

  delete: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      const role = (ctx.session.user as any).role
      const isStudent = role === 'STUDENT'

      const request = await ctx.db.studentRequest.findUnique({
        where: { id: input.id }
      })

      if (!request) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Request not found' })
      }

      if (isStudent && request.userId !== (ctx.session.user as any).id) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'You are not authorized to delete this request' })
      }

      await ctx.db.studentRequest.delete({
        where: { id: input.id }
      })

      return { success: true }
    }),
})
