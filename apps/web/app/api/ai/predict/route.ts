import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { streamText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { redis } from '@/lib/redis'
import { db } from '@/server/db'
import { z } from 'zod'

const RequestSchema = z.object({
  subject: z.string().min(1),
  examType: z.enum(['MIDTERM', 'FINAL', 'COMPETITIVE', 'MOCK', 'ASSIGNMENT']),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || !session.user || !session.user.id) return new Response('Unauthorized', { status: 401 })

  const userId = session.user.id

  // Rate limit: 10 AI requests per user per hour
  const { success } = await redis.ratelimit(`ai:predict:${session.user.id}`, 10, '1h')
  if (!success) return new Response('Rate limit exceeded', { status: 429 })

  const body = RequestSchema.parse(await req.json())

  const systemPrompt = `You are a world-class academic analyst specializing in exam pattern prediction.
Your task: generate a highly structured JSON array of predicted topics and question areas for the given Subject and Exam Type.

Return ONLY a valid JSON array — no markdown, no explanation, no preamble:
[{
  "topic": "String (e.g., 'Newton's Laws of Motion')",
  "probability": Number (1-100, representing likelihood of appearing),
  "reasoning": "String (A brief explanation of why this is highly probable)",
  "importance": "String (VERY_HIGH, HIGH, MEDIUM, LOW)"
}]`

  try {
    const result = await streamText({
      model: anthropic('claude-3-5-sonnet-20241022') as any,
      system: systemPrompt,
      prompt: `Subject: ${body.subject}\nExam Type: ${body.examType}`,
      maxTokens: 2500,
      headers: {
        "anthropic-beta": "prompt-caching-2024-07-31"
      },
      onFinish: async ({ text }) => {
        // Persist prediction to DB asynchronously
        try {
          const parsed = JSON.parse(text)
          await db.savedPrediction.create({
            data: {
              userId:    userId,
              subject:   body.subject,
              examType:  body.examType,
              content:   parsed,
            },
          })
          // Track analytics
          await db.platformStats.upsert({
            where: { date: new Date(new Date().setHours(0,0,0,0)) },
            update: { aiPredictions: { increment: 1 } },
            create: { date: new Date(new Date().setHours(0,0,0,0)), aiPredictions: 1 },
          })
        } catch {}
      },
    })

    return result.toDataStreamResponse()
  } catch (error: any) {
    console.error('AI Predict error:', error)
    return new Response(JSON.stringify({ error: 'AI Prediction engine unavailable. Please check your ANTHROPIC_API_KEY environment variable.' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}
