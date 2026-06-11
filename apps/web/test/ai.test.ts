import { describe, it, expect } from 'vitest'
import { redis } from '../lib/redis'

describe('AI rate limiting handlers', () => {
  it('should allow queries within quota limits using mock rate-limit checks', async () => {
    // Under mock mode, the rate limiter resolves as successful
    const res = await redis.ratelimit('ai:usr-test', 10, '1h')
    expect(res.success).toBe(true)
    expect(res.remaining).toBe(9)
  })
})
