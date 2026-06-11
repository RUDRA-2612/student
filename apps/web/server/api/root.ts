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
})

export type AppRouter = typeof appRouter
