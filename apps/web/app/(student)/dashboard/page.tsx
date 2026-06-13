'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'
import { api } from '@/lib/trpc/react'
import Link from 'next/link'
import { BookOpen, Map, Bookmark, Clock, Bell, ArrowUpRight, Send, Compass, Activity, Zap, AlertOctagon } from 'lucide-react'

/* IO Reveal */
function Reveal({ children, className = '', d = 0 }: { children: React.ReactNode; className?: string; d?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [v, setV] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); obs.disconnect() } }, { threshold: 0.1 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return (
    <div ref={ref} className={`transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${v ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'} h-full ${className}`} style={{ transitionDelay: `${d}ms` }}>
      {children}
    </div>
  )
}

/* CountUp */
function CountUp({ target }: { target: number }) {
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
    const dur = 1200, start = performance.now()
    const tick = (now: number) => {
      const p = Math.min((now - start) / dur, 1)
      setV(Math.round((1 - Math.pow(1 - p, 3)) * target))
      if (p < 1) f = requestAnimationFrame(tick)
    }
    f = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(f)
  }, [go, target])
  return <span ref={ref}>{v}</span>
}

/* Shimmer */
function Shimmer() {
  return <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent,rgba(255,240,230,0.04),transparent)] bg-[length:200%_100%] animate-shimmer z-10" />
}

export default function StudentDashboard() {
  const { data: session } = useSession()
  const name = session?.user?.name || 'Scholar'
  const firstName = name.split(' ')[0]

  const { data: stats, isLoading: statsLoading, isError: statsError, refetch: refetchStats } = api.student.dashboardStats.useQuery(undefined, {
    refetchOnWindowFocus: false,
    retry: 1,
  })
  const { data: subjects, isLoading: subjectsLoading, isError: subjectsError, refetch: refetchSubjects } = api.subjects.list.useQuery({ isActive: true }, {
    refetchOnWindowFocus: false,
    retry: 1,
  })
  const { data: announcements, isLoading: announcementsLoading, isError: announcementsError, refetch: refetchAnnouncements } = api.announcements.list.useQuery(undefined, {
    refetchOnWindowFocus: false,
    retry: 1,
  })

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  const hasError = statsError || subjectsError || announcementsError
  const handleRetryAll = () => {
    if (statsError) refetchStats()
    if (subjectsError) refetchSubjects()
    if (announcementsError) refetchAnnouncements()
  }

  return (
    <div className="w-full">
      {hasError && (
        <div className="mb-6 p-4 rounded-xl border border-red-500/10 bg-red-500/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-400 shrink-0">
              <AlertOctagon size={16} />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Some dashboard data failed to load</p>
              <p className="text-[10px] text-white/40">You may be seeing partial information. Please try refreshing.</p>
            </div>
          </div>
          <button
            onClick={handleRetryAll}
            className="px-3.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-[10px] font-semibold text-white/80 hover:text-white transition-all active:scale-95 whitespace-nowrap"
          >
            Retry Loading
          </button>
        </div>
      )}
      {/* ─── BENTO GRID ─── */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-12 gap-4 auto-rows-min">

        {/* Hero Block */}
        <div className="md:col-span-4 lg:col-span-8">
          <Reveal>
            <div className="relative p-8 rounded-2xl border border-white/[0.04] bg-white/[0.015] overflow-hidden">
              <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full opacity-[0.04] pointer-events-none"
                style={{ background: 'radial-gradient(circle, hsl(340 82% 62%), transparent 55%)' }} />
              <div className="relative z-10">
                <p suppressHydrationWarning className="text-[10px] font-bold tracking-[0.3em] uppercase text-[hsl(340,82%,62%)]/60 mb-3">{greeting}</p>
                <h1 className="text-5xl md:text-6xl font-bold tracking-[-0.04em] mb-2">
                  {firstName}<span className="italic text-[hsl(340,82%,62%)]/60" style={{ fontFamily: 'var(--font-serif)' }}>.</span>
                </h1>
                <p className="text-white/30 text-sm max-w-md">Your command center. Pick up where you left off.</p>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Activity stat */}
        <div className="md:col-span-2 lg:col-span-4">
          <Reveal d={80}>
            <div className="h-full rounded-2xl border border-white/[0.04] bg-white/[0.015] p-6 flex flex-col justify-between group hover:border-[hsl(340,82%,62%)]/12 transition-colors duration-500">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-[hsl(340,82%,62%)]/8 border border-[hsl(340,82%,62%)]/15">
                  <Activity size={16} className="text-[hsl(340,82%,62%)]/70" />
                </div>
                <ArrowUpRight size={14} className="text-white/15 group-hover:text-[hsl(340,82%,62%)]/50 transition-colors" />
              </div>
              <div className="mt-6">
                <p className="text-[10px] font-mono tracking-widest uppercase text-white/25 mb-1.5">Activity</p>
                {statsLoading ? (
                  <div className="h-10 w-20 bg-white/[0.03] rounded relative overflow-hidden"><Shimmer /></div>
                ) : statsError ? (
                  <span className="text-sm font-semibold text-red-400/70">Error</span>
                ) : (
                  <span className="text-5xl font-bold tracking-tight text-gradient-accent" style={{ fontFamily: 'var(--font-serif)' }}>
                    <CountUp target={(stats?.roadmapsCount ?? 0) + (stats?.requestsCount ?? 0) + (stats?.bookmarksCount ?? 0)} />
                  </span>
                )}
              </div>
            </div>
          </Reveal>
        </div>

        {/* Small stats */}
        {[
          { label: 'Bookmarks', value: stats?.bookmarksCount, icon: Bookmark, hue: '38' },
          { label: 'Requests', value: stats?.requestsCount, icon: Send, hue: '340' },
        ].map((stat, i) => (
          <div key={stat.label} className="md:col-span-2 lg:col-span-2">
            <Reveal d={120 + i * 40}>
              <div className="h-36 rounded-2xl border border-white/[0.04] bg-white/[0.015] p-5 flex flex-col justify-between hover:border-white/[0.08] transition-colors duration-500">
                <div className="p-1.5 rounded-lg bg-white/[0.03] w-fit">
                  <stat.icon size={13} className="text-white/35" style={{ color: `hsl(${stat.hue} 70% 60% / 0.6)` }} />
                </div>
                <div>
                  {statsLoading ? (
                    <div className="h-7 w-10 bg-white/[0.03] rounded relative overflow-hidden"><Shimmer /></div>
                  ) : statsError ? (
                    <span className="text-xs text-red-400/50">Error</span>
                  ) : (
                    <span className="text-3xl font-bold text-white/80" style={{ fontFamily: 'var(--font-serif)' }}>
                      <CountUp target={stat.value ?? 0} />
                    </span>
                  )}
                  <p className="text-[9px] font-mono tracking-wider uppercase text-white/25 mt-1">{stat.label}</p>
                </div>
              </div>
            </Reveal>
          </div>
        ))}

        {/* Quick Launch */}
        <div className="md:col-span-4 lg:col-span-4">
          <Reveal d={200}>
            <div className="h-full rounded-2xl border border-white/[0.04] bg-white/[0.015] p-5">
              <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-white/30 mb-4 flex items-center gap-2">
                <Zap size={11} className="text-[hsl(340,82%,62%)]/50" /> Quick Launch
              </p>
              <div className="grid grid-cols-2 gap-2.5 h-[calc(100%-32px)]">
                {[
                  { href: '/curriculum', icon: Compass, label: 'Curriculum' },
                  { href: '/roadmap', icon: Map, label: 'Roadmap' },
                  { href: '/papers', icon: BookOpen, label: 'Papers' },
                  { href: '/requests', icon: Send, label: 'Requests' },
                ].map((item) => (
                  <Link key={item.label} href={item.href}
                    className="group flex flex-col items-start justify-center gap-1.5 p-3.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.03] hover:border-white/[0.07] transition-all duration-300">
                    <item.icon size={16} className="text-white/25 group-hover:text-white/70 transition-colors" />
                    <span className="text-[11px] font-medium text-white/45 group-hover:text-white/80 transition-colors">{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </Reveal>
        </div>

        {/* Subjects */}
        <div className="md:col-span-4 lg:col-span-4 row-span-2">
          <Reveal d={250}>
            <div className="h-full rounded-2xl border border-white/[0.04] bg-white/[0.015] p-5 flex flex-col">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xs font-semibold tracking-[0.12em] uppercase text-white/70 flex items-center gap-2">
                  <BookOpen size={13} className="text-[hsl(340,82%,62%)]/50" /> Syllabus
                </h2>
                <Link href="/papers" className="text-[10px] font-semibold tracking-wider uppercase text-white/25 hover:text-[hsl(340,82%,62%)]/60 transition-colors flex items-center gap-1 group">
                  All <ArrowUpRight size={9} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
              </div>
              <div className="flex-1 flex flex-col gap-1">
                {subjectsLoading ? (
                  [1,2,3,4,5].map(i => <div key={i} className="h-12 rounded-lg bg-white/[0.02] relative overflow-hidden"><Shimmer /></div>)
                ) : subjectsError ? (
                  <div className="py-8 text-center text-red-400/50 text-[10px] flex-1 flex flex-col items-center justify-center gap-2">
                    <span>Failed to load syllabus</span>
                    <button onClick={() => refetchSubjects()} className="px-2 py-1 rounded bg-white/5 border border-white/10 hover:bg-white/10 text-[9px] text-white/60 active:scale-95 transition-all">Retry</button>
                  </div>
                ) : !subjects?.length ? (
                  <div className="py-14 text-center text-white/20 text-xs flex-1 flex items-center justify-center">No active subjects</div>
                ) : (
                  subjects.slice(0, 5).map((sub) => (
                    <Link key={sub.id} href={`/papers?subjectId=${sub.id}`}
                      className="group flex items-center justify-between p-3 rounded-lg hover:bg-white/[0.02] transition-colors">
                      <div>
                        <h3 className="text-[11px] font-medium text-white/70 group-hover:text-white/90 transition-colors">{sub.name}</h3>
                        <p className="text-[9px] text-white/20 mt-0.5">{sub.code}</p>
                      </div>
                      <ArrowUpRight size={10} className="text-white/15 group-hover:text-[hsl(340,82%,62%)]/50 transition-colors" />
                    </Link>
                  ))
                )}
              </div>
            </div>
          </Reveal>
        </div>

        {/* Announcements */}
        <div className="md:col-span-4 lg:col-span-8">
          <Reveal d={300}>
            <div className="rounded-2xl border border-white/[0.04] bg-white/[0.015] p-5">
              <div className="flex items-center gap-2 mb-4">
                <Bell size={12} className="text-[hsl(340,82%,62%)]/50" />
                <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-white/30">Bulletins</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {announcementsLoading ? (
                  [1,2].map(i => <div key={i} className="h-20 rounded-xl bg-white/[0.02] relative overflow-hidden"><Shimmer /></div>)
                ) : announcementsError ? (
                  <div className="col-span-2 py-6 text-center text-red-400/50 text-[10px] flex flex-col items-center justify-center gap-2">
                    <span>Failed to load bulletins</span>
                    <button onClick={() => refetchAnnouncements()} className="px-2 py-1 rounded bg-white/5 border border-white/10 hover:bg-white/10 text-[9px] text-white/60 active:scale-95 transition-all">Retry</button>
                  </div>
                ) : !announcements?.length ? (
                  <div className="col-span-2 py-6 text-center text-white/15 text-xs">No announcements</div>
                ) : (
                  announcements.slice(0, 2).map((ann) => (
                    <div key={ann.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.03] hover:border-white/[0.06] transition-colors group">
                      <div className="flex items-center justify-between mb-2.5">
                        <span className="px-2 py-0.5 rounded text-[8px] font-bold tracking-wider uppercase bg-[hsl(340,82%,62%)]/8 border border-[hsl(340,82%,62%)]/15 text-[hsl(340,82%,62%)]/70">
                          {ann.type}
                        </span>
                        <span suppressHydrationWarning className="text-[9px] text-white/15 font-mono flex items-center gap-1">
                          <Clock size={8} />{new Date(ann.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="text-xs font-semibold text-white/80 mb-1 group-hover:text-white/95 transition-colors">{ann.title}</h4>
                      <p className="text-[10px] text-white/30 leading-relaxed line-clamp-2">{ann.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  )
}
