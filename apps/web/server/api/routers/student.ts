import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'

export const studentRouter = createTRPCRouter({
  // Get student's bookmarks
  myBookmarks: protectedProcedure.query(async ({ ctx }) => {
    const userId = (ctx.session?.user as any)?.id as string
    return ctx.db.bookmark.findMany({
      where: { userId },
      include: {
        paper: {
          include: {
            subject: { select: { name: true, code: true } },
            tags: true,
          },
        },
        question: {
          include: {
            subject: { select: { name: true, code: true } },
            tags: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  }),

  // Toggle bookmark for a paper or question
  toggleBookmark: protectedProcedure
    .input(z.object({
      paperId: z.string().cuid().optional(),
      questionId: z.string().cuid().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = (ctx.session?.user as any)?.id as string
      const { paperId, questionId } = input

      if (!paperId && !questionId) {
        throw new Error('Either paperId or questionId must be provided')
      }

      if (paperId) {
        const existing = await ctx.db.bookmark.findUnique({
          where: {
            userId_paperId: { userId, paperId }
          }
        })

        if (existing) {
          await ctx.db.bookmark.delete({
            where: { id: existing.id }
          })
          return { bookmarked: false }
        } else {
          await ctx.db.bookmark.create({
            data: { userId, paperId }
          })
          return { bookmarked: true }
        }
      }

      if (questionId) {
        const existing = await ctx.db.bookmark.findUnique({
          where: {
            userId_questionId: { userId, questionId }
          }
        })

        if (existing) {
          await ctx.db.bookmark.delete({
            where: { id: existing.id }
          })
          return { bookmarked: false }
        } else {
          await ctx.db.bookmark.create({
            data: { userId, questionId }
          })
          return { bookmarked: true }
        }
      }

      return { bookmarked: false }
    }),

  // Get student's generated roadmaps
  myRoadmaps: protectedProcedure.query(async ({ ctx }) => {
    const userId = (ctx.session?.user as any)?.id as string
    return ctx.db.generatedRoadmap.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })
  }),

  // Get student's saved predictions
  myPredictions: protectedProcedure.query(async ({ ctx }) => {
    const userId = (ctx.session?.user as any)?.id as string
    return ctx.db.savedPrediction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })
  }),

  // Get student dashboard stats overview
  dashboardStats: protectedProcedure.query(async ({ ctx }) => {
    const userId = (ctx.session?.user as any)?.id as string
    const [bookmarksCount, roadmapsCount, predictionsCount, requestsCount] = await Promise.all([
      ctx.db.bookmark.count({ where: { userId } }),
      ctx.db.generatedRoadmap.count({ where: { userId } }),
      ctx.db.savedPrediction.count({ where: { userId } }),
      ctx.db.studentRequest.count({ where: { userId } }),
    ])

    return {
      bookmarksCount,
      roadmapsCount,
      predictionsCount,
      requestsCount,
    }
  }),
})
