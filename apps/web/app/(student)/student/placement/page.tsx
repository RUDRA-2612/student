'use client'

import { useState } from 'react'
import { api } from '@/lib/trpc/react'
import { GraduationCap, ExternalLink, FolderKanban } from 'lucide-react'

export default function StudentPlacement() {
  const [activeTab, setActiveTab] = useState<string>('ALL')

  const { data: resources, isLoading } = api.placement.list.useQuery(
    activeTab !== 'ALL' ? { category: activeTab as any } : undefined
  )

  const categories = [
    { value: 'ALL', label: 'All Resources' },
    { value: 'DSA_SHEET', label: 'DSA Sheets' },
    { value: 'APTITUDE', label: 'Aptitude Prep' },
    { value: 'INTERVIEW_Q', label: 'Interview Questions' },
    { value: 'RESUME', label: 'Resume Guide' },
    { value: 'HR', label: 'HR Prep' },
    { value: 'CODING_CHALLENGE', label: 'Challenges' }
  ]

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="space-y-2">
        <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-accent/80">Careers</span>
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-white">Placement Preparation Hub</h1>
        <p className="text-white/40 text-sm font-light">
          Access curated materials, DSA practice sheets, and interview guides designed to get you hired.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-white/[0.06] -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setActiveTab(cat.value)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${
              activeTab === cat.value
                ? 'bg-accent/10 border-accent/20 text-accent'
                : 'bg-white/5 border-white/10 text-white/40 hover:text-white/60 hover:bg-white/[0.08]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="bg-bg-surface border border-white/[0.06] rounded-2xl p-6 space-y-6">
        <div className="flex items-center gap-2 pb-4 border-b border-white/[0.06]">
          <FolderKanban size={16} className="text-white/40" />
          <h2 className="font-display font-semibold text-sm uppercase tracking-wider text-white/60">Preparation Materials</h2>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-white/5 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : !resources || resources.length === 0 ? (
          <div className="text-center py-12 text-xs text-white/30 space-y-2">
            <GraduationCap className="mx-auto opacity-35" size={32} />
            <p>No resources found in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resources.map((res) => (
              <div key={res.id} className="p-5 rounded-xl border border-white/[0.04] bg-bg-base/20 flex flex-col justify-between gap-4 hover:border-white/[0.08] transition duration-300">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-semibold text-accent/80 bg-accent/10 px-2 py-0.5 rounded-full border border-accent/20">
                      {res.category.replace('_', ' ')}
                    </span>
                  </div>
                  <h4 className="font-display font-bold text-sm text-white/95">{res.title}</h4>
                  {res.content && <p className="text-xs text-white/40 leading-relaxed font-light line-clamp-3">{res.content}</p>}
                </div>

                {res.url && (
                  <a
                    href={res.url}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-ghost py-2 text-xs flex items-center justify-center gap-1 w-full"
                  >
                    Start Preparing <ExternalLink size={12} />
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
