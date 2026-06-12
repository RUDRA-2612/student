'use client'

import React from 'react'
import { useSession } from 'next-auth/react'
import { api } from '@/lib/trpc/react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { BookOpen, Map, Bookmark, Clock, Bell, ArrowUpRight, Send, Compass, ChevronRight } from 'lucide-react'
import { TiltCard } from '@/components/ui/tilt-card'

/* ───── Reveal Card ───── */
function RevealCard({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 1, delay, ease: [0.25, 1, 0.5, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export default function StudentDashboard() {
  const { data: session } = useSession()
  const name = session?.user?.name || 'Scholar'
  const firstName = name.split(' ')[0]

  const { data: stats, isLoading: statsLoading } = api.student.dashboardStats.useQuery()
  const { data: subjects, isLoading: subjectsLoading } = api.subjects.list.useQuery({ isActive: true })
  const { data: announcements } = api.announcements.list.useQuery()

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="w-full text-white space-y-6">
      {/* ─── Header: Oversized Greeting ─── */}
      <RevealCard>
        <div className="flex items-end justify-between border-b border-white/[0.04] pb-6 mb-2">
          <div>
            <p className="text-[10px] font-medium tracking-[0.3em] uppercase text-white/30 mb-2">{greeting}</p>
            <h1 className="text-4xl md:text-6xl font-light tracking-[-0.03em]">
              {firstName}<span className="italic text-white/35 font-serif" style={{ fontFamily: 'var(--font-serif), Georgia, serif' }}>.</span>
            </h1>
          </div>
          <div className="text-right hidden md:block">
            <p className="text-[10px] font-mono tracking-wider uppercase text-white/20">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>
      </RevealCard>

      {/* ─── Stats Grid: Individual 3D TiltCards ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Bookmarks', value: stats?.bookmarksCount, icon: Bookmark, color: 'text-amber-400' },
          { label: 'Study Roadmaps', value: stats?.roadmapsCount, icon: Map, color: 'text-emerald-400' },
          { label: 'Requests File', value: stats?.requestsCount, icon: Send, color: 'text-purple-400' },
        ].map((stat, i) => (
          <RevealCard key={stat.label} delay={0.1 + i * 0.05}>
            <TiltCard 
              maxTilt={8}
              glareOpacity={0.08}
              className="rounded-2xl border border-white/[0.06] bg-[#050505] p-6 flex flex-col justify-between h-40 cursor-default hover:border-white/[0.12] transition-colors"
            >
              <div className="flex items-center justify-between" style={{ transform: 'translateZ(20px)' }}>
                <stat.icon size={16} className="text-white/20" />
                <span className="text-[9px] font-mono tracking-widest uppercase text-white/30">{stat.label}</span>
              </div>
              
              <div className="mt-4" style={{ transform: 'translateZ(30px)' }}>
                {statsLoading ? (
                  <div className="h-10 w-16 bg-white/5 rounded animate-pulse" />
                ) : (
                  <span className="text-5xl font-light font-serif text-white/90" style={{ fontFamily: 'var(--font-serif), Georgia, serif' }}>
                    {stat.value ?? 0}
                  </span>
                )}
              </div>
            </TiltCard>
          </RevealCard>
        ))}
      </div>

      {/* ─── Main Content: Asymmetric 2-column ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left: Subjects List */}
        <div className="lg:col-span-7 space-y-6">
          <RevealCard delay={0.25}>
            <div className="p-6 rounded-2xl border border-white/[0.06] bg-[#050505]">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-sm font-semibold tracking-[0.15em] uppercase text-white/70 flex items-center gap-2">
                  <BookOpen size={14} className="text-white/30" />
                  Syllabus Subjects
                </h2>
                <Link href="/papers" className="text-[10px] font-semibold tracking-[0.15em] uppercase text-white/40 hover:text-white transition-colors flex items-center gap-1 group">
                  Catalog <ArrowUpRight size={10} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
              </div>

              <div className="border-t border-white/[0.04]">
                {subjectsLoading ? (
                  <div className="space-y-0">
                    {[1,2,3,4].map(i => <div key={i} className="h-16 border-b border-white/[0.04] animate-pulse bg-white/[0.01]" />)}
                  </div>
                ) : !subjects?.length ? (
                  <div className="py-16 text-center text-white/30 text-xs">No active subjects matching college criteria</div>
                ) : (
                  subjects.slice(0, 5).map((sub, i) => (
                    <Link
                      key={sub.id}
                      href={`/papers?subjectId=${sub.id}`}
                      className="group flex items-center justify-between py-4 px-2 border-b border-white/[0.04] hover:bg-white/[0.01] transition-all"
                    >
                      <div className="flex items-center gap-5">
                        <span className="text-[9px] font-mono text-white/15 w-6">{String(i + 1).padStart(2, '0')}</span>
                        <div>
                          <h3 className="text-xs font-semibold text-white/80 group-hover:text-white transition-colors">{sub.name}</h3>
                          <p className="text-[10px] text-white/30 mt-0.5 line-clamp-1 max-w-md">{sub.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-[9px] font-mono text-white/20">{sub.code}</span>
                        <ChevronRight size={12} className="text-white/0 group-hover:text-white/40 transition-all -translate-x-2 group-hover:translate-x-0" />
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </RevealCard>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-5 space-y-6">
          {/* Quick Actions (3D Tilt Card Container) */}
          <RevealCard delay={0.3}>
            <TiltCard
              maxTilt={5}
              glareOpacity={0.06}
              className="p-6 rounded-2xl border border-white/[0.06] bg-[#050505] hover:border-white/[0.1] transition-colors"
            >
              <div style={{ transform: 'translateZ(15px)' }}>
                <p className="text-[9px] font-semibold tracking-[0.2em] uppercase text-white/30 mb-5">Quick Actions</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { href: '/curriculum', icon: Compass, label: 'Curriculum' },
                    { href: '/roadmap', icon: Map, label: 'Roadmap' },
                    { href: '/papers', icon: BookOpen, label: 'Papers' },
                    { href: '/requests', icon: Send, label: 'Requests' },
                  ].map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="group flex items-center gap-3 p-3.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.03] hover:border-white/[0.08] transition-all"
                    >
                      <item.icon size={14} className="text-white/30 group-hover:text-white/70 transition-colors" />
                      <span className="text-[11px] font-medium text-white/50 group-hover:text-white transition-colors">{item.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </TiltCard>
          </RevealCard>

          {/* Announcements */}
          <RevealCard delay={0.35}>
            <div className="p-6 rounded-2xl border border-white/[0.06] bg-[#050505]">
              <div className="flex items-center gap-2 mb-5">
                <Bell size={13} className="text-white/30" />
                <p className="text-[9px] font-semibold tracking-[0.2em] uppercase text-white/30">Academic Bulletins</p>
              </div>
              <div className="space-y-3 max-h-[260px] overflow-y-auto">
                {!announcements?.length ? (
                  <div className="py-8 text-center text-white/20 text-xs">No announcements at this time</div>
                ) : (
                  announcements.map((ann) => (
                    <div key={ann.id} className="p-4 rounded-xl bg-white/[0.01] border border-white/[0.03]">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[8px] font-medium tracking-[0.15em] uppercase text-white/40">{ann.type}</span>
                        <span className="text-[9px] text-white/20 font-mono flex items-center gap-1">
                          <Clock size={8} />{new Date(ann.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="text-xs font-semibold text-white/80 mb-1">{ann.title}</h4>
                      <p className="text-[10px] text-white/40 leading-relaxed line-clamp-2">{ann.message}</p>
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
