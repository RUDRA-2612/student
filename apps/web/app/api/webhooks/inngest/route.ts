import { serve } from 'inngest/next'
import { inngest } from '@/lib/inngest/client'
import {
  indexPaperJob,
  deleteFileJob,
  requestResolvedJob,
  aggregateStatsJob,
} from '@/lib/inngest/functions'

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    indexPaperJob,
    deleteFileJob,
    requestResolvedJob,
    aggregateStatsJob,
  ],
})
