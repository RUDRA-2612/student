import { inngest } from './client'
import { db } from '@/server/db'
import { indexPaper } from '@/lib/algolia'
import { resend } from '@/lib/resend'

class MockUTApi {
  async deleteFiles(key: string | string[]) {
    console.log(`[MOCK UPLOADTHING] Deleted files with key(s):`, key)
    return { success: true }
  }
}

let UTApiClass = MockUTApi
try {
  if (process.env.UPLOADTHING_SECRET) {
    UTApiClass = require('uploadthing/server').UTApi
  }
} catch {
  // package require failure fallback
}
const utapi = new UTApiClass()

export const indexPaperJob = inngest.createFunction(
  { id: 'algolia-paper-index', retries: 3 },
  { event: 'algolia/paper.index' },
  async ({ event }) => {
    const paper = await db.paper.findUnique({
      where: { id: event.data.paperId },
      include: { subject: true, tags: true },
    })
    if (paper?.isPublished) {
      await indexPaper(paper)
    }
  }
)

export const deleteFileJob = inngest.createFunction(
  { id: 'uploadthing-delete', retries: 3 },
  { event: 'uploadthing/file.delete' },
  async ({ event }) => {
    await utapi.deleteFiles(event.data.key)
  }
)

export const requestResolvedJob = inngest.createFunction(
  { id: 'email-request-resolved', retries: 3 },
  { event: 'request/resolved' },
  async ({ event }) => {
    const request = await db.studentRequest.findUnique({
      where: { id: event.data.requestId },
      include: { user: true },
    })
    if (!request?.user?.email) return

    await resend.emails.send({
      from:    'ExamEdge <noreply@examedge.com>',
      to:      request.user.email,
      subject: 'Your request has been resolved — ExamEdge',
      html: `<p>Hi ${request.user.name || 'Student'},</p>
             <p>Your request: "<strong>${request.title}</strong>" has been resolved by our admin team.</p>
             <p><strong>Reply:</strong> ${request.adminReply}</p>
             <p>Best regards,<br/>ExamEdge Team</p>`
    })
  }
)

export const aggregateStatsJob = inngest.createFunction(
  { id: 'stats-aggregate', retries: 2 },
  { cron: '0 0 * * *' },
  async () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    yesterday.setHours(0, 0, 0, 0)

    const [newUsers, paperViews, downloads] = await Promise.all([
      db.user.count({ where: { createdAt: { gte: yesterday } } }),
      db.activityLog.count({ where: { action: 'VIEW_PAPER', createdAt: { gte: yesterday } } }),
      db.activityLog.count({ where: { action: 'DOWNLOAD_PAPER', createdAt: { gte: yesterday } } }),
    ])

    await db.platformStats.create({
      data: { date: yesterday, newUsers, paperViews, paperDownloads: downloads },
    })
  }
)
