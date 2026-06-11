import { Resend } from 'resend'

const apiKey = process.env.RESEND_API_KEY || ''
const mockMode = !apiKey || apiKey === 'mock'

class MockResend {
  emails = {
    send: async (data: any) => {
      console.log('[MOCK RESEND] Sent email:', data)
      return { data: { id: 'mock-email-id' }, error: null }
    }
  }
}

export const resend = mockMode ? (new MockResend() as any) : new Resend(apiKey)
