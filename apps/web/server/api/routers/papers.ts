import { z } from 'zod'
import { createTRPCRouter, publicProcedure, protectedProcedure, adminProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'
import { algolia } from '@/lib/algolia'
import { PaperCreateSchema } from '@examedge/validators'

export const papersRouter = createTRPCRouter({
  // PUBLIC: List papers with filters + pagination
  list: publicProcedure
    .input(z.object({
      subjectId:  z.string().cuid().optional(),
      year:       z.number().int().optional(),
      examType:   z.enum(['MIDTERM','FINAL','COMPETITIVE','MOCK','ASSIGNMENT']).optional(),
      university: z.string().optional(),
      difficulty: z.enum(['EASY','MEDIUM','HARD']).optional(),
      search:     z.string().optional(),
      page:       z.number().int().min(1).default(1),
      limit:      z.number().int().min(1).max(50).default(12),
      sortBy:     z.enum(['createdAt','year','downloadCount','viewCount']).default('createdAt'),
      sortOrder:  z.enum(['asc','desc']).default('desc'),
    }))
    .query(async ({ ctx, input }) => {
      const { page, limit, sortBy, sortOrder, search, ...filters } = input
      const skip = (page - 1) * limit

      // Use Algolia for text search, Prisma for filtered queries
      if (search) {
        const algoliaFilters = Object.entries(filters)
          .filter(([_, v]) => v !== undefined)
          .map(([k, v]) => `${k}:${v}`)
          .join(' AND ')

        const results = await algolia.papers.search(search, {
          filters: algoliaFilters,
          page: page - 1,
          hitsPerPage: limit,
        })
        return { papers: results.hits, total: results.nbHits, pages: results.nbPages }
      }

      const whereClause: any = { ...filters, isPublished: true }

      const [papers, total] = await Promise.all([
        ctx.db.paper.findMany({
          where: whereClause,
          include: { subject: { select: { name: true, code: true } }, tags: true },
          orderBy: { [sortBy]: sortOrder },
          skip,
          take: limit,
        }),
        ctx.db.paper.count({ where: whereClause }),
      ])

      return { papers, total, pages: Math.ceil(total / limit) }
    }),

  // PUBLIC: Get single paper
  byId: publicProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const paper = await ctx.db.paper.findUnique({
        where: { id: input.id },
        include: {
          subject: true,
          solution: { select: { content: true, videoUrl: true, isPublished: true } },
          tags: true,
        },
      })
      if (!paper) throw new TRPCError({ code: 'NOT_FOUND' })

      // Increment view count (fire and forget)
      ctx.db.paper.update({ where: { id: input.id }, data: { viewCount: { increment: 1 } } })
        .catch(console.error)

      return paper
    }),

  // PROTECTED: Track download
  trackDownload: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.paper.update({
        where: { id: input.id },
        data: { downloadCount: { increment: 1 } },
      })
    }),

  // ADMIN: Create paper
  create: adminProcedure
    .input(PaperCreateSchema)
    .mutation(async ({ ctx, input }) => {
      const { tags, ...data } = input
      const existingTags = await ctx.db.tag.findMany({ where: { name: { in: tags } } })
      const existingNames = new Set(existingTags.map(t => t.name))
      const newTags = tags.filter(name => !existingNames.has(name))

      const paper = await ctx.db.paper.create({
        data: {
          ...data,
          createdBy: (ctx.session.user as any).id,
          tags: {
            connect: existingTags.map(t => ({ id: t.id })),
            create: newTags.map(name => ({ name })),
          },
        },
        include: { subject: true, tags: true },
      })

      // Index in Algolia (background job via Inngest)
      await ctx.inngest.send({
        name: 'algolia/paper.index',
        data: { paperId: paper.id },
      }).catch(console.error) // Prevent Inngest missing triggers from failing mutations in local development

      return paper
    }),

  // ADMIN: Update paper
  update: adminProcedure
    .input(PaperCreateSchema.partial().extend({ id: z.string().cuid(), isPublished: z.boolean().optional() }))
    .mutation(async ({ ctx, input }) => {
      const { id, tags, ...data } = input
      let tagsUpdate = {}
      if (tags) {
        const existingTags = await ctx.db.tag.findMany({ where: { name: { in: tags } } })
        const existingNames = new Set(existingTags.map(t => t.name))
        const newTags = tags.filter(name => !existingNames.has(name))
        
        tagsUpdate = {
          tags: {
            set: [],
            connect: existingTags.map(t => ({ id: t.id })),
            create: newTags.map(name => ({ name })),
          }
        }
      }

      const paper = await ctx.db.paper.update({
        where: { id },
        data: {
          ...(data as any),
          ...tagsUpdate,
        },
      })

      // Re-index in Algolia
      await ctx.inngest.send({ name: 'algolia/paper.index', data: { paperId: id } }).catch(console.error)

      return paper
    }),

  // ADMIN: Delete paper
  delete: adminProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      const paper = await ctx.db.paper.findUnique({ where: { id: input.id } })
      if (!paper) throw new TRPCError({ code: 'NOT_FOUND' })

      // Delete from UploadThing if file exists
      if (paper.pdfKey) {
        await ctx.inngest.send({ name: 'uploadthing/file.delete', data: { key: paper.pdfKey } }).catch(console.error)
      }

      // Remove from Algolia
      await ctx.inngest.send({ name: 'algolia/paper.remove', data: { algoliaId: paper.algoliaId } }).catch(console.error)

      await ctx.db.paper.delete({ where: { id: input.id } })
      return { success: true }
    }),

  // ADMIN: Get stats
  stats: adminProcedure.query(async ({ ctx }) => {
    const [total, published, bySubject, topDownloaded] = await Promise.all([
      ctx.db.paper.count(),
      ctx.db.paper.count({ where: { isPublished: true } }),
      ctx.db.paper.groupBy({ by: ['subjectId'], _count: { id: true }, orderBy: { _count: { id: 'desc' } }, take: 5 }),
      ctx.db.paper.findMany({ orderBy: { downloadCount: 'desc' }, take: 5, select: { id: true, title: true, downloadCount: true } }),
    ])
    return { total, published, bySubject, topDownloaded }
  }),
})
