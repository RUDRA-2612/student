'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { Logo } from '@/components/logo'

/* ───── IO Reveal (no framer) ───── */
function R({ children, className = '', d = 0 }: { children: React.ReactNode; className?: string; d?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [v, setV] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); obs.disconnect() } }, { threshold: 0.12 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return (
    <div ref={ref} className={`transition-all ${v ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} ${className}`} style={{ transitionDuration: '900ms', transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)', transitionDelay: `${d}ms` }}>
      {children}
    </div>
  )
}



/* ───── Data ───── */
const subjects = [
  { code: 'CSE101', name: 'Programming-I', tag: 'Core' },
  { code: 'EEE101', name: 'Electrical & Electronics', tag: 'Engineering' },
  { code: 'MTH101', name: 'Calculus', tag: 'Math' },
  { code: 'ENV101', name: 'Environment & Sustainability', tag: 'Humanities' },
  { code: 'COM101', name: 'Communication', tag: 'Skills' },
  { code: 'DES101', name: 'Design Creativity', tag: 'Design' },
]

export default function LandingPage() {

  return (
    <div className="min-h-screen bg-bg-base text-[hsl(var(--text-primary))] overflow-x-hidden selection:bg-[hsl(var(--accent))]/30">

      {/* ─── Atmosphere ─── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Main warm blob — off-center, organic */}
        <div className="absolute -top-[30%] right-[-5%] w-[70vw] h-[70vw] rounded-full opacity-[0.07] animate-drift"
          style={{ background: 'radial-gradient(circle, hsl(var(--accent)) 0%, transparent 55%)' }} />
        {/* Smaller peach blob — bottom left */}
        <div className="absolute bottom-[-15%] left-[-10%] w-[50vw] h-[50vw] rounded-full opacity-[0.05] animate-drift-slow"
          style={{ background: 'radial-gradient(circle, hsl(20 90% 68%) 0%, transparent 55%)' }} />
      </div>

      {/* ─── Nav ─── */}
      <header className="absolute top-0 w-full z-50">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-10">
          <div className="flex items-center justify-between h-20">
            <Link 
              href="/" 
              className="text-[20px] font-bold pointer-events-auto"
            >
              <Logo />
            </Link>
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-[11px] font-bold tracking-[0.15em] uppercase text-black dark:text-white hover:opacity-80 transition-opacity">Login</Link>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* ━━━ HERO — centered 3D editorial ━━━ */}
      <section className="relative flex items-start justify-center pt-[100px] pb-[40px] text-center">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-10 w-full flex flex-col items-center">
          {/* Centered headline with 3D text shadow and padding to prevent cutoffs */}
          <div className="mb-4 lg:mb-6">
            <div className="overflow-hidden pb-6">
              <h1 className="animate-text-reveal text-[clamp(2.5rem,6vw,6rem)] leading-[0.9]">
                <Logo />
              </h1>
            </div>
          </div>

          {/* Bottom row — tagline + CTA, centered alignment */}
          <div className="flex flex-col items-center gap-2">


            <div className="animate-fade-up flex items-center justify-center gap-4 mt-0" style={{ animationDelay: '1s' }}>
              <Link
                href="/login"
                className="group relative px-8 py-4 rounded-full text-[13px] font-semibold text-[hsl(var(--text-primary))] overflow-hidden transition-transform hover:scale-[1.03] active:scale-100"
              >
                <span className="absolute inset-0 bg-[hsl(var(--accent))] rounded-full" />
                <span className="absolute inset-0 bg-[hsl(var(--accent))] rounded-full opacity-0 group-hover:opacity-100 blur-xl transition-opacity" />
                <span className="relative flex items-center gap-2">
                  Start Free <ArrowRight size={14} />
                </span>
              </Link>
              <Link href="/dashboard" className="group text-[12px] font-medium tracking-wide text-[hsl(var(--text-primary))]/ hover:text-[hsl(var(--text-primary))] transition-colors flex items-center gap-1 px-3 py-1.5">
                Preview <ArrowUpRight size={11} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </div>


      </section>


      {/* ━━━ SUBJECTS — editorial list, not cards ━━━ */}
      <section className="pt-0 pb-[50px] px-6 lg:px-10 border-t border-white/[0.04]">
        <div className="max-w-[1600px] mx-auto">
          <R>
            <div className="mb-4">
              <h2 className="text-3xl lg:text-5xl font-bold tracking-[-0.03em]">Subjects</h2>
            </div>
            <p className="text-sm text-[hsl(var(--text-primary))]/ mb-0 max-w-md">First-year curriculum. More semesters coming soon.</p>
          </R>

          {/* Square cards layout */}
          <div className="flex flex-wrap justify-start gap-4 lg:gap-6 pb-12 pt-[22px]">
            {subjects.map((sub, i) => (
              <R key={sub.code} d={i * 60}>
                <Link
                  href={`/papers?subjectId=${sub.code}`}
                  className="group flex flex-col w-52 h-52 lg:w-60 lg:h-60 p-5 pt-5 rounded-[2rem] bg-bg-surface border border-white/[0.04] hover:border-accent/30 hover:shadow-glow-sm transition-all duration-500"
                >
                  {/* TOP: Name and Tag */}
                  <div>
                    <h3 className="text-lg lg:text-xl font-medium text-[hsl(var(--text-primary))] leading-tight group-hover:text-accent transition-colors duration-300 mb-1">{sub.name}</h3>
                    <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-accent/80">{sub.tag}</span>
                  </div>

                  {/* MIDDLE: Option to go further */}
                  <div className="mt-4">
                    <div className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[hsl(var(--text-secondary))] group-hover:text-[hsl(var(--text-primary))] transition-colors bg-white/[0.03] px-3 py-1.5 rounded-full border border-white/[0.05] group-hover:border-accent/30">
                      Explore Subject <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>

                  {/* BOTTOM: Code */}
                  <div className="mt-auto flex items-end justify-between">
                    <span className="text-[11px] font-mono font-bold tracking-[0.1em] text-[hsl(var(--text-primary))]">{sub.code}</span>
                  </div>
                </Link>
              </R>
            ))}
          </div>
        </div>
      </section>

      {/* Separator Line */}
      <div className="w-full max-w-[1600px] mx-auto h-[1px] bg-gradient-to-r from-transparent via-orange-600/60 dark:via-blue-400/60 to-transparent" />

      {/* ━━━ FOOTER — beautifully crafted credits ━━━ */}
      <footer className="py-4 px-6 lg:px-10 mt-8 relative overflow-hidden">
        {/* Subtle glowing orb in footer */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full opacity-[0.03] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, hsl(var(--accent)), transparent 60%)' }} />
          
        <div className="max-w-[1600px] mx-auto flex flex-col items-center justify-center text-center relative z-10">
          <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full border border-accent/20 bg-accent/5 mb-2">
            <span className="text-[9px] font-bold tracking-[0.3em] uppercase text-accent">Created with ❤️</span>
          </div>
          
          <div className="flex flex-col lg:flex-row items-stretch justify-center gap-3 lg:gap-4 w-full max-w-2xl">
            {/* Shubh Dixit */}
            <div className="flex-1 group relative p-[1px] rounded-2xl overflow-hidden bg-gradient-to-b from-white/10 to-transparent hover:from-accent/40 transition-colors duration-700">
              <div className="absolute inset-0 bg-accent/10 opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-700" />
              <div className="relative flex flex-col items-center justify-center h-full px-4 py-5 rounded-[15px] bg-bg-surface/80 backdrop-blur-xl border border-white/[0.02] shadow-xl">
                <h3 className="text-xl md:text-2xl font-medium text-[hsl(var(--text-primary))] group-hover:text-accent transition-colors duration-500" style={{ fontFamily: 'var(--font-serif)' }}>
                  Shubh Dixit
                </h3>
                <div className="mt-4 flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                  <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-[hsl(var(--text-secondary))]">2nd Year</span>
                </div>
              </div>
            </div>

            {/* Rudrapal Singh Shekhawat */}
            <div className="flex-1 group relative p-[1px] rounded-2xl overflow-hidden bg-gradient-to-b from-white/10 to-transparent hover:from-accent/40 transition-colors duration-700">
              <div className="absolute inset-0 bg-accent/10 opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-700" />
              <div className="relative flex flex-col items-center justify-center h-full px-4 py-5 rounded-[15px] bg-bg-surface/80 backdrop-blur-xl border border-white/[0.02] shadow-xl">
                <h3 className="text-xl md:text-2xl font-medium text-[hsl(var(--text-primary))] group-hover:text-accent transition-colors duration-500 text-center leading-tight" style={{ fontFamily: 'var(--font-serif)' }}>
                  Rudrapal Singh Shekhawat
                </h3>
                <div className="mt-4 flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" style={{ animationDelay: '0.5s' }} />
                  <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-[hsl(var(--text-secondary))]">2nd Year</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-white/[0.04] w-full max-w-md flex flex-col items-center">
            <Logo className="text-[12px] opacity-40 mb-2" />
            <span className="text-[9px] text-[hsl(var(--text-secondary))] font-mono opacity-50 uppercase tracking-[0.1em]">© {new Date().getFullYear()} The Backbenchers. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
