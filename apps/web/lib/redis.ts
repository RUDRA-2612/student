import { Redis } from '@upstash/redis'

const url = process.env.UPSTASH_REDIS_REST_URL || ''
const token = process.env.UPSTASH_REDIS_REST_TOKEN || ''

const mockMode = !url || !token || url.includes('your-redis-instance');

class MockRedis {
  async get(_key: string) {
    return null
  }
  async set(_key: string, _value: any) {
    return 'OK'
  }
  async ratelimit(_identifier: string, limit: number = 10, _window: string = '1h') {
    return { success: true, limit, remaining: limit - 1, reset: Date.now() + 3600000 }
  }
}

export const redis = mockMode
  ? (new MockRedis() as any)
  : Object.assign(new Redis({ url, token }), {
      ratelimit: async (identifier: string, limit: number = 20, _window: string = '60s') => {
        try {
          const key = `ratelimit:${identifier}`
          const count = await (redis as any).incr(key)
          if (count === 1) {
            await (redis as any).expire(key, 60)
          }
          return { success: count <= limit }
        } catch {
          return { success: true }
        }
      }
    })
