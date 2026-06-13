import { z } from 'zod'
import { createTRPCRouter, publicProcedure, adminProcedure } from '../trpc'

export const curriculumRouter = createTRPCRouter({
  list: publicProcedure
    .input(z.object({
      branch: z.string().optional(),
      semester: z.number().int().min(1).max(8).optional(),
      isActiveOnly: z.boolean().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const where: any = {}
      if (input?.branch) where.branch = input.branch
      if (input?.semester) where.semester = input.semester
      if (input?.isActiveOnly) where.isActive = true

      return ctx.db.curriculum.findMany({
        where,
        orderBy: [{ branch: 'asc' }, { semester: 'asc' }, { version: 'desc' }],
      })
    }),

  create: adminProcedure
    .input(z.object({
      branch: z.string().min(1),
      academicYear: z.string().min(1),
      semester: z.number().int().min(1).max(8),
      version: z.string().min(1),
      fileUrl: z.string().url().optional(),
      fileKey: z.string().optional(),
      content: z.string().optional(),
      isActive: z.boolean().default(true),
    }))
    .mutation(async ({ ctx, input }) => {
      // Deactivate other versions for the same branch and semester if this is set active
      if (input.isActive) {
        await ctx.db.curriculum.updateMany({
          where: { branch: input.branch, semester: input.semester },
          data: { isActive: false },
        })
      }

      return ctx.db.curriculum.create({
        data: input,
      })
    }),

  update: adminProcedure
    .input(z.object({
      id: z.string().cuid(),
      branch: z.string().optional(),
      academicYear: z.string().optional(),
      semester: z.number().int().min(1).max(8).optional(),
      version: z.string().optional(),
      fileUrl: z.string().url().optional(),
      fileKey: z.string().optional(),
      content: z.string().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input

      if (data.isActive) {
        const curr = await ctx.db.curriculum.findUnique({
          where: { id },
          select: { branch: true, semester: true }
        })
        if (curr) {
          await ctx.db.curriculum.updateMany({
            where: { branch: curr.branch, semester: curr.semester },
            data: { isActive: false },
          })
        }
      }

      return ctx.db.curriculum.update({
        where: { id },
        data,
      })
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.curriculum.delete({
        where: { id: input.id },
      })
      return { success: true }
    }),
})
