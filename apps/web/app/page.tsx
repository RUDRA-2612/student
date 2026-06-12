'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { NoiseOverlay } from '@/components/ui/noise-overlay'

/* ───── Magnetic Button ───── */
function MagneticButton({ children, href, className = '' }: { children: React.ReactNode; href: string; className?: string }) {
  const ref = useRef<HTMLAnchorElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 150, damping: 15 })
  const springY = useSpring(y, { stiffness: 150, damping: 15 })

  const handleMouse = (e: React.MouseEvent) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    x.set((e.clientX - rect.left - rect.width / 2) * 0.3)
    y.set((e.clientY - rect.top - rect.height / 2) * 0.3)
  }

  return (
    <motion.a
      ref={ref}
      href={href}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouse}
      onMouseLeave={() => { x.set(0); y.set(0) }}
      className={className}
    >
      {children}
    </motion.a>
  )
}

/* ───── Infinite Marquee ───── */
function Marquee({ children, speed = 30 }: { children: React.ReactNode; speed?: number }) {
  return (
    <div className="overflow-hidden whitespace-nowrap">
      <motion.div
        className="inline-flex gap-8"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: speed, repeat: Infinity, ease: 'linear' }}
      >
        {children}
        {children}
      </motion.div>
    </div>
  )
}

/* ───── Parallax Image Block ───── */
function ParallaxBlock({ children, offset = 80 }: { children: React.ReactNode; offset?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [offset, -offset])

  return (
    <div ref={ref} className="overflow-hidden">
      <motion.div style={{ y }}>{children}</motion.div>
    </div>
  )
}

/* ───── Subjects Data ───── */
const subjects = [
  { code: 'CSE101', name: 'Programming-I', tag: 'CORE' },
  { code: 'EEE101', name: 'Electrical & Electronics', tag: 'ENGINEERING' },
  { code: 'DES101', name: 'Design Creativity', tag: 'DESIGN' },
  { code: 'MTH101', name: 'Calculus', tag: 'MATHEMATICS' },
  { code: 'ENV101', name: 'Environment & Sustainability', tag: 'HUMANITIES' },
  { code: 'COM101', name: 'Communication', tag: 'SKILLS' },
]

const marqueeWords = ['PAST PAPERS', 'STUDY ROADMAPS', 'CURATED SYLLABI', 'EXAM PATTERNS', 'QUESTION BANKS', 'DEEP ANALYSIS', 'COLLEGE EXAMS', 'SEMESTER PREP']

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll()
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.92])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0])
  const heroBlur = useTransform(scrollYProgress, [0, 0.15], [0, 10])

  const [time, setTime] = useState('')
  useEffect(() => {
    const update = () => setTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }))
    update()
    const interval = setInterval(update, 60000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div ref={containerRef} className="min-h-screen bg-[#030303] text-white overflow-x-hidden selection:bg-white/20">
      <NoiseOverlay />

      {/* ─── Minimal Top Bar ─── */}
      <header className="fixed top-0 w-full z-50 mix-blend-difference">
        <div className="max-w-[1800px] mx-auto px-8 h-20 flex items-center justify-between">
          <Link href="/" className="text-sm font-medium tracking-[0.3em] uppercase">ExamEdge</Link>
          <div className="flex items-center gap-8">
            <span className="text-xs text-white/50 font-mono hidden md:block">{time}</span>
            <Link href="/login" className="text-xs tracking-[0.15em] uppercase text-white/60 hover:text-white transition-colors">Enter</Link>
          </div>
        </div>
      </header>

      {/* ─── HERO: Full-bleed editorial ─── */}
      <motion.section
        style={{ scale: heroScale, opacity: heroOpacity, filter: `blur(${heroBlur}px)` } as any}
        className="relative h-screen flex flex-col justify-end px-8 pb-16 origin-center"
      >
        {/* Giant background letter */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
          <span
            className="text-[40vw] font-serif italic leading-none text-white/[0.015] tracking-tighter"
            style={{ fontFamily: 'var(--font-serif), Georgia, serif' }}
          >
            E
          </span>
        </div>

        <div className="relative z-10 max-w-[1800px] mx-auto w-full">
          {/* Oversized headline */}
          <div className="mb-12">
            <motion.h1
              initial={{ y: 120, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
              className="text-[clamp(3rem,11vw,11rem)] font-light leading-[0.85] tracking-[-0.04em]"
            >
              Master your
            </motion.h1>
            <motion.h1
              initial={{ y: 120, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
              className="text-[clamp(3rem,11vw,11rem)] leading-[0.85] tracking-[-0.04em] italic text-white/40"
              style={{ fontFamily: 'var(--font-serif), Georgia, serif' }}
            >
              semester.
            </motion.h1>
          </div>

          {/* Bottom row: tagline + CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-8"
          >
            <p className="text-white/35 text-base md:text-lg max-w-md leading-relaxed font-light">
              A curated platform that decodes years of past examination 
              patterns to give you an unfair academic advantage.
            </p>

            <div className="flex items-center gap-6">
              <MagneticButton
                href="/login"
                className="group flex items-center gap-4 px-8 py-5 rounded-full bg-white text-black font-medium text-sm transition-transform"
              >
                Start Preparing
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </MagneticButton>
              <MagneticButton
                href="/dashboard"
                className="group flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors"
              >
                Preview
                <ArrowUpRight size={14} />
              </MagneticButton>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-px h-12 bg-gradient-to-b from-white/30 to-transparent"
          />
        </motion.div>
      </motion.section>

      {/* ─── Marquee Strip ─── */}
      <section className="py-6 border-y border-white/[0.04] bg-white/[0.01]">
        <Marquee speed={40}>
          {marqueeWords.map((word) => (
            <span key={word} className="text-[10px] font-medium tracking-[0.3em] uppercase text-white/25 flex items-center gap-8">
              {word} <span className="w-1 h-1 rounded-full bg-white/20" />
            </span>
          ))}
        </Marquee>
      </section>

      {/* ─── Subjects: Editorial Grid ─── */}
      <section className="py-32 px-8">
        <div className="max-w-[1800px] mx-auto">
          <div className="flex items-end justify-between mb-20">
            <ParallaxBlock offset={40}>
              <h2 className="text-5xl md:text-7xl font-light tracking-[-0.03em]">
                The <span className="italic text-white/40" style={{ fontFamily: 'var(--font-serif), Georgia, serif' }}>curriculum</span>
              </h2>
            </ParallaxBlock>
            <span className="text-[10px] text-white/30 font-mono tracking-wider hidden md:block">SEM 01 / 02</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/[0.04]">
            {subjects.map((sub, i) => (
              <motion.div
                key={sub.code}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.8, delay: i * 0.08, ease: [0.25, 1, 0.5, 1] }}
              >
                <Link
                  href={`/papers?subjectId=${sub.code}`}
                  className="group block p-8 md:p-10 bg-[#030303] hover:bg-white/[0.02] transition-colors duration-500 h-full"
                >
                  <div className="flex items-center justify-between mb-12">
                    <span className="text-[9px] font-medium tracking-[0.25em] uppercase text-white/25">{sub.tag}</span>
                    <span className="text-[10px] font-mono text-white/20">{sub.code}</span>
                  </div>
                  <h3 className="text-xl md:text-2xl font-light tracking-tight text-white/70 group-hover:text-white transition-colors duration-500 mb-4">
                    {sub.name}
                  </h3>
                  <div className="flex items-center gap-2 text-white/0 group-hover:text-white/40 transition-all duration-500">
                    <span className="text-[10px] tracking-[0.15em] uppercase">Explore</span>
                    <ArrowUpRight size={12} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Stats: Oversized Numbers ─── */}
      <section className="py-32 px-8 border-t border-white/[0.04]">
        <div className="max-w-[1800px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-0">
          {[
            { n: '10K+', l: 'Active Scholars' },
            { n: '500+', l: 'Curated Papers' },
            { n: '12', l: 'Subjects Covered' },
            { n: '98%', l: 'Success Rate' },
          ].map((stat, i) => (
            <ParallaxBlock key={stat.l} offset={20 + i * 10}>
              <div className={`${i > 0 ? 'md:border-l md:border-white/[0.04] md:pl-12' : ''}`}>
                <div
                  className="text-5xl md:text-7xl font-light tracking-tight mb-3 text-white/80"
                  style={{ fontFamily: 'var(--font-serif), Georgia, serif' }}
                >
                  {stat.n}
                </div>
                <div className="text-[10px] font-medium tracking-[0.2em] uppercase text-white/30">{stat.l}</div>
              </div>
            </ParallaxBlock>
          ))}
        </div>
      </section>

      {/* ─── CTA: Full-width typographic ─── */}
      <section className="py-40 px-8 border-t border-white/[0.04]">
        <div className="max-w-[1800px] mx-auto text-center">
          <ParallaxBlock offset={30}>
            <h2 className="text-4xl md:text-6xl lg:text-8xl font-light tracking-[-0.03em] mb-12">
              Begin your <span className="italic text-white/40" style={{ fontFamily: 'var(--font-serif), Georgia, serif' }}>preparation</span>
            </h2>
          </ParallaxBlock>
          <MagneticButton
            href="/signup"
            className="inline-flex items-center gap-4 px-10 py-5 rounded-full border border-white/10 hover:bg-white hover:text-black text-sm font-medium transition-all duration-500 group"
          >
            Create Free Account
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </MagneticButton>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-white/[0.04] py-16 px-8">
        <div className="max-w-[1800px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <span className="text-[10px] tracking-[0.3em] uppercase text-white/30">ExamEdge Institute</span>
          <span className="text-[10px] text-white/20 font-mono">© {new Date().getFullYear()}</span>
        </div>
      </footer>
    </div>
  )
}
