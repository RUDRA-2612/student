'use client'

import React from 'react'
import { useSession } from 'next-auth/react'
import { api } from '@/lib/trpc/react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { BookOpen, Map, Bookmark, Clock, Bell, ArrowUpRight, Send, Compass, Sparkles, Activity } from 'lucide-react'
import { TiltCard } from '@/components/ui/tilt-card'

/* ───── Reveal Card ───── */
function RevealCard({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.8, delay, ease: [0.25, 1, 0.5, 1] }}
      className={`h-full ${className}`}
    >
      {children}
    </motion.div>
  )
}

/* ───── Shimmer Skeleton ───── */
function Shimmer() {
  return (
    <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent,rgba(255,255,255,0.05),transparent)] bg-[length:200%_100%] animate-shimmer z-10" />
  )
}

export default function StudentDashboard() {
  const { data: session } = useSession()
  const name = session?.user?.name || 'Scholar'
  const firstName = name.split(' ')[0]

  const { data: stats, isLoading: statsLoading } = api.student.dashboardStats.useQuery()
  const { data: subjects, isLoading: subjectsLoading } = api.subjects.list.useQuery({ isActive: true })
  const { data: announcements, isLoading: announcementsLoading } = api.announcements.list.useQuery()

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="w-full text-white">
      {/* ─── BENTO GRID ─── */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-12 gap-4 auto-rows-min">

        {/* 1. Hero Block (Spans 8 cols) */}
        <div className="md:col-span-4 lg:col-span-8 row-span-1">
          <RevealCard>
            <div className="relative h-full p-8 rounded-3xl border border-white/[0.04] bg-bg-surface/40 backdrop-blur-md overflow-hidden flex flex-col justify-end group">
              {/* Background gradient orb */}
              <div className="absolute -top-32 -right-32 w-96 h-96 bg-brand-mint/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-brand-mint/20 transition-colors duration-700" />
              
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles size={14} className="text-accent" />
                  <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-accent">{greeting}</p>
                </div>
                <h1 className="text-5xl md:text-7xl font-light tracking-[-0.04em] bg-clip-text text-transparent bg-gradient-to-br from-white to-white/60 mb-2">
                  {firstName}<span className="italic bg-clip-text text-transparent bg-gradient-accent font-serif" style={{ fontFamily: 'var(--font-serif), Georgia, serif' }}>.</span>
                </h1>
                <p className="text-white/40 text-sm max-w-md">Your personalized command center. Resume your active papers or explore new roadmap objectives.</p>
              </div>
            </div>
          </RevealCard>
        </div>

        {/* 2. Primary Stat Block (Spans 4 cols) */}
        <div className="md:col-span-2 lg:col-span-4 row-span-1">
          <RevealCard delay={0.1}>
            <TiltCard 
              maxTilt={4}
              glareOpacity={0.06}
              className="h-full rounded-3xl border border-white/[0.04] bg-bg-surface/40 backdrop-blur-md p-6 flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between" style={{ transform: 'translateZ(20px)' }}>
                <div className="p-2.5 rounded-xl bg-accent/10 border border-accent/20">
                  <Activity size={18} className="text-accent" />
                </div>
                <ArrowUpRight size={16} className="text-white/20 group-hover:text-accent transition-colors" />
              </div>
              <div className="mt-8" style={{ transform: 'translateZ(30px)' }}>
                <p className="text-[10px] font-mono tracking-widest uppercase text-white/30 mb-2">Total Activity</p>
                {statsLoading ? (
                  <div className="h-12 w-24 bg-white/5 rounded-lg relative overflow-hidden"><Shimmer /></div>
                ) : (
                  <div className="flex items-baseline gap-2">
                    <span className="text-6xl font-light font-serif text-white/90" style={{ fontFamily: 'var(--font-serif)' }}>
                      {(stats?.roadmapsCount ?? 0) + (stats?.requestsCount ?? 0) + (stats?.bookmarksCount ?? 0)}
                    </span>
                    <span className="text-xs text-accent font-medium">+12%</span>
                  </div>
                )}
              </div>
            </TiltCard>
          </RevealCard>
        </div>

        {/* 3. Minor Stat Blocks (Span 2 cols each) */}
        {[
          { label: 'Bookmarks', value: stats?.bookmarksCount, icon: Bookmark, color: 'text-brand-amber', bg: 'bg-brand-amber/10', border: 'border-brand-amber/20' },
          { label: 'Requests', value: stats?.requestsCount, icon: Send, color: 'text-brand-coral', bg: 'bg-brand-coral/10', border: 'border-brand-coral/20' },
        ].map((stat, i) => (
          <div key={stat.label} className="md:col-span-2 lg:col-span-2 row-span-1">
            <RevealCard delay={0.15 + i * 0.05}>
              <TiltCard maxTilt={8} glareOpacity={0.05} className="h-40 rounded-3xl border border-white/[0.04] bg-bg-surface/40 backdrop-blur-md p-5 flex flex-col justify-between hover:border-white/[0.1] transition-all">
                <div className="flex items-center justify-between" style={{ transform: 'translateZ(10px)' }}>
                  <div className={`p-2 rounded-lg ${stat.bg} ${stat.border} border`}>
                    <stat.icon size={14} className={stat.color} />
                  </div>
                </div>
                <div style={{ transform: 'translateZ(20px)' }}>
                  {statsLoading ? (
                     <div className="h-8 w-12 bg-white/5 rounded relative overflow-hidden"><Shimmer /></div>
                  ) : (
                    <span className="text-4xl font-light font-serif text-white/90" style={{ fontFamily: 'var(--font-serif)' }}>{stat.value ?? 0}</span>
                  )}
                  <p className="text-[9px] font-mono tracking-wider uppercase text-white/40 mt-1">{stat.label}</p>
                </div>
              </TiltCard>
            </RevealCard>
          </div>
        ))}

        {/* 4. Quick Actions Bento (Spans 4 cols) */}
        <div className="md:col-span-4 lg:col-span-4 row-span-1">
          <RevealCard delay={0.25}>
            <div className="h-full rounded-3xl border border-white/[0.04] bg-bg-surface/40 backdrop-blur-md p-6">
              <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-white/40 mb-4 flex items-center gap-2">
                <Compass size={12} className="text-brand-mint" /> Quick Launch
              </p>
              <div className="grid grid-cols-2 gap-3 h-[calc(100%-36px)]">
                {[
                  { href: '/curriculum', icon: Compass, label: 'Curriculum' },
                  { href: '/roadmap', icon: Map, label: 'Roadmap' },
                  { href: '/papers', icon: BookOpen, label: 'Papers' },
                  { href: '/requests', icon: Send, label: 'Requests' },
                ].map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="group flex flex-col items-start justify-center gap-2 p-4 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.03] hover:border-white/[0.1] transition-all relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <item.icon size={18} className="text-white/30 group-hover:text-white transition-colors" />
                    <span className="text-xs font-medium text-white/60 group-hover:text-white transition-colors">{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </RevealCard>
        </div>

        {/* 5. Subjects List (Spans 4 cols, tall) */}
        <div className="md:col-span-4 lg:col-span-4 row-span-2">
          <RevealCard delay={0.3}>
            <div className="h-full rounded-3xl border border-white/[0.04] bg-bg-surface/40 backdrop-blur-md p-6 flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xs font-semibold tracking-[0.15em] uppercase text-white/90 flex items-center gap-2">
                  <BookOpen size={14} className="text-brand-mint" /> Syllabus
                </h2>
                <Link href="/papers" className="text-[10px] font-semibold tracking-[0.15em] uppercase text-brand-mint/60 hover:text-brand-mint transition-colors flex items-center gap-1 group">
                  View All <ArrowUpRight size={10} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
              </div>

              <div className="flex-1 flex flex-col gap-2">
                {subjectsLoading ? (
                  [1,2,3,4,5].map(i => <div key={i} className="h-14 rounded-xl bg-white/[0.02] relative overflow-hidden"><Shimmer /></div>)
                ) : !subjects?.length ? (
                  <div className="py-16 text-center text-white/30 text-xs flex-1 flex items-center justify-center">No active subjects</div>
                ) : (
                  subjects.slice(0, 5).map((sub) => (
                    <Link
                      key={sub.id}
                      href={`/papers?subjectId=${sub.id}`}
                      className="group flex items-center justify-between p-3 rounded-xl border border-white/0 hover:border-white/[0.04] bg-transparent hover:bg-white/[0.02] transition-all"
                    >
                      <div>
                        <h3 className="text-xs font-medium text-white/80 group-hover:text-white transition-colors">{sub.name}</h3>
                        <p className="text-[10px] text-white/30 mt-0.5">{sub.code}</p>
                      </div>
                      <div className="w-6 h-6 rounded-full bg-white/[0.03] group-hover:bg-brand-mint/10 flex items-center justify-center transition-colors">
                        <ArrowUpRight size={10} className="text-white/30 group-hover:text-brand-mint transition-colors" />
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </RevealCard>
        </div>

        {/* 6. Announcements (Spans 8 cols) */}
        <div className="md:col-span-4 lg:col-span-8 row-span-1">
          <RevealCard delay={0.35}>
            <div className="h-full rounded-3xl border border-white/[0.04] bg-bg-surface/40 backdrop-blur-md p-6">
              <div className="flex items-center gap-2 mb-5">
                <Bell size={13} className="text-accent" />
                <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-white/40">Academic Bulletins</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {announcementsLoading ? (
                  [1,2].map(i => <div key={i} className="h-24 rounded-2xl bg-white/[0.02] relative overflow-hidden"><Shimmer /></div>)
                ) : !announcements?.length ? (
                  <div className="col-span-2 py-8 text-center text-white/20 text-xs">No announcements at this time</div>
                ) : (
                  announcements.slice(0, 2).map((ann) => (
                    <div key={ann.id} className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.03] hover:border-white/[0.08] transition-colors group">
                      <div className="flex items-center justify-between mb-3">
                        <span className="px-2 py-0.5 rounded-md bg-accent/10 border border-accent/20 text-[9px] font-medium tracking-wider uppercase text-accent">
                          {ann.type}
                        </span>
                        <span className="text-[9px] text-white/20 font-mono flex items-center gap-1">
                          <Clock size={8} />{new Date(ann.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="text-xs font-semibold text-white/90 mb-1.5 group-hover:text-white">{ann.title}</h4>
                      <p className="text-[11px] text-white/40 leading-relaxed line-clamp-2">{ann.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </RevealCard>
        </div>

      </div>
    </div>
  )
}
