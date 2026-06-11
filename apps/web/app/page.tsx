'use client'

import React, { useRef, useState } from 'react'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, BookOpen, ChevronRight, Target, Compass, Award } from 'lucide-react'

// --- Custom Effects ---

// 1. Tactile Noise Overlay
const NoiseOverlay = () => (
  <div 
    className="pointer-events-none fixed inset-0 z-50 opacity-[0.03] mix-blend-overlay"
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
    }}
  />
)

// 2. Interactive Spotlight Card
const SpotlightCard = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => {
  const divRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [opacity, setOpacity] = useState(0)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return
    const rect = divRef.current.getBoundingClientRect()
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      className={`relative overflow-hidden rounded-3xl border border-white/5 bg-[#0a0a0c] transition-colors ${className}`}
    >
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(251, 146, 60, 0.1), transparent 40%)`,
        }}
      />
      {children}
    </div>
  )
}

// 3. Kinetic Staggered Reveal Variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 40, filter: 'blur(10px)' },
  show: { 
    opacity: 1, 
    y: 0, 
    filter: 'blur(0px)',
    transition: { type: 'spring', stiffness: 100, damping: 20 }
  }
}

// --- Data ---
const stats = [
  { value: '10K+', label: 'Scholars Enrolled' },
  { value: '500+', label: 'Papers Curated' },
  { value: '99.9%', label: 'Platform Reliability' },
  { value: '4.9★', label: 'Student Satisfaction' },
]

const faculty = [
  {
    name: 'Dr. Evelyn Hayes',
    role: 'Head of Curriculum',
    icon: BookOpen,
    gradient: 'from-amber-500 to-orange-500',
  },
  {
    name: 'Marcus Thorne',
    role: 'Assessment Strategist',
    icon: Target,
    gradient: 'from-orange-500 to-rose-500',
  },
  {
    name: 'Sarah Lin',
    role: 'Student Success',
    icon: Compass,
    gradient: 'from-rose-500 to-pink-600',
  },
]

export default function LandingPage() {
  const { scrollYProgress } = useScroll()
  const yParallax = useTransform(scrollYProgress, [0, 1], [0, -100])

  return (
    <div className="min-h-screen text-white overflow-hidden font-sans selection:bg-amber-500/30" style={{ background: '#050505' }}>
      <NoiseOverlay />

      {/* Atmospheric Backgrounds (No Blue/Cyan) */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-amber-500/10 rounded-full blur-[150px] mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-rose-600/5 rounded-full blur-[150px] mix-blend-screen" />
      </div>

      {/* ─── Header ─── */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#050505]/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-8 h-24 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 rounded-full flex items-center justify-center font-serif font-bold text-white shadow-lg bg-gradient-to-br from-amber-600 to-rose-700 transition-transform group-hover:scale-105">
              EE
            </div>
            <span className="font-display font-medium text-xl tracking-wide text-slate-100 group-hover:text-white transition-colors">ExamEdge</span>
          </Link>

          <nav className="hidden md:flex items-center gap-10 text-sm font-medium text-slate-400">
            <Link href="#philosophy" className="hover:text-amber-400 transition-colors">Philosophy</Link>
            <Link href="#faculty" className="hover:text-amber-400 transition-colors">Faculty</Link>
            <Link href="/faqs" className="hover:text-amber-400 transition-colors">Insights</Link>
          </nav>

          <div className="flex items-center gap-6">
            <Link href="/login" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
              Sign In
            </Link>
            <Link
              href="/signup"
              className="relative overflow-hidden group flex items-center gap-2 text-sm font-medium text-white px-6 py-3 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-all"
            >
              <span className="relative z-10 flex items-center gap-2">Begin Journey <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" /></span>
            </Link>
          </div>
        </div>
      </header>

      {/* ─── Hero ─── */}
      <main className="relative z-10">
        <section className="relative min-h-[85vh] flex flex-col justify-center items-center px-6">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="max-w-5xl mx-auto text-center relative z-10"
          >
            <motion.div variants={itemVariants} className="mb-12 inline-flex items-center gap-3 px-6 py-2 rounded-full border border-amber-500/20 bg-amber-500/5">
              <Award size={14} className="text-amber-500" />
              <span className="text-xs font-semibold tracking-widest uppercase text-amber-500/90">A New Standard in Academic Preparation</span>
            </motion.div>

            <motion.h1 variants={itemVariants} className="font-display font-light tracking-tight leading-[1.05] mb-8 text-5xl md:text-7xl lg:text-8xl">
              Master your <em className="font-serif italic text-amber-500">college exams</em><br className="hidden md:block" />
              with absolute clarity.
            </motion.h1>

            <motion.p variants={itemVariants} className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto font-light leading-relaxed mb-16">
              A curated academic sanctuary designed to demystify vast university syllabi. 
              We extract high-signal patterns from decades of past examinations, crafting bespoke learning pathways.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link
                href="/login"
                className="group relative px-8 py-4 rounded-full font-medium text-white overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-amber-600 to-rose-600 transition-transform duration-500 group-hover:scale-105" />
                <span className="relative z-10 flex items-center gap-3 text-lg">
                  Access Platform <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
              <Link
                href="/dashboard"
                className="group px-8 py-4 rounded-full font-medium text-slate-300 border border-white/10 hover:bg-white/5 transition-colors flex items-center gap-2 text-lg"
              >
                Preview Dashboard <ChevronRight size={18} className="text-slate-500 group-hover:text-white transition-colors" />
              </Link>
            </motion.div>
          </motion.div>

          {/* Abstract Hero Art */}
          <motion.div style={{ y: yParallax }} className="absolute bottom-0 left-0 w-full h-[40vh] pointer-events-none overflow-hidden opacity-40">
            <div className="absolute bottom-[-20%] left-1/2 -translate-x-1/2 w-[120%] h-full border-t border-amber-500/10 rounded-[100%] bg-gradient-to-b from-amber-500/5 to-transparent" />
          </motion.div>
        </section>

        {/* ─── Stats Section ─── */}
        <section className="max-w-7xl mx-auto px-6 pb-32 relative z-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((s, i) => (
              <SpotlightCard key={s.label} className="p-8 group text-center md:text-left">
                <div className="relative z-10">
                  <div className="font-serif italic text-4xl md:text-5xl text-white mb-3">{s.value}</div>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest">{s.label}</div>
                </div>
              </SpotlightCard>
            ))}
          </div>
        </section>

        {/* ─── Philosophy Section ─── */}
        <section id="philosophy" className="max-w-7xl mx-auto px-6 py-32 border-t border-white/5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-10">
              <h2 className="font-serif italic text-5xl md:text-6xl text-white">The Philosophy</h2>
              <div className="w-16 h-px bg-amber-500/50" />
              <p className="text-xl text-slate-400 font-light leading-relaxed">
                We reject the chaos of traditional cramming. True academic mastery comes from understanding the underlying structure of your institution's expectations. 
              </p>
              <p className="text-xl text-slate-400 font-light leading-relaxed">
                By meticulously analyzing historical college exam patterns, we map out the shortest path to competence. It is not about studying longer; it is about studying with elegant precision.
              </p>
              <ul className="space-y-4 pt-6">
                {[
                  'Bespoke Curriculum Mapping',
                  'Pattern-Based Focus Hierarchies',
                  'Distraction-Free Deep Work Environment'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-4 text-slate-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span className="text-lg font-light">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative h-[600px] rounded-3xl overflow-hidden border border-white/10 bg-[#0a0a0c]">
               {/* Organic visual element */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(251,146,60,0.08)_0%,transparent_60%)]" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-amber-500/20 rounded-full animate-[spin_60s_linear_infinite]" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 border border-rose-500/10 rounded-full animate-[spin_80s_linear_infinite_reverse]" />
              
              <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
                <BookOpen size={48} className="text-amber-500/80 mb-8 stroke-1" />
                <h3 className="text-2xl font-display font-medium text-white mb-4">Structural Clarity</h3>
                <p className="text-slate-400 font-light text-center max-w-sm">Every syllabus module is broken down, analyzed, and prioritized based on strict statistical relevance.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Faculty Section ─── */}
        <section id="faculty" className="max-w-7xl mx-auto px-6 py-32 border-t border-white/5">
          <div className="text-center mb-20 space-y-6">
            <h2 className="text-5xl md:text-6xl font-serif italic text-white">The Creators</h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-xl font-light">A collective of academics and technologists dedicated to elevating the student experience.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {faculty.map((member) => (
              <SpotlightCard key={member.name} className="p-10 group flex flex-col items-center text-center h-full">
                <div className={`w-24 h-24 rounded-full mb-8 flex items-center justify-center bg-gradient-to-br ${member.gradient} shadow-2xl shadow-orange-500/10 transition-transform duration-500 group-hover:scale-110`}>
                  <member.icon size={32} className="text-white" strokeWidth={1.5} />
                </div>
                <h3 className="text-2xl font-display font-medium text-white mb-2">{member.name}</h3>
                <p className="font-medium text-amber-500/80 text-sm tracking-wider uppercase">{member.role}</p>
              </SpotlightCard>
            ))}
          </div>
        </section>

      </main>

      {/* ─── Footer ─── */}
      <footer className="border-t border-white/5 bg-[#030303]">
        <div className="max-w-7xl mx-auto px-8 py-16 flex flex-col md:flex-row items-center justify-between gap-8 text-sm text-slate-500">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-600 to-rose-700 flex items-center justify-center text-[10px] font-bold text-white font-serif">EE</div>
            <p>© {new Date().getFullYear()} ExamEdge Institute. All rights reserved.</p>
          </div>
          <div className="flex items-center gap-10 font-medium">
            <Link href="/admin" className="hover:text-white transition-colors">Administration</Link>
            <Link href="/faqs"  className="hover:text-white transition-colors">Help Center</Link>
            <Link href="/login" className="hover:text-white transition-colors">Student Login</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
