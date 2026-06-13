import { z } from 'zod'
import { createTRPCRouter, publicProcedure, adminProcedure } from '../trpc'

export const syllabusRouter = createTRPCRouter({
  history: publicProcedure
    .input(z.object({ subjectId: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.syllabusVersion.findMany({
        where: { subjectId: input.subjectId },
        orderBy: { version: 'desc' },
      })
    }),

  create: adminProcedure
    .input(z.object({
      subjectId: z.string().cuid(),
      fileUrl: z.string().url().optional(),
      fileKey: z.string().optional(),
      manualContent: z.any().optional(), // JSON content for syllabus units
      changesSummary: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const subject = await ctx.db.subject.findUnique({
        where: { id: input.subjectId },
        select: { syllabusVersion: true }
      })
      if (!subject) throw new Error('Subject not found')

      const newVersion = subject.syllabusVersion + 1

      // 1. Create version record
      const versionRecord = await ctx.db.syllabusVersion.create({
        data: {
          subjectId: input.subjectId,
          version: newVersion,
          fileUrl: input.fileUrl,
          fileKey: input.fileKey,
          manualContent: input.manualContent,
          changesSummary: input.changesSummary || `Updated to version ${newVersion}`,
          createdBy: (ctx.session.user as any).id,
        }
      })

      // 2. Update Subject
      await ctx.db.subject.update({
        where: { id: input.subjectId },
        data: {
          syllabusVersion: newVersion,
          syllabusUrl: input.fileUrl || null,
          syllabusKey: input.fileKey || null,
          syllabusContent: input.manualContent || null,
        }
      })

      return versionRecord
    }),

  restore: adminProcedure
    .input(z.object({
      id: z.string().cuid(), // SyllabusVersion id
    }))
    .mutation(async ({ ctx, input }) => {
      const version = await ctx.db.syllabusVersion.findUnique({
        where: { id: input.id },
      })
      if (!version) throw new Error('Syllabus version record not found')

      const subject = await ctx.db.subject.findUnique({
        where: { id: version.subjectId },
        select: { syllabusVersion: true }
      })
      if (!subject) throw new Error('Subject not found')

      const nextVersionNum = subject.syllabusVersion + 1

      // 1. Create a new version indicating a restore
      const restoreRecord = await ctx.db.syllabusVersion.create({
        data: {
          subjectId: version.subjectId,
          version: nextVersionNum,
          fileUrl: version.fileUrl,
          fileKey: version.fileKey,
          manualContent: version.manualContent || undefined,
          changesSummary: `Restored back to version ${version.version}`,
          createdBy: (ctx.session.user as any).id,
        }
      })

      // 2. Update the main subject details
      await ctx.db.subject.update({
        where: { id: version.subjectId },
        data: {
          syllabusVersion: nextVersionNum,
          syllabusUrl: version.fileUrl,
          syllabusKey: version.fileKey,
          syllabusContent: version.manualContent || undefined,
        }
      })

      return restoreRecord
    }),
})
