'use client'

import React from 'react'
import { useSession } from 'next-auth/react'
import { api } from '@/lib/trpc/react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { BookOpen, Map, Bookmark, Clock, Bell, ArrowRight, Send, Compass } from 'lucide-react'
import { NoiseOverlay } from '@/components/ui/noise-overlay'
import { SpotlightCard } from '@/components/ui/spotlight-card'

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: 'tween', ease: [0.25, 1, 0.5, 1], duration: 0.8 } }
}

export default function StudentDashboard() {
  const { data: session } = useSession()
  const name = session?.user?.name || 'Scholar'

  const { data: stats, isLoading: statsLoading } = api.student.dashboardStats.useQuery()
  const { data: subjects, isLoading: subjectsLoading } = api.subjects.list.useQuery({ isActive: true })
  const { data: announcements } = api.announcements.list.useQuery()

  return (
    <div className="min-h-full w-full bg-black text-white selection:bg-white/20">
      <NoiseOverlay />
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="max-w-6xl mx-auto space-y-6 relative z-10 p-6 md:p-10"
      >
        {/* Minimal Banner */}
        <SpotlightCard className="p-8 md:p-10 bg-white/[0.01]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-4">
              <h1 className="font-display text-3xl md:text-4xl font-light tracking-tight text-white/90">
                Welcome back, <span className="font-serif italic">{name}</span>
              </h1>
              <p className="text-white/40 text-base max-w-xl font-light leading-relaxed">
                Your academic sanctuary. Analyze past years paper patterns for college exams instantly.
              </p>
            </div>

            <div className="flex gap-4">
              <Link href="/curriculum" className="px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 text-white/80 font-medium border border-white/5 transition-colors flex items-center gap-2 text-sm">
                <Compass size={16} /> Curriculum
              </Link>
              <Link href="/roadmap" className="px-6 py-3 rounded-full bg-white hover:bg-white/90 text-black font-medium transition-colors flex items-center gap-2 text-sm">
                <Map size={16} /> Study Roadmap
              </Link>
            </div>
          </div>
        </SpotlightCard>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Stats Column (Span 4) */}
          <motion.div variants={itemVariants} className="md:col-span-4 flex flex-col gap-6">
            {[
              { label: 'Bookmarks', value: stats?.bookmarksCount, href: '/papers', icon: Bookmark },
              { label: 'Roadmaps', value: stats?.roadmapsCount, href: '/roadmap', icon: Map },
              { label: 'Open Requests', value: stats?.requestsCount, href: '/requests', icon: Send }
            ].map((stat) => (
              <Link key={stat.label} href={stat.href} className="flex-1 group outline-none">
                <SpotlightCard className="h-full p-6 bg-white/[0.01] group-hover:bg-white/[0.03]">
                  <div className="flex items-center justify-between mb-8">
                    <span className="text-[10px] font-medium text-white/40 uppercase tracking-[0.2em]">{stat.label}</span>
                    <stat.icon size={16} className="text-white/20 group-hover:text-white/60 transition-colors" />
                  </div>
                  {statsLoading ? (
                    <div className="h-8 w-12 bg-white/5 rounded animate-pulse" />
                  ) : (
                    <span className="text-3xl font-serif italic text-white/90">
                      {stat.value ?? 0}
                    </span>
                  )}
                </SpotlightCard>
              </Link>
            ))}
          </motion.div>

          {/* Subjects & Announcements (Span 8) */}
          <motion.div variants={itemVariants} className="md:col-span-8 flex flex-col gap-6">
            
            {/* Subjects Catalog */}
            <SpotlightCard className="flex-1 p-8 bg-white/[0.01] flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <h2 className="font-display text-xl font-medium text-white/90 flex items-center gap-3">
                  <BookOpen size={20} className="text-white/40" /> Subject Catalog
                </h2>
                <Link href="/papers" className="text-xs font-medium text-white/40 hover:text-white flex items-center gap-1 group transition-colors">
                  Browse All <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {subjectsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="h-24 bg-white/5 rounded-xl animate-pulse" />
                  <div className="h-24 bg-white/5 rounded-xl animate-pulse" />
                </div>
              ) : !subjects?.length ? (
                <div className="flex-1 flex items-center justify-center text-white/30 text-sm">
                  No active subjects found.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {subjects.slice(0, 4).map((sub) => (
                    <Link key={sub.id} href={`/papers?subjectId=${sub.id}`} className="group p-5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-colors flex flex-col justify-between">
                      <div>
                        <h3 className="font-display font-medium text-white/80 group-hover:text-white transition-colors">{sub.name}</h3>
                        <p className="text-xs text-white/40 mt-1 line-clamp-2">{sub.description || 'Curated papers and guidelines.'}</p>
                      </div>
                      <div className="mt-4 text-[10px] font-mono text-white/20 tracking-wider">
                        {sub.code}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </SpotlightCard>

            {/* Announcements */}
            <SpotlightCard className="h-[250px] p-8 bg-white/[0.01] flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                <Bell size={20} className="text-white/40" />
                <h2 className="font-display text-xl font-medium text-white/90">Announcements</h2>
              </div>
              <div className="flex-1 overflow-y-auto pr-4 space-y-3 custom-scrollbar">
                {!announcements?.length ? (
                  <div className="h-full flex items-center justify-center text-white/30 text-sm">
                    No active announcements
                  </div>
                ) : (
                  announcements.map((ann) => (
                    <div key={ann.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[9px] font-medium uppercase tracking-[0.2em] text-white/40">{ann.type}</span>
                        <span className="text-[10px] text-white/30 flex items-center gap-1"><Clock size={10} />{new Date(ann.createdAt).toLocaleDateString()}</span>
                      </div>
                      <h4 className="font-medium text-white/80 text-sm mb-1">{ann.title}</h4>
                      <p className="text-xs text-white/40 leading-relaxed whitespace-pre-wrap">{ann.message}</p>
                    </div>
                  ))
                )}
              </div>
            </SpotlightCard>

          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
