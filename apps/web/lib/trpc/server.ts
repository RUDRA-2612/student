import { createCallerFactory } from '@/server/api/trpc'
import { appRouter } from '@/server/api/root'
import { createTRPCContext } from '@/server/api/trpc'
import { NextRequest } from 'next/server'

export const createServerCaller = async (req: NextRequest) => {
  const context = await createTRPCContext({ req })
  const createCaller = createCallerFactory(appRouter)
  return createCaller(context)
}
