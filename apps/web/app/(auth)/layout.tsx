'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { NoiseOverlay } from '@/components/ui/noise-overlay'

const words = ['Clarity', 'Precision', 'Mastery', 'Excellence', 'Focus']

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const [wordIndex, setWordIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex(i => (i + 1) % words.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative min-h-screen overflow-hidden flex bg-[#030303]">
      <NoiseOverlay />

      {/* Left: Giant Rotating Word */}
      <div className="hidden lg:flex flex-1 items-center justify-center relative overflow-hidden">
        {/* Subtle radial glow */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            width: 500, height: 500,
            background: 'radial-gradient(circle, rgba(255,255,255,0.02) 0%, transparent 70%)',
          }}
        />

        <AnimatePresence mode="wait">
          <motion.span
            key={words[wordIndex]}
            initial={{ opacity: 0, y: 60, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -60, filter: 'blur(10px)' }}
            transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
            className="text-7xl xl:text-8xl italic text-white/[0.06] tracking-tight select-none"
            style={{ fontFamily: 'var(--font-serif), Georgia, serif' }}
          >
            {words[wordIndex]}
          </motion.span>
        </AnimatePresence>

        {/* Corner details */}
        <div className="absolute top-8 left-8">
          <span className="text-[10px] tracking-[0.3em] uppercase text-white/20">ExamEdge</span>
        </div>
        <div className="absolute bottom-8 left-8">
          <span className="text-[9px] font-mono text-white/15">© {new Date().getFullYear()}</span>
        </div>
      </div>

      {/* Divider line */}
      <div className="hidden lg:block w-px bg-white/[0.04]" />

      {/* Right: Auth Card */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 lg:py-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
          className="w-full max-w-md"
        >
          {children}
        </motion.div>
      </div>
    </div>
  )
}
