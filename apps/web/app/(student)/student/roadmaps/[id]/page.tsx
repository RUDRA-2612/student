'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { api } from '@/lib/trpc/react'
import { Map, ArrowLeft, CheckCircle2, Circle, Trophy } from 'lucide-react'
import Link from 'next/link'

export default function StudentRoadmapDetail() {
  const params = useParams()
  const roadmapId = params.id as string

  const { data: roadmap, isLoading } = api.roadmaps.byId.useQuery({ id: roadmapId })
  const [completedMilestones, setCompletedMilestones] = useState<string[]>([])

  // Load progress from localStorage
  useEffect(() => {
    if (roadmapId) {
      const saved = localStorage.getItem(`roadmap-progress-${roadmapId}`)
      if (saved) {
        try {
          setCompletedMilestones(JSON.parse(saved))
        } catch {}
      }
    }
  }, [roadmapId])

  const toggleMilestone = (milestoneId: string) => {
    let updated = [...completedMilestones]
    if (updated.includes(milestoneId)) {
      updated = updated.filter(id => id !== milestoneId)
    } else {
      updated.push(milestoneId)
    }
    setCompletedMilestones(updated)
    localStorage.setItem(`roadmap-progress-${roadmapId}`, JSON.stringify(updated))
  }

  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center text-white/30">
        Loading roadmap details...
      </div>
    )
  }

  if (!roadmap) {
    return (
      <div className="text-center py-12 text-xs text-white/30 space-y-4">
        <p>Roadmap not found.</p>
        <Link href="/roadmap" className="btn-primary">Back to Roadmaps</Link>
      </div>
    )
  }

  const progressPercent = roadmap.milestones.length > 0 
    ? Math.round((completedMilestones.length / roadmap.milestones.length) * 100) 
    : 0

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <Link href="/roadmap" className="flex items-center gap-1 text-xs text-white/40 hover:text-white transition">
        <ArrowLeft size={12} /> Back to Roadmaps
      </Link>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-accent/80">{roadmap.category}</span>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-white">{roadmap.title}</h1>
          <p className="text-white/40 text-sm font-light">{roadmap.description}</p>
        </div>

        {/* Progress Tracker Card */}
        <div className="bg-bg-surface border border-white/[0.06] rounded-2xl p-5 shrink-0 w-full md:w-56 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-white/60">
            <span>Progress</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden border border-white/[0.04]">
            <div className="bg-accent h-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
          </div>
          <p className="text-[10px] text-white/30 text-center font-mono">
            {completedMilestones.length} of {roadmap.milestones.length} milestones complete
          </p>
        </div>
      </div>

      {/* Milestones timeline */}
      <div className="bg-bg-surface border border-white/[0.06] rounded-2xl p-6 space-y-6">
        <div className="flex items-center gap-2 pb-4 border-b border-white/[0.06]">
          <Map size={16} className="text-white/40" />
          <h2 className="font-display font-semibold text-sm uppercase tracking-wider text-white/60">Learning Milestones</h2>
        </div>

        {roadmap.milestones.length === 0 ? (
          <p className="text-xs text-white/30 text-center py-6">No milestones defined for this roadmap yet.</p>
        ) : (
          <div className="space-y-6">
            {roadmap.milestones.map((m, idx) => {
              const isCompleted = completedMilestones.includes(m.id)
              return (
                <div 
                  key={m.id} 
                  className={`p-5 rounded-xl border flex items-start gap-4 transition duration-300 ${
                    isCompleted 
                      ? 'border-sage/10 bg-sage/5' 
                      : 'border-white/[0.04] bg-bg-base/20'
                  }`}
                >
                  <button 
                    onClick={() => toggleMilestone(m.id)}
                    className="mt-0.5 text-white/30 hover:text-accent transition shrink-0"
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="text-sage" size={20} />
                    ) : (
                      <Circle size={20} />
                    )}
                  </button>

                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono text-white/30">Step {idx + 1}</span>
                    <h4 className={`font-display font-bold text-sm transition ${isCompleted ? 'text-white/50 line-through' : 'text-white'}`}>
                      {m.title}
                    </h4>
                    <p className={`text-xs leading-relaxed font-light transition ${isCompleted ? 'text-white/30' : 'text-white/40'}`}>
                      {m.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {progressPercent === 100 && (
        <div className="p-6 rounded-2xl border border-brand-amber/15 bg-brand-amber/5 text-center space-y-2 animate-fade-in">
          <Trophy className="mx-auto text-brand-amber animate-float" size={32} />
          <h3 className="font-display font-bold text-white text-base">Congratulations!</h3>
          <p className="text-xs text-white/50">You have completed all milestones for this learning path.</p>
        </div>
      )}
    </div>
  )
}
