'use client'

import { NoiseOverlay } from '@/components/ui/noise-overlay'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden flex items-center justify-center px-4 py-10 bg-black">
      <NoiseOverlay />

      {/* Subtle warm glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '-15%', left: '50%', transform: 'translateX(-50%)',
          width: 600, height: 600,
          background: 'radial-gradient(circle, rgba(255,160,60,0.06) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />

      {/* Card */}
      <div
        className="relative z-10 w-full max-w-md rounded-3xl p-8 shadow-2xl animate-fade-up"
        style={{
          background: 'hsl(0 0% 6%)',
          border: '1px solid rgba(255,255,255,0.06)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
        }}
      >
        {children}
      </div>
    </div>
  )
}
