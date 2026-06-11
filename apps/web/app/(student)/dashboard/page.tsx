'use client'

import React, { useRef, useState } from 'react'
import { useSession } from 'next-auth/react'
import { api } from '@/lib/trpc/react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  BookOpen, 
  Map, 
  Bookmark, 
  Clock, 
  Bell, 
  ArrowRight,
  Send,
  Library,
  Compass
} from 'lucide-react'

// --- Custom Effects ---

const NoiseOverlay = () => (
  <div 
    className="pointer-events-none fixed inset-0 z-50 opacity-[0.03] mix-blend-overlay"
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
    }}
  />
)

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
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-500"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(251, 146, 60, 0.08), transparent 40%)`,
        }}
      />
      {children}
    </div>
  )
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 20 } }
}

export default function StudentDashboard() {
  const { data: session } = useSession()
  const name = session?.user?.name || 'Scholar'

  const { data: stats, isLoading: statsLoading } = api.student.dashboardStats.useQuery()
  const { data: subjects, isLoading: subjectsLoading } = api.subjects.list.useQuery({ isActive: true })
  const { data: announcements } = api.announcements.list.useQuery()

  return (
    <div className="min-h-full w-full bg-[#050505] text-white selection:bg-amber-500/30">
      <NoiseOverlay />
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="max-w-6xl mx-auto space-y-6 relative z-10 p-6 md:p-8"
      >
        {/* Top Banner (Full width) */}
        <SpotlightCard className="p-8 md:p-12">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-amber-500/10 via-rose-500/5 to-transparent blur-[100px] rounded-full pointer-events-none transform translate-x-1/3 -translate-y-1/3" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500/90 text-xs font-bold uppercase tracking-widest shadow-sm">
                <Library size={12} />
                Student Portal Active
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-light tracking-tight text-white">
                Welcome back, <strong className="font-serif italic font-medium">{name}</strong>
              </h1>
              <p className="text-slate-400 text-lg md:text-xl max-w-xl font-light leading-relaxed">
                Your curated academic sanctuary. Analyze past years paper patterns for <strong className="text-slate-200 font-medium">college exams</strong> instantly.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/curriculum"
                className="px-6 py-4 rounded-full bg-white/5 hover:bg-white/10 text-white font-medium border border-white/10 transition-colors flex items-center justify-center gap-2"
              >
                <Compass size={18} /> Curriculum
              </Link>
              <Link
                href="/roadmap"
                className="group px-6 py-4 rounded-full font-medium text-white overflow-hidden relative flex items-center justify-center gap-2"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-amber-600 to-rose-600 transition-transform duration-500 group-hover:scale-105" />
                <span className="relative z-10 flex items-center gap-2">
                  <Map size={18} /> Study Roadmap
                </span>
              </Link>
            </div>
          </div>
        </SpotlightCard>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Stats Column (Span 4) */}
          <motion.div variants={itemVariants} className="md:col-span-4 flex flex-col gap-6">
            {[
              { label: 'Bookmarks', value: stats?.bookmarksCount, href: '/papers', icon: Bookmark, gradient: 'from-amber-500/20 to-orange-500/20', text: 'text-amber-500' },
              { label: 'Study Roadmaps', value: stats?.roadmapsCount, href: '/roadmap', icon: Map, gradient: 'from-orange-500/20 to-rose-500/20', text: 'text-orange-500' },
              { label: 'Open Requests', value: stats?.requestsCount, href: '/requests', icon: Send, gradient: 'from-rose-500/20 to-pink-600/20', text: 'text-rose-500' }
            ].map((stat, i) => (
              <Link key={stat.label} href={stat.href} className="flex-1 group outline-none">
                <SpotlightCard className="h-full p-8 flex flex-col justify-between group-hover:border-white/10">
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.gradient} blur-3xl rounded-full opacity-40 group-hover:opacity-80 transition-opacity duration-500`} />
                  <div className="relative z-10 flex items-start justify-between mb-6">
                    <span className="text-xs font-bold text-slate-500 tracking-widest uppercase">{stat.label}</span>
                    <div className={`p-2.5 rounded-full bg-white/5 ${stat.text} transition-transform duration-500 group-hover:scale-110`}>
                      <stat.icon size={18} strokeWidth={2} />
                    </div>
                  </div>
                  {statsLoading ? (
                    <div className="h-10 w-16 bg-white/5 rounded-lg animate-pulse" />
                  ) : (
                    <span className="relative z-10 text-4xl font-serif italic text-white">
                      {stat.value ?? 0}
                    </span>
                  )}
                </SpotlightCard>
              </Link>
            ))}
          </motion.div>

          {/* Subjects & Announcements (Span 8) */}
          <motion.div variants={itemVariants} className="md:col-span-8 flex flex-col gap-6">
            
            {/* Subjects Bento Box */}
            <SpotlightCard className="flex-1 p-8 md:p-10 flex flex-col">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(251,146,60,0.05)_0%,transparent_60%)] pointer-events-none" />
              <div className="relative z-10 flex items-center justify-between mb-8">
                <h2 className="font-display text-2xl font-medium text-white flex items-center gap-3">
                  <BookOpen className="text-amber-500" size={24} strokeWidth={1.5} /> Subject Catalog
                </h2>
                <Link href="/papers" className="text-sm font-medium text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 group">
                  Browse All <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {subjectsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="h-32 bg-white/5 rounded-2xl animate-pulse" />
                  <div className="h-32 bg-white/5 rounded-2xl animate-pulse" />
                </div>
              ) : !subjects || subjects.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white/[0.02] rounded-2xl border border-white/5 border-dashed">
                  <BookOpen className="text-slate-600 mb-4" size={32} />
                  <p className="text-slate-400 text-sm">No active subjects found. Contact administration to seed syllabus modules.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
                  {subjects.slice(0, 4).map((sub) => (
                    <Link 
                      key={sub.id}
                      href={`/papers?subjectId=${sub.id}`}
                      className="group p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <span className="text-[10px] font-bold text-amber-500/90 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full uppercase tracking-widest mb-4 inline-block">
                          {sub.category}
                        </span>
                        <h3 className="font-display font-medium text-lg text-slate-200 group-hover:text-white transition-colors">{sub.name}</h3>
                        <p className="text-xs text-slate-500 mt-2 font-light line-clamp-2 leading-relaxed">{sub.description || 'Syllabus guidelines and curated papers.'}</p>
                      </div>
                      <div className="mt-5 text-[11px] font-mono text-slate-600 font-medium tracking-wide">
                        {sub.code}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </SpotlightCard>

            {/* Announcements Bento Box */}
            <SpotlightCard className="h-[300px] p-8 md:p-10 flex flex-col">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(225,29,72,0.05)_0%,transparent_60%)] pointer-events-none" />
              <div className="relative z-10 flex items-center gap-3 mb-6">
                <Bell size={24} className="text-rose-500" strokeWidth={1.5} />
                <h2 className="font-display text-2xl font-medium text-white">Announcements</h2>
              </div>

              <div className="relative z-10 flex-1 overflow-y-auto pr-4 space-y-3 custom-scrollbar">
                {!announcements || announcements.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 text-sm">
                    <Bell size={24} className="opacity-30 mb-3 stroke-1" />
                    No active announcements
                  </div>
                ) : (
                  announcements.map((ann) => {
                    const badgeColor = 
                      ann.type === 'IMPORTANT' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 
                      ann.type === 'WARNING' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
                      ann.type === 'MAINTENANCE' ? 'bg-slate-500/10 text-slate-400 border-slate-500/20' : 
                      'bg-white/5 text-slate-400 border-white/10'

                    return (
                      <div key={ann.id} className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
                        <div className="flex items-center justify-between mb-3">
                          <span className={`px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-widest ${badgeColor}`}>
                            {ann.type}
                          </span>
                          <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5">
                            <Clock size={12} />
                            {new Date(ann.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h4 className="font-medium text-slate-200 mb-1.5">{ann.title}</h4>
                        <p className="text-sm text-slate-400 font-light leading-relaxed whitespace-pre-wrap">{ann.message}</p>
                      </div>
                    )
                  })
                )}
              </div>
            </SpotlightCard>

          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
