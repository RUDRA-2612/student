'use client'

import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-bg-base px-4 text-center">
      <h1 className="font-display font-bold text-4xl text-brand-coral mb-4">Something went wrong!</h1>
      <p className="text-white/60 text-sm max-w-md mb-8">
        An unexpected runtime exception has occurred. The incident has been logged for system diagnostics.
      </p>
      <div className="flex gap-4">
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-semibold transition"
        >
          Reload Page
        </button>
        <button
          onClick={() => reset()}
          className="px-6 py-2.5 rounded-lg bg-accent hover:bg-accent-hover text-white text-sm font-semibold transition"
        >
          Try Again
        </button>
      </div>
    </div>
  )
}
