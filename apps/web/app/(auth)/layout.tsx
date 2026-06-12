'use client'

import React from 'react'
import { motion } from 'framer-motion'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden flex bg-[hsl(20,8%,5%)]">

      {/* Left: Typographic/editorial panel — NOT a generic aurora */}
      <div className="hidden lg:flex flex-1 items-center justify-center relative overflow-hidden">
        {/* Warm accent blob — just one, subtle */}
        <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] rounded-full opacity-[0.06] animate-drift"
          style={{ background: 'radial-gradient(circle, hsl(340 82% 62%) 0%, transparent 55%)' }} />

        {/* Big editorial type — feels human-crafted */}
        <div className="relative z-10 px-16 max-w-lg">
          <div className="mb-10">
            <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-[hsl(340,82%,62%)]/40 mb-6 block">ExamEdge</span>
            <h2 className="text-5xl xl:text-6xl font-bold tracking-[-0.03em] leading-[1.05] text-white/80 mb-4">
              Know what's<br />
              <span className="italic text-[hsl(340,82%,62%)]/50" style={{ fontFamily: 'var(--font-serif), Georgia, serif' }}>coming.</span>
            </h2>
            <p className="text-sm text-white/25 leading-relaxed max-w-xs">
              Access curated past papers, spot patterns, and prepare with confidence.
            </p>
          </div>

          {/* Small social proof */}
          <div className="flex items-center gap-3 text-white/20">
            <div className="flex -space-x-2">
              {[0,1,2].map(i => (
                <div key={i} className="w-7 h-7 rounded-full border-2 border-[hsl(20,8%,5%)] flex items-center justify-center text-[8px] font-bold"
                  style={{ background: `hsl(${340 + i * 30} 40% ${25 + i * 8}%)` }}>
                  {['A', 'S', 'R'][i]}
                </div>
              ))}
            </div>
            <span className="text-[10px]">10,000+ students trust ExamEdge</span>
          </div>
        </div>

        {/* Corner details */}
        <div className="absolute bottom-8 left-8">
          <span className="text-[9px] font-mono text-white/10">© {new Date().getFullYear()}</span>
        </div>
      </div>

      {/* Divider — warm tint */}
      <div className="hidden lg:block w-px bg-gradient-to-b from-transparent via-white/[0.04] to-transparent" />

      {/* Right: Auth Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 lg:py-0 relative">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
          className="w-full max-w-md relative z-10"
        >
          {children}
        </motion.div>
      </div>
    </div>
  )
}
