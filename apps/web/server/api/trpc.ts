import { initTRPC, TRPCError } from '@trpc/server'
import { type NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { ZodError } from 'zod'
import { db } from '@/server/db'
import { redis } from '@/lib/redis'
import { inngest } from '@/lib/inngest/client'
import { defineAbilityFor } from '@/lib/casl'
import superjson from 'superjson'

export const createTRPCContext = async (opts: { req: NextRequest }) => {
  const session = await auth()
  const ability = defineAbilityFor(session?.user as any)
  return { db, redis, inngest, session, ability, req: opts.req }
}

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    }
  },
})

// Rate limiting middleware
const rateLimitMiddleware = t.middleware(async ({ ctx, next }) => {
  const identifier = (ctx.session?.user as any)?.id ?? ctx.req.ip ?? 'anonymous'
  const { success } = await ctx.redis.ratelimit(identifier)
  if (!success) throw new TRPCError({ code: 'TOO_MANY_REQUESTS' })
  return next()
})

// Auth middlewares
export const publicProcedure    = t.procedure.use(rateLimitMiddleware)
export const protectedProcedure = t.procedure.use(rateLimitMiddleware).use(({ ctx, next }) => {
  if (!ctx.session?.user) throw new TRPCError({ code: 'UNAUTHORIZED' })
  return next({ ctx: { ...ctx, session: ctx.session } })
})
export const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (!['ADMIN', 'SUPERADMIN'].includes((ctx.session.user as any).role)) {
    throw new TRPCError({ code: 'FORBIDDEN' })
  }
  return next()
})

export const createTRPCRouter = t.router
export const createCallerFactory = t.createCallerFactory
