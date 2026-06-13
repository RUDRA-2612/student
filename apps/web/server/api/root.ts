import { createTRPCRouter } from './trpc'
import { papersRouter } from './routers/papers'
import { subjectsRouter } from './routers/subjects'
import { questionsRouter } from './routers/questions'
import { solutionsRouter } from './routers/solutions'
import { requestsRouter } from './routers/requests'
import { faqsRouter } from './routers/faqs'
import { announcementsRouter } from './routers/announcements'
import { analyticsRouter } from './routers/analytics'
import { studentRouter } from './routers/student'
import { semestersRouter } from './routers/semesters'
import { syllabusRouter } from './routers/syllabus'
import { curriculumRouter } from './routers/curriculum'
import { resourcesRouter } from './routers/resources'
import { calendarRouter } from './routers/calendar'
import { placementRouter } from './routers/placement'
import { aiRouter } from './routers/ai'
import { githubRouter } from './routers/github'
import { notificationsRouter } from './routers/notifications'
import { roadmapsRouter } from './routers/roadmaps'

export const appRouter = createTRPCRouter({
  papers: papersRouter,
  subjects: subjectsRouter,
  questions: questionsRouter,
  solutions: solutionsRouter,
  requests: requestsRouter,
  faqs: faqsRouter,
  announcements: announcementsRouter,
  analytics: analyticsRouter,
  student: studentRouter,
  semesters: semestersRouter,
  syllabus: syllabusRouter,
  curriculum: curriculumRouter,
  resources: resourcesRouter,
  calendar: calendarRouter,
  placement: placementRouter,
  ai: aiRouter,
  github: githubRouter,
  notifications: notificationsRouter,
  roadmaps: roadmapsRouter,
})

export type AppRouter = typeof appRouter
