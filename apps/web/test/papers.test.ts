import { describe, it, expect } from 'vitest'
import { PaperCreateSchema } from '@examedge/validators'

describe('Papers validation validation', () => {
  it('should pass validation for a valid paper layout payload', () => {
    const validPayload = {
      title: 'REET Level 1 Environmental Science 2021',
      subjectId: 'cld123456789012345678901',
      year: 2021,
      examType: 'COMPETITIVE',
      university: 'BSER',
      difficulty: 'MEDIUM',
      pdfUrl: 'https://example.com/paper.pdf',
      pdfKey: 'key123',
      videoUrl: 'https://youtube.com/watch?v=123',
      tags: ['REET', 'EVS']
    }

    const parsed = PaperCreateSchema.safeParse(validPayload)
    expect(parsed.success).toBe(true)
  })

  it('should reject validation for short title or invalid URL schema format', () => {
    const invalidPayload = {
      title: 'RE', // too short
      subjectId: 'cld123456789012345678901',
      year: 1800, // invalid year boundary
      examType: 'MOCK',
      university: 'BSER',
      pdfUrl: 'not-a-valid-url'
    }

    const parsed = PaperCreateSchema.safeParse(invalidPayload)
    expect(parsed.success).toBe(false)
  })
})
