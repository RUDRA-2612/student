import { z } from 'zod'
import { createTRPCRouter, adminProcedure } from '../trpc'

export const analyticsRouter = createTRPCRouter({
  overview: adminProcedure.query(async ({ ctx }) => {
    const [
      studentCount,
      paperCount,
      questionCount,
      pendingRequests,
      topPapers,
      recentLogs,
      semesterCount,
      subjectCount,
      resourceCount,
      announcementCount,
      roadmapCount,
    ] = await Promise.all([
      ctx.db.user.count({ where: { role: 'STUDENT' } }),
      ctx.db.paper.count(),
      ctx.db.question.count(),
      ctx.db.studentRequest.count({ where: { status: 'PENDING' } }),
      ctx.db.paper.findMany({
        orderBy: { downloadCount: 'desc' },
        take: 5,
        select: {
          id: true,
          title: true,
          downloadCount: true,
          viewCount: true,
          subject: { select: { name: true, code: true } },
        },
      }),
      ctx.db.activityLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { user: { select: { name: true, email: true } } },
      }),
      ctx.db.semester.count(),
      ctx.db.subject.count(),
      ctx.db.studyResource.count(),
      ctx.db.announcement.count(),
      ctx.db.roadmap.count(),
    ])

    return {
      studentCount,
      paperCount,
      questionCount,
      pendingRequests,
      topPapers,
      recentLogs,
      semesterCount,
      subjectCount,
      resourceCount,
      announcementCount,
      roadmapCount,
    }
  }),

  statsHistory: adminProcedure
    .input(z.object({
      days: z.number().int().min(7).max(90).default(30),
    }))
    .query(async ({ ctx, input }) => {
      const cutoff = new Date()
      cutoff.setDate(cutoff.getDate() - input.days)

      return ctx.db.platformStats.findMany({
        where: {
          date: { gte: cutoff },
        },
        orderBy: { date: 'asc' },
      })
    }),
})
