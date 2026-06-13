'use client'

import { useState } from 'react'
import { api } from '@/lib/trpc/react'
import Link from 'next/link'
import { 
  BookOpen, 
  Search, 
  Layers, 
  Map, 
  Lock, 
  ArrowRight,
  GraduationCap
} from 'lucide-react'

export default function GuestDashboard() {
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch public subjects list, semesters list, and roadmaps
  const { data: subjects, isLoading: subjectsLoading } = api.subjects.list.useQuery({ isActive: true })
  const { data: semesters } = api.semesters.list.useQuery({ isActiveOnly: true })
  const { data: roadmaps } = api.roadmaps.list.useQuery({ isPublishedOnly: true })

  const filteredSubjects = subjects?.filter(sub => 
    sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sub.code.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[hsl(20,8%,5%)] text-[#f5ede6] p-6 md:p-10 space-y-10">
      
      {/* Header Banner */}
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/[0.06]">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-accent uppercase tracking-wider">
            <GraduationCap size={16} /> Guest Portal
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight">University Academic Directory</h1>
          <p className="text-white/40 text-sm max-w-lg font-light">
            Explore public syllabi, semester divisions, branches, and milestones. Sign up to unlock full interactive student features.
          </p>
        </div>
        <div className="flex gap-4">
          <Link
            href="/login"
            className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-semibold transition"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="px-5 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-semibold transition flex items-center gap-1.5"
          >
            Create Account <ArrowRight size={12} />
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Public Syllabus & Subjects Browser */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-bg-surface border border-white/[0.06] rounded-2xl p-6 space-y-6">
            
            {/* Search and Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <BookOpen size={18} className="text-accent" />
                <h2 className="font-display font-semibold text-sm uppercase tracking-wider text-white/80">Public Syllabus Index</h2>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={13} />
                <input
                  type="text"
                  placeholder="Search subjects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-4 py-2 bg-bg-input border border-white/[0.08] focus:border-accent/40 rounded-xl text-xs text-white placeholder:text-white/20 focus:outline-none"
                />
              </div>
            </div>

            {/* List */}
            {subjectsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-white/5 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : !filteredSubjects || filteredSubjects.length === 0 ? (
              <p className="text-xs text-white/30 text-center py-8">No subjects found matching your query.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredSubjects.map((sub) => (
                  <div key={sub.id} className="p-4 rounded-xl border border-white/[0.04] bg-bg-base/20 flex flex-col justify-between gap-3 hover:border-white/[0.08] transition duration-300">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-semibold text-accent/80 bg-accent/10 px-2 py-0.5 rounded-full border border-accent/20 uppercase">
                          {sub.category}
                        </span>
                        <span className="text-[9px] font-mono text-white/40">{sub.code}</span>
                      </div>
                      <h4 className="font-display font-bold text-sm text-white/95 mt-1">{sub.name}</h4>
                      <p className="text-xs text-white/45 font-light leading-relaxed line-clamp-2">{sub.description || 'No description provided.'}</p>
                    </div>

                    <div className="pt-2 flex items-center justify-between text-[10px] border-t border-white/[0.03] text-white/30">
                      <span>{sub.credits} Credits</span>
                      {sub.semester && <span>{sub.semester.name}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Semesters & Roadmaps Preview */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Active Semesters List */}
          <div className="bg-bg-surface border border-white/[0.06] rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-white/[0.06]">
              <Layers size={16} className="text-accent" />
              <h3 className="font-display font-semibold text-xs uppercase tracking-wider">Semester Timelines</h3>
            </div>
            
            <div className="space-y-2.5">
              {semesters?.map((sem) => (
                <div key={sem.id} className="flex justify-between items-center text-xs p-2.5 rounded bg-bg-base/30 border border-white/[0.03]">
                  <span className="font-medium text-white/80">{sem.name}</span>
                  <span className="text-[9px] text-white/30 font-mono">{sem.academicYear}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Roadmaps Preview */}
          <div className="bg-bg-surface border border-white/[0.06] rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-white/[0.06]">
              <Map size={16} className="text-accent" />
              <h3 className="font-display font-semibold text-xs uppercase tracking-wider">Learning Paths</h3>
            </div>

            <div className="space-y-3">
              {roadmaps?.slice(0, 3).map((r) => (
                <div key={r.id} className="p-3.5 rounded-xl bg-bg-base/30 border border-white/[0.03] space-y-1">
                  <span className="text-[9px] font-semibold text-accent/80">{r.category}</span>
                  <h4 className="font-display font-bold text-xs text-white/95">{r.title}</h4>
                  <p className="text-[10px] text-white/40 line-clamp-2 leading-relaxed font-light">{r.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Locked Features Widget */}
          <div className="p-6 rounded-2xl border border-brand-amber/15 bg-brand-amber/5 space-y-3 text-center">
            <Lock className="mx-auto text-brand-amber animate-pulse-glow" size={24} />
            <h4 className="font-display font-bold text-white text-sm">Interactive Features Locked</h4>
            <p className="text-[10px] text-white/50 leading-relaxed font-light">
              Practice question banks, personalized study roadmaps, placements prep sheets, and AI Tutor require a student login.
            </p>
            <Link
              href="/signup"
              className="w-full btn-primary py-2 text-xs flex items-center justify-center gap-1.5"
            >
              Sign Up For Student Access
            </Link>
          </div>

        </div>

      </div>
    </div>
  )
}
