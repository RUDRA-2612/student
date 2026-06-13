import { z } from 'zod'
import { createTRPCRouter, adminProcedure } from '../trpc'
import { exec } from 'child_process'
import { promisify } from 'util'
import * as fs from 'fs'
import * as path from 'path'

const execPromise = promisify(exec)

export const githubRouter = createTRPCRouter({
  status: adminProcedure.query(async () => {
    try {
      // Get branch name
      const { stdout: branch } = await execPromise('git rev-parse --abbrev-ref HEAD')
      // Get last 5 commits
      const { stdout: log } = await execPromise('git log -n 5 --oneline')
      // Get dirty status
      const { stdout: status } = await execPromise('git status --porcelain')

      // Get last backup stats
      const backupDir = path.join(process.cwd(), '../../packages/db/backups')
      const backupPath = path.join(backupDir, 'backup.json')
      let backupTime = 'No backups yet'
      let backupSize = 0

      if (fs.existsSync(backupPath)) {
        const stats = fs.statSync(backupPath)
        backupTime = stats.mtime.toLocaleString()
        backupSize = stats.size
      }

      return {
        branch: branch.trim(),
        recentCommits: log.split('\n').filter(Boolean),
        hasUncommittedChanges: status.trim().length > 0,
        lastBackupTime: backupTime,
        lastBackupSize: `${(backupSize / 1024).toFixed(2)} KB`,
        rawStatus: status,
      }
    } catch (error: any) {
      console.error('Git status error:', error)
      return {
        branch: 'error',
        recentCommits: [],
        hasUncommittedChanges: false,
        lastBackupTime: 'Git not available',
        lastBackupSize: '0 KB',
        rawStatus: error.message,
      }
    }
  }),

  backup: adminProcedure.mutation(async ({ ctx }) => {
    // 1. Query all tables
    const [subjects, semesters, curricula, studyResources, faqs, announcements, calendarEvents, placementResources] = await Promise.all([
      ctx.db.subject.findMany(),
      ctx.db.semester.findMany(),
      ctx.db.curriculum.findMany(),
      ctx.db.studyResource.findMany(),
      ctx.db.fAQ.findMany(),
      ctx.db.announcement.findMany(),
      ctx.db.calendarEvent.findMany(),
      ctx.db.placementResource.findMany(),
    ])

    const backupData = {
      timestamp: new Date().toISOString(),
      subjects,
      semesters,
      curricula,
      studyResources,
      faqs,
      announcements,
      calendarEvents,
      placementResources,
    }

    // 2. Write to backup file
    const backupDir = path.join(process.cwd(), '../../packages/db/backups')
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true })
    }
    const backupPath = path.join(backupDir, 'backup.json')
    fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2))

    // 3. Commit and push
    try {
      await execPromise('git add ../../packages/db/backups/backup.json')
      const commitMsg = `"chore(backup): database backup ${new Date().toLocaleDateString()}"`
      await execPromise(`git commit -m ${commitMsg}`)
      await execPromise('git push origin main')
      return { success: true, message: 'Backup created, committed, and pushed successfully!' }
    } catch (error: any) {
      console.error('Git commit/push error:', error)
      return { success: true, message: `Backup saved locally, but git commit failed: ${error.message}` }
    }
  }),

  pushCodeUpdates: adminProcedure
    .input(z.object({
      commitMessage: z.string().min(1),
    }))
    .mutation(async ({ input }) => {
      try {
        await execPromise('git add .')
        const commitMsg = JSON.stringify(input.commitMessage)
        await execPromise(`git commit -m ${commitMsg}`)
        await execPromise('git push origin main')
        return { success: true, message: 'Platform updates pushed to GitHub successfully!' }
      } catch (error: any) {
        console.error('Git push error:', error)
        throw new Error(`Git update failed: ${error.message}`)
      }
    }),
})
