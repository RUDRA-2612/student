'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, ArrowUpRight, Star } from 'lucide-react'
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

/* ───── CountUp ───── */
function CountUp({ target, suffix = '' }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [v, setV] = useState(0)
  const [go, setGo] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setGo(true); obs.disconnect() } }, { threshold: 0.5 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  useEffect(() => {
    if (!go) return
    let f: number
    const dur = 1800, start = performance.now()
    const tick = (now: number) => {
      const p = Math.min((now - start) / dur, 1)
      setV(Math.round((1 - Math.pow(1 - p, 4)) * target))
      if (p < 1) f = requestAnimationFrame(tick)
    }
    f = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(f)
  }, [go, target])
  return <span ref={ref}>{v.toLocaleString()}{suffix}</span>
}

/* ───── Data ───── */
const subjects = [
  { code: 'CSE101', name: 'Programming-I', tag: 'Core' },
  { code: 'EEE101', name: 'Electrical & Electronics', tag: 'Engineering' },
  { code: 'DES101', name: 'Design Creativity', tag: 'Design' },
  { code: 'MTH101', name: 'Calculus', tag: 'Math' },
  { code: 'ENV101', name: 'Environment & Sustainability', tag: 'Humanities' },
  { code: 'COM101', name: 'Communication', tag: 'Skills' },
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
      <header className="fixed top-0 w-full z-50 mix-blend-difference">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-10">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="text-[13px]"><Logo /></Link>
            <div className="flex items-center gap-8">
              <Link href="/login" className="text-[11px] tracking-[0.15em] uppercase text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] transition-colors">Login</Link>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* ━━━ HERO — centered 3D editorial ━━━ */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 pb-16 lg:pb-20 text-center">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-10 w-full flex flex-col items-center">
          {/* Centered headline with 3D text shadow and padding to prevent cutoffs */}
          <div className="mb-10 lg:mb-14">
            <div className="overflow-hidden pb-10">
              <h1 className="animate-text-reveal text-[clamp(3.5rem,8vw,8rem)] leading-[0.9]"
                style={{
                  animationDelay: '0.2s',
                  textShadow: '1px 1px 0px hsl(var(--accent-hover)), 2px 2px 0px hsl(var(--accent-hover)), 3px 3px 0px hsl(var(--accent-hover)), 4px 4px 0px hsl(var(--accent-hover)), 5px 5px 0px hsl(var(--accent-hover)), 6px 6px 0px hsl(var(--accent-hover))'
                }}>
                <Logo />
              </h1>
            </div>
          </div>

          {/* Bottom row — tagline + CTA, centered alignment */}
          <div className="flex flex-col items-center gap-8">


            <div className="animate-fade-up flex items-center justify-center gap-5" style={{ animationDelay: '1s' }}>
              <Link
                href="/login"
                className="group relative px-10 py-5 rounded-full text-sm font-semibold text-[hsl(var(--text-primary))] overflow-hidden transition-transform hover:scale-[1.03] active:scale-100"
              >
                <span className="absolute inset-0 bg-[hsl(var(--accent))] rounded-full" />
                <span className="absolute inset-0 bg-[hsl(var(--accent))] rounded-full opacity-0 group-hover:opacity-100 blur-xl transition-opacity" />
                <span className="relative flex items-center gap-3">
                  Start Free <ArrowRight size={15} />
                </span>
              </Link>
              <Link href="/dashboard" className="group text-[13px] font-medium tracking-wide text-[hsl(var(--text-primary))]/ hover:text-[hsl(var(--text-primary))] transition-colors flex items-center gap-1.5 px-4 py-2">
                Preview <ArrowUpRight size={12} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll line */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 animate-fade-in" style={{ animationDelay: '2.5s' }}>
          <span className="text-[8px] tracking-[0.3em] uppercase text-[hsl(var(--text-primary))]/">Scroll</span>
          <div className="w-px h-10 bg-gradient-to-b from-[hsl(var(--accent))]/30 to-transparent animate-float" />
        </div>
      </section>

      {/* ━━━ PROOF BAR — horizontal stats strip ━━━ */}
      <section className="border-y border-white/[0.04]">
        <div className="max-w-[1600px] mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4">
            {[
              { n: 10000, s: '+', l: 'Students' },
              { n: 500, s: '+', l: 'Papers' },
              { n: 12, s: '', l: 'Subjects' },
              { n: 98, s: '%', l: 'Pass Rate' },
            ].map((s, i) => (
              <R key={s.l} d={i * 80}>
                <div className={`py-8 px-6 lg:px-10 ${i > 0 ? 'border-l border-white/[0.04]' : ''}`}>
                  <div className="text-3xl lg:text-4xl font-bold tracking-tight text-[hsl(var(--text-primary))]/ mb-1" style={{ fontFamily: 'var(--font-serif)' }}>
                    <CountUp target={s.n} suffix={s.s} />
                  </div>
                  <div className="text-[10px] font-medium tracking-[0.2em] uppercase text-[hsl(var(--text-primary))]/">{s.l}</div>
                </div>
              </R>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ SUBJECTS — editorial list, not cards ━━━ */}
      <section className="py-20 lg:py-32 px-6 lg:px-10 border-t border-white/[0.04]">
        <div className="max-w-[1600px] mx-auto">
          <R>
            <div className="flex items-baseline gap-4 mb-4">
              <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-[hsl(var(--accent))]/60">01</span>
              <h2 className="text-3xl lg:text-5xl font-bold tracking-[-0.03em]">Subjects</h2>
            </div>
            <p className="text-sm text-[hsl(var(--text-primary))]/ mb-14 max-w-md">First-year curriculum. More semesters coming soon.</p>
          </R>

          {/* List-style subject rows — way more editorial than card grids */}
          <div className="border-t border-white/[0.04]">
            {subjects.map((sub, i) => (
              <R key={sub.code} d={i * 60}>
                <Link
                  href={`/papers?subjectId=${sub.code}`}
                  className="group flex items-center justify-between py-5 lg:py-6 border-b border-white/[0.04] hover:border-[hsl(var(--accent))]/15 transition-colors duration-500 px-1"
                >
                  <div className="flex items-center gap-6 lg:gap-10">
                    <span className="text-[10px] font-mono text-[hsl(var(--text-primary))]/ w-8">{String(i + 1).padStart(2, '0')}</span>
                    <div>
                      <h3 className="text-base lg:text-lg font-medium text-[hsl(var(--text-primary))]/ group-hover:text-[hsl(var(--text-primary))] transition-colors duration-300">{sub.name}</h3>
                      <span className="text-[10px] text-[hsl(var(--text-primary))]/ mt-0.5 block">{sub.code}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[9px] font-medium tracking-[0.2em] uppercase text-[hsl(var(--text-primary))]/ hidden md:block">{sub.tag}</span>
                    <div className="w-8 h-8 rounded-full border border-white/[0.06] flex items-center justify-center group-hover:border-[hsl(var(--accent))]/30 group-hover:bg-[hsl(var(--accent))]/5 transition-all duration-300">
                      <ArrowUpRight size={12} className="text-[hsl(var(--text-primary))]/ group-hover:text-[hsl(var(--accent))] transition-colors duration-300" />
                    </div>
                  </div>
                </Link>
              </R>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ TESTIMONIAL — single big quote for personality ━━━ */}
      <section className="py-24 lg:py-36 px-6 lg:px-10 relative overflow-hidden">
        {/* Subtle rose blob */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-[0.04] pointer-events-none"
          style={{ background: 'radial-gradient(circle, hsl(var(--accent)), transparent 50%)' }} />
        
        <div className="max-w-[1600px] mx-auto relative z-10">
          <R>
            <div className="max-w-3xl mx-auto text-center">
              <div className="flex justify-center gap-1 mb-8">
                {[1,2,3,4,5].map(i => <Star key={i} size={14} className="text-[hsl(var(--accent))]/60 fill-[hsl(var(--accent))]/60" />)}
              </div>
              <blockquote className="text-2xl lg:text-4xl font-light leading-snug tracking-tight mb-8 text-[hsl(var(--text-primary))]/">
                &ldquo;I used to spend <span className="italic text-[hsl(var(--text-primary))]/" style={{ fontFamily: 'var(--font-serif)' }}>weeks</span> hunting for past papers. <Logo className="inline-block text-[14px] lg:text-[18px]" /> gave me everything in <span className="italic text-[hsl(var(--text-primary))]/" style={{ fontFamily: 'var(--font-serif)' }}>minutes</span>.&rdquo;
              </blockquote>
              <div>
                <p className="text-sm font-medium text-[hsl(var(--text-primary))]/">— Third-year CS Student</p>
                <p className="text-[10px] text-[hsl(var(--text-primary))]/ mt-1">IIITD, Batch of 2026</p>
              </div>
            </div>
          </R>
        </div>
      </section>

      {/* ━━━ CTA — typographic, not a gradient box ━━━ */}
      <section className="py-32 lg:py-44 px-6 lg:px-10 border-t border-white/[0.04] text-center">
        <div className="max-w-[1600px] mx-auto flex flex-col items-center">
          <R>
            <div className="pb-4">
              <h2 className="text-4xl md:text-6xl lg:text-[5.5rem] font-bold tracking-[-0.03em] leading-[0.92] mb-10 max-w-4xl mx-auto"
                style={{
                  textShadow: '1px 1px 0px hsl(var(--accent-hover)), 2px 2px 0px hsl(var(--accent-hover)), 3px 3px 0px hsl(var(--accent-hover)), 4px 4px 0px hsl(var(--accent-hover))'
                }}>
                Ready to stop<br />
                <span className="italic text-[hsl(var(--accent))]" style={{ 
                  fontFamily: 'var(--font-serif)',
                  textShadow: '1px 1px 0px hsl(var(--accent-muted)), 2px 2px 0px hsl(var(--accent-muted)), 3px 3px 0px hsl(var(--accent-muted)), 4px 4px 0px hsl(var(--accent-muted))'
                }}>winging it</span>?
              </h2>
            </div>
          </R>
          <R d={150}>
            <div className="flex flex-wrap items-center justify-center gap-5">
              <Link
                href="/signup"
                className="group relative px-10 py-5 rounded-full text-sm font-semibold text-[hsl(var(--text-primary))] overflow-hidden transition-transform hover:scale-[1.03] active:scale-100"
              >
                <span className="absolute inset-0 bg-[hsl(var(--accent))] rounded-full" />
                <span className="absolute inset-0 bg-[hsl(var(--accent))] rounded-full opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />
                <span className="relative flex items-center gap-3">
                  Create Free Account <ArrowRight size={15} />
                </span>
              </Link>
              <Link href="/login" className="text-sm text-[hsl(var(--text-primary))]/ hover:text-[hsl(var(--text-primary))]/ transition-colors underline underline-offset-4 decoration-[hsl(var(--text-primary))]/ hover:decoration-[hsl(var(--text-primary))]/">
                or sign in
              </Link>
            </div>
          </R>
        </div>
      </section>

      {/* ━━━ FOOTER — minimal ━━━ */}
      <footer className="border-t border-white/[0.04] py-10 px-6 lg:px-10">
        <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo className="text-[11px] text-[hsl(var(--text-primary))]/" />
          <div className="flex items-center gap-6">
            <Link href="/login" className="text-[11px] text-[hsl(var(--text-primary))]/ hover:text-[hsl(var(--text-primary))]/ transition-colors">Login</Link>
            <Link href="/signup" className="text-[11px] text-[hsl(var(--text-primary))]/ hover:text-[hsl(var(--text-primary))]/ transition-colors">Sign Up</Link>
          </div>
          <span className="text-[10px] text-[hsl(var(--text-primary))]/ font-mono">© {new Date().getFullYear()}</span>
        </div>
      </footer>
    </div>
  )
}
