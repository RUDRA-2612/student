'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, ChevronRight, Award } from 'lucide-react'
import { NoiseOverlay } from '@/components/ui/noise-overlay'
import { SpotlightCard } from '@/components/ui/spotlight-card'

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 30, filter: 'blur(5px)' },
  show: { 
    opacity: 1, 
    y: 0, 
    filter: 'blur(0px)',
    transition: { type: 'tween', ease: [0.25, 1, 0.5, 1], duration: 1.2 }
  }
}

const stats = [
  { value: '10K+', label: 'Scholars' },
  { value: '500+', label: 'Curated Papers' },
  { value: '99.9%', label: 'Reliability' },
  { value: '4.9★', label: 'Satisfaction' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen text-white overflow-hidden font-sans selection:bg-white/20 bg-black">
      <NoiseOverlay />

      {/* Ultra Minimalist Header */}
      <header className="fixed top-0 w-full z-40 border-b border-white/[0.02] bg-black/50 backdrop-blur-2xl">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-full flex items-center justify-center font-serif text-sm font-bold text-black bg-white transition-transform duration-500 group-hover:scale-110">
              EE
            </div>
            <span className="font-display font-medium text-lg tracking-wide text-white/90 group-hover:text-white transition-colors">ExamEdge</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/login" className="text-sm font-medium text-white/50 hover:text-white transition-colors">
              Sign In
            </Link>
            <Link
              href="/signup"
              className="text-sm font-medium text-black px-5 py-2 rounded-full bg-white hover:bg-white/90 transition-colors"
            >
              Begin Journey
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 pt-40 pb-20 px-6">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="max-w-4xl mx-auto text-center"
        >
          <motion.div variants={itemVariants} className="mb-8 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md">
            <Award size={12} className="text-white/70" />
            <span className="text-[10px] font-medium tracking-[0.2em] uppercase text-white/70">A New Standard</span>
          </motion.div>

          <motion.h1 variants={itemVariants} className="font-display font-light tracking-tight leading-[1.1] mb-8 text-5xl md:text-7xl lg:text-8xl">
            Master your <span className="font-serif italic text-white/60">college exams</span><br className="hidden md:block" />
            with absolute clarity.
          </motion.h1>

          <motion.p variants={itemVariants} className="text-lg md:text-xl text-white/40 max-w-2xl mx-auto font-light leading-relaxed mb-16">
            A curated academic sanctuary designed to demystify vast university syllabi. 
            We extract high-signal patterns from decades of past examinations.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/login"
              className="px-8 py-4 rounded-full font-medium text-black bg-white hover:bg-white/90 transition-colors flex items-center gap-2 text-base"
            >
              Access Platform <ArrowRight size={16} />
            </Link>
            <Link
              href="/dashboard"
              className="px-8 py-4 rounded-full font-medium text-white/60 hover:text-white border border-white/10 hover:bg-white/5 transition-all flex items-center gap-2 text-base"
            >
              Preview Dashboard <ChevronRight size={16} />
            </Link>
          </motion.div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="max-w-6xl mx-auto mt-32 grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {stats.map((s) => (
            <motion.div variants={itemVariants} key={s.label}>
              <SpotlightCard className="p-8 text-center bg-white/[0.01]">
                <div className="font-serif italic text-4xl text-white/90 mb-2">{s.value}</div>
                <div className="text-[10px] font-medium text-white/40 uppercase tracking-[0.2em]">{s.label}</div>
              </SpotlightCard>
            </motion.div>
          ))}
        </motion.div>
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-white/5 py-12 text-center text-sm text-white/30 font-light">
        <p>© {new Date().getFullYear()} ExamEdge Institute. Crafted with precision.</p>
      </footer>
    </div>
  )
}
