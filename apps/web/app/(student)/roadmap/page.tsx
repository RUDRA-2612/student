'use client'

import { useState } from 'react'
import { api } from '@/lib/trpc/react'
import { 
  Zap, 
  Calendar, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  AlertCircle
} from 'lucide-react'

interface RoadmapDay {
  day: number
  topic: string
  objectives: string[]
  resources: string[]
  hoursRequired: number
}

export default function StudyRoadmaps() {
  const [subject, setSubject] = useState('')
  const [days, setDays] = useState(30)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Streaming state
  const [roadmapDays, setRoadmapDays] = useState<RoadmapDay[] | null>(null)
  const [rawProgress, setRawProgress] = useState('')

  // tRPC query to fetch generated roadmaps history
  const utils = api.useUtils()
  const { data: subjects } = api.subjects.list.useQuery({ isActive: true })
  const { data: savedHistory, isLoading: historyLoading } = api.student.myRoadmaps.useQuery()

  // Selected saved roadmap state
  const [selectedRoadmap, setSelectedRoadmap] = useState<any | null>(null)
  
  // Track checked objectives locally in state
  const [checkedObjectives, setCheckedObjectives] = useState<Record<string, boolean>>({})

  const toggleObjective = (key: string) => {
    setCheckedObjectives(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!subject || !days) return

    setIsSubmitting(true)
    setError(null)
    setRoadmapDays(null)
    setRawProgress('')
    setSelectedRoadmap(null)

    try {
      const response = await fetch('/api/ai/roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, days: Number(days) }),
      })

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Hourly rate limit exceeded (Max 10 AI requests per hour).')
        }
        throw new Error('Failed to generate study roadmap. Please verify key bindings.')
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let accumulatedText = ''

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value, { stream: true })
          
          const lines = chunk.split('\n')
          for (const line of lines) {
            if (line.startsWith('0:')) {
              try {
                const textVal = JSON.parse(line.substring(2))
                accumulatedText += textVal
                setRawProgress(accumulatedText)
              } catch {}
            } else if (!line.includes(':')) {
              accumulatedText += line
              setRawProgress(accumulatedText)
            }
          }
        }
      }

      // Try parsing final payload
      try {
        const startIdx = accumulatedText.indexOf('[')
        const endIdx = accumulatedText.lastIndexOf(']')
        if (startIdx !== -1 && endIdx !== -1) {
          const cleanJson = accumulatedText.substring(startIdx, endIdx + 1)
          const parsed = JSON.parse(cleanJson)
          setRoadmapDays(parsed)
        } else {
          const parsed = JSON.parse(accumulatedText)
          setRoadmapDays(parsed)
        }
      } catch (err) {
        console.error('Failed parsing study roadmap json:', accumulatedText, err)
        throw new Error('AI engine returned invalid payload format. Please retry.')
      }

      // Invalidate history queries to list new item
      utils.student.myRoadmaps.invalidate()
      utils.student.dashboardStats.invalidate()

    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-10">
      {/* Header Profile */}
      <div className="space-y-2">
        <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">AI Study Roadmaps</h1>
        <p className="text-white/40 text-sm font-light">
          Generate a day-by-day structured syllabus review calendar mapped precisely to your exam deadline.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Form Panel */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-bg-surface border border-white/[0.06] rounded-xl p-6 space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-white/[0.06]">
              <Calendar size={18} className="text-accent" />
              <h2 className="font-display font-semibold text-sm uppercase tracking-wider">Configure Calendar</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-white/50 uppercase tracking-wide mb-2">Subject Scope</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-2.5 bg-bg-input border border-white/[0.08] focus:border-accent/40 rounded-lg text-sm text-white focus:outline-none cursor-pointer"
                  required
                >
                  <option value="">Select a Subject...</option>
                  {subjects?.map((sub) => (
                    <option key={sub.id} value={sub.name}>{sub.name} ({sub.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/50 uppercase tracking-wide mb-2 flex justify-between">
                  <span>Preparation Timeline</span>
                  <span className="text-accent font-bold">{days} Days</span>
                </label>
                <input
                  type="range"
                  min="7"
                  max="90"
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent"
                />
                <div className="flex justify-between text-[10px] text-white/30 pt-1 font-mono">
                  <span>7 Days</span>
                  <span>45 Days</span>
                  <span>90 Days</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !subject}
                className="w-full py-3 bg-accent hover:bg-accent-hover disabled:bg-accent/40 text-white font-semibold rounded-lg text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-accent/15"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Generating Roadmap...
                  </>
                ) : (
                  <>
                    <Zap size={16} className="text-brand-amber" /> Create study Roadmap
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Output Panel */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Active generation details */}
          {(isSubmitting || roadmapDays || error) && (
            <div className="bg-bg-surface border border-white/[0.06] rounded-xl p-6 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
                <h3 className="font-display font-bold text-base">Active Study Plan</h3>
                {isSubmitting && (
                  <span className="flex items-center gap-1.5 text-xs text-brand-mint font-semibold animate-pulse">
                    <Zap size={12} className="animate-spin" /> Streaming response...
                  </span>
                )}
              </div>

              {error && (
                <div className="p-4 bg-brand-coral/10 border border-brand-coral/20 rounded-xl flex items-start gap-3 text-sm text-brand-coral">
                  <AlertCircle className="shrink-0 mt-0.5" size={16} />
                  <div>
                    <p className="font-semibold">Generation Failed</p>
                    <p className="text-xs text-brand-coral/80 mt-1">{error}</p>
                  </div>
                </div>
              )}

              {isSubmitting && !roadmapDays && (
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-bg-base/40 border border-white/[0.04]">
                    <p className="text-xs font-mono text-white/50 break-all leading-relaxed line-clamp-12">
                      {rawProgress || 'Initializing study syllabus templates...'}
                    </p>
                  </div>
                </div>
              )}

              {roadmapDays && (
                <div className="space-y-8 relative pl-6 before:absolute before:top-2 before:bottom-2 before:left-2 before:w-0.5 before:bg-white/[0.06]">
                  {roadmapDays.map((dayItem) => (
                    <div key={dayItem.day} className="relative space-y-3">
                      {/* Timeline node */}
                      <span className="absolute -left-6 top-1.5 w-3.5 h-3.5 rounded-full bg-accent border-2 border-bg-surface flex items-center justify-center" />
                      
                      <div className="p-5 rounded-xl bg-bg-base/30 border border-white/[0.04] space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.04] pb-3">
                          <h4 className="font-display font-bold text-sm text-white">Day {dayItem.day} • {dayItem.topic}</h4>
                          <span className="text-[10px] font-semibold text-brand-amber bg-brand-amber/10 px-2 py-0.5 rounded flex items-center gap-1 border border-brand-amber/10">
                            <Clock size={10} /> {dayItem.hoursRequired} Hours
                          </span>
                        </div>

                        {/* Objectives Checklist */}
                        <div className="space-y-2">
                          <p className="text-[10px] uppercase tracking-wider font-semibold text-white/40">Syllabus Objectives</p>
                          <div className="space-y-1.5">
                            {dayItem.objectives.map((obj, oIdx) => {
                              const key = `roadmap-active-d${dayItem.day}-o${oIdx}`
                              const checked = !!checkedObjectives[key]
                              return (
                                <button
                                  key={oIdx}
                                  onClick={() => toggleObjective(key)}
                                  className="w-full flex items-start gap-2.5 text-xs text-left text-white/70 hover:text-white transition group py-0.5"
                                >
                                  <CheckCircle2 size={14} className={`shrink-0 mt-0.5 transition-colors ${checked ? 'text-brand-mint' : 'text-white/20 group-hover:text-white/40'}`} />
                                  <span className={checked ? 'line-through text-white/30 font-light' : 'font-light'}>{obj}</span>
                                </button>
                              )
                            })}
                          </div>
                        </div>

                        {/* Resources List */}
                        {dayItem.resources && dayItem.resources.length > 0 && (
                          <div className="space-y-1 pt-2 border-t border-white/[0.03]">
                            <p className="text-[10px] uppercase tracking-wider font-semibold text-white/40">Suggested Materials</p>
                            <ul className="list-disc list-inside text-xs text-white/50 space-y-1 font-light pl-1">
                              {dayItem.resources.map((res, rIdx) => (
                                <li key={rIdx}>{res}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* History Panel */}
          <div className="bg-bg-surface border border-white/[0.06] rounded-xl p-6 space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-white/[0.06]">
              <Clock size={16} className="text-white/40" />
              <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-white/60">Study History</h3>
            </div>

            {historyLoading ? (
              <div className="space-y-3">
                <div className="h-12 bg-white/5 rounded-lg animate-pulse" />
                <div className="h-12 bg-white/5 rounded-lg animate-pulse" />
              </div>
            ) : !savedHistory || savedHistory.length === 0 ? (
              <div className="text-center py-6 text-xs text-white/30">
                <Calendar size={24} className="mx-auto opacity-30 mb-2" />
                No custom study schedules generated yet. Make one above.
              </div>
            ) : (
              <div className="space-y-3">
                {savedHistory.map((item) => {
                  const isExpanded = selectedRoadmap?.id === item.id
                  const contentArray = item.content as any[]

                  return (
                    <div key={item.id} className="border border-white/[0.04] bg-bg-base/30 rounded-lg overflow-hidden transition">
                      <button
                        onClick={() => setSelectedRoadmap(isExpanded ? null : item)}
                        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-white/[0.02] transition"
                      >
                        <div className="space-y-1">
                          <h4 className="font-bold text-xs text-white/90">{item.subject} Study Plan</h4>
                          <p className="text-[10px] text-white/40">{new Date(item.createdAt).toLocaleString()} • {item.days} Day Schedule</p>
                        </div>
                        {isExpanded ? <ChevronUp size={16} className="text-white/40" /> : <ChevronDown size={16} className="text-white/40" />}
                      </button>

                      {isExpanded && (
                        <div className="px-4 pb-4 border-t border-white/[0.04] pt-4 space-y-6 bg-bg-surface/50 max-h-[500px] overflow-y-auto">
                          {contentArray.map((dayItem: RoadmapDay, dayIdx: number) => (
                            <div key={dayIdx} className="p-4 rounded-lg bg-bg-base/20 border border-white/[0.04] space-y-3 text-xs">
                              <div className="flex items-center justify-between pb-2 border-b border-white/[0.04]">
                                <span className="font-semibold text-accent">Day {dayItem.day} • {dayItem.topic}</span>
                                <span className="text-brand-amber bg-brand-amber/5 px-2 py-0.5 rounded border border-brand-amber/10 font-bold">{dayItem.hoursRequired} Hours</span>
                              </div>
                              <div className="space-y-1.5">
                                {dayItem.objectives.map((obj, objIdx) => {
                                  const key = `roadmap-${item.id}-d${dayItem.day}-o${objIdx}`
                                  const checked = !!checkedObjectives[key]
                                  return (
                                    <button
                                      key={objIdx}
                                      onClick={() => toggleObjective(key)}
                                      className="w-full flex items-start gap-2 text-left text-white/70 hover:text-white py-0.5"
                                    >
                                      <CheckCircle2 size={13} className={`shrink-0 mt-0.5 ${checked ? 'text-brand-mint' : 'text-white/20'}`} />
                                      <span className={checked ? 'line-through text-white/30' : ''}>{obj}</span>
                                    </button>
                                  )
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
