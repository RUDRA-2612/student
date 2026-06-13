import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import { generateText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'

export const aiRouter = createTRPCRouter({
  explainTopic: protectedProcedure
    .input(z.object({
      topic: z.string().min(1),
      subjectName: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      try {
        const { text } = await generateText({
          model: anthropic('claude-3-5-sonnet-20241022') as any,
          system: 'You are an elite university professor explaining academic subjects in simple, intuitive terms. Use examples where possible and explain step-by-step.',
          prompt: `Please explain the following topic: "${input.topic}"${input.subjectName ? ` in the context of the subject "${input.subjectName}"` : ''}.`,
          headers: {
            "anthropic-beta": "prompt-caching-2024-07-31"
          }
        })
        return { answer: text }
      } catch (error: any) {
        console.error('AI Explain error:', error)
        throw new Error(`AI assistant unavailable: ${error.message}`)
      }
    }),

  summarizeNotes: protectedProcedure
    .input(z.object({
      content: z.string().min(10),
    }))
    .mutation(async ({ input }) => {
      try {
        const { text } = await generateText({
          model: anthropic('claude-3-5-sonnet-20241022') as any,
          system: 'You are an academic summarization engine. Create a concise, structured bulleted summary of the provided text/notes. Use bold headers for key terms.',
          prompt: `Summarize the following notes/content:\n\n${input.content}`,
          headers: {
            "anthropic-beta": "prompt-caching-2024-07-31"
          }
        })
        return { summary: text }
      } catch (error: any) {
        console.error('AI Summarization error:', error)
        throw new Error(`AI assistant unavailable: ${error.message}`)
      }
    }),

  generateQuiz: protectedProcedure
    .input(z.object({
      topic: z.string().min(1),
      numQuestions: z.number().int().min(1).max(10).default(5),
    }))
    .mutation(async ({ input }) => {
      try {
        const systemPrompt = `You are a question designer. Generate a multiple-choice quiz about the given topic. 
Return ONLY a valid JSON array matching the structure:
[
  {
    "question": "What is the capital of France?",
    "options": ["Paris", "London", "Rome", "Berlin"],
    "correctOptionIndex": 0,
    "explanation": "Paris is the capital of France and its largest city."
  }
]
Do not return any other text, markdown, or codeblock wrapper.`

        const { text } = await generateText({
          model: anthropic('claude-3-5-sonnet-20241022') as any,
          system: systemPrompt,
          prompt: `Topic: "${input.topic}"\nNumber of Questions: ${input.numQuestions}`,
          headers: {
            "anthropic-beta": "prompt-caching-2024-07-31"
          }
        })

        const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim()
        const quiz = JSON.parse(cleanedText)
        return { quiz }
      } catch (error: any) {
        console.error('AI Quiz generation error:', error)
        throw new Error(`AI assistant failed to generate quiz: ${error.message}`)
      }
    }),

  askQuery: protectedProcedure
    .input(z.object({
      query: z.string().min(1),
      subjectName: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      try {
        const { text } = await generateText({
          model: anthropic('claude-3-5-sonnet-20241022') as any,
          system: 'You are a helpful university tutor available to answer student questions about their courses. Be precise and correct.',
          prompt: `${input.subjectName ? `Course: ${input.subjectName}\n` : ''}Question: ${input.query}`,
          headers: {
            "anthropic-beta": "prompt-caching-2024-07-31"
          }
        })
        return { response: text }
      } catch (error: any) {
        console.error('AI Query error:', error)
        throw new Error(`AI assistant unavailable: ${error.message}`)
      }
    }),
})
