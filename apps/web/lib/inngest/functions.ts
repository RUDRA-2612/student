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

export const requestCreatedJob = inngest.createFunction(
  { id: 'email-request-created-admin', retries: 3 },
  { event: 'request/created' },
  async ({ event }) => {
    const request = await db.studentRequest.findUnique({
      where: { id: event.data.requestId },
      include: { user: true, subject: true },
    })
    if (!request) return

    const clientIp = event.data.ip
    const userAgent = event.data.userAgent

    await resend.emails.send({
      from:    'ExamEdge <noreply@examedge.com>',
      to:      'shubhdixit@jklu.edu.in',
      subject: `New Support Ticket Submitted — ${request.title}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; line-height: 1.6; color: #333; border: 1px solid #eee; border-radius: 12px; padding: 25px;">
          <div style="margin-bottom: 20px;">
            <h2 style="color: #c92c5c; margin: 0;">ExamEdge Support Ticket</h2>
          </div>
          <p style="font-size: 14px; color: #555;">A new support request has been submitted by a student. Below are the details:</p>
          
          <div style="background-color: #fcfcfc; border: 1px solid #f0f0f0; border-left: 4px solid #c92c5c; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Category/Type:</strong> <span style="background-color: #f0f0f0; padding: 2px 6px; border-radius: 4px; font-size: 12px; font-weight: bold; color: #555;">${request.type}</span></p>
            <p style="margin: 5px 0;"><strong>Subject:</strong> ${request.subject?.name ?? 'General / None'}</p>
            <p style="margin: 5px 0;"><strong>Summary:</strong> ${request.title}</p>
            <p style="margin: 10px 0 5px 0;"><strong>Description:</strong></p>
            <blockquote style="margin: 0; padding: 12px; background-color: #f5f5f5; border-radius: 6px; border-left: 3px solid #ccc; font-style: italic;">
              ${request.message.replace(/\n/g, '<br/>')}
            </blockquote>
          </div>

          <h3 style="border-bottom: 1px solid #eee; padding-bottom: 8px; margin-top: 30px; font-size: 15px; color: #444;">Auditing & Traceability Metadata</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <tr style="border-bottom: 1px solid #f9f9f9;">
              <td style="padding: 8px 0; font-weight: bold; width: 140px; color: #666;">Student Name:</td>
              <td style="padding: 8px 0; color: #111;">${request.user.name || 'Anonymous'}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f9f9f9;">
              <td style="padding: 8px 0; font-weight: bold; color: #666;">Student Email:</td>
              <td style="padding: 8px 0; color: #111;">${request.user.email}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f9f9f9;">
              <td style="padding: 8px 0; font-weight: bold; color: #666;">Student User ID:</td>
              <td style="padding: 8px 0; font-family: monospace; color: #444;">${request.user.id}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f9f9f9;">
              <td style="padding: 8px 0; font-weight: bold; color: #666;">Client IP Address:</td>
              <td style="padding: 8px 0; font-family: monospace; color: #c92c5c; font-weight: bold;">${clientIp}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #666;">Browser/User Agent:</td>
              <td style="padding: 8px 0; color: #555; font-size: 12px; line-height: 1.4;">${userAgent}</td>
            </tr>
          </table>
          
          <div style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 15px; font-size: 11px; color: #999; text-align: center;">
            This security tracing audit was logged silently and is visible only to platform administrators.
          </div>
        </div>
      `
    })
  }
)
