'use client'

import { SessionProvider } from 'next-auth/react'
import { TRPCReactProvider } from '@/lib/trpc/react'
import { ThemeProvider } from './theme-provider'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <SessionProvider>
        <TRPCReactProvider>
          {children}
        </TRPCReactProvider>
      </SessionProvider>
    </ThemeProvider>
  )
}
