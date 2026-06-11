import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { streamText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { redis } from '@/lib/redis'
import { db } from '@/server/db'
import { z } from 'zod'

const RequestSchema = z.object({
  subject: z.string().min(1),
  days:    z.number().int().min(1).max(90),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || !session.user || !session.user.id) return new Response('Unauthorized', { status: 401 })

  const userId = session.user.id

  // Rate limit: 10 AI requests per user per hour
  const { success } = await redis.ratelimit(`ai:${session.user.id}`, 10, '1h')
  if (!success) return new Response('Rate limit exceeded', { status: 429 })

  const body = RequestSchema.parse(await req.json())

  const systemPrompt = `You are a world-class academic advisor.
Your task: generate a day-by-day structured study roadmap to prepare a student for an exam in the given number of days.

Return ONLY a valid JSON array — no markdown, no explanation, no preamble:
[{
  "day": 1,
  "topic": "Introduction to topics",
  "objectives": ["Understand core definitions", "Solve first 5 practice questions"],
  "resources": ["Chapter 1 in notes", "FAQ Section"],
  "hoursRequired": 2
}]`

  try {
    const result = await streamText({
      model: anthropic('claude-3-5-sonnet-20241022') as any,
      system: systemPrompt,
      prompt: `Subject: ${body.subject}\nPreparation Duration: ${body.days} days`,
      maxTokens: 2500,
      headers: {
        "anthropic-beta": "prompt-caching-2024-07-31"
      },
      onFinish: async ({ text }) => {
        // Persist roadmap to DB asynchronously
        try {
          const parsed = JSON.parse(text)
          await db.generatedRoadmap.create({
            data: {
              userId:    userId,
              subject:   body.subject,
              days:      body.days,
              content:   parsed,
            },
          })
          // Track analytics
          await db.platformStats.upsert({
            where: { date: new Date(new Date().setHours(0,0,0,0)) },
            update: { aiRoadmaps: { increment: 1 } },
            create: { date: new Date(new Date().setHours(0,0,0,0)), aiRoadmaps: 1 },
          })
        } catch {}
      },
    })

    return result.toDataStreamResponse()
  } catch (error: any) {
    console.error('AI Roadmap error:', error)
    return new Response(JSON.stringify({ error: 'AI Roadmap engine unavailable. Please check your ANTHROPIC_API_KEY environment variable.' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}
