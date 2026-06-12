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
import { TiltCard } from '@/components/ui/tilt-card'

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

  // tRPC queries
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
        throw new Error('Failed to generate study roadmap.')
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

      // Invalidate queries
      utils.student.myRoadmaps.invalidate()
      utils.student.dashboardStats.invalidate()

    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="border-b border-white/[0.04] pb-6">
        <p className="text-[10px] font-mono tracking-[0.3em] uppercase text-white/30 mb-2">Workspace Assistant</p>
        <h1 className="text-4xl md:text-5xl font-light tracking-[-0.02em]">
          AI Study <span className="italic text-white/40 font-serif" style={{ fontFamily: 'var(--font-serif), Georgia, serif' }}>Roadmaps</span>
        </h1>
        <p className="text-white/40 text-xs font-light max-w-xl mt-3 leading-relaxed">
          Generate structured, custom day-by-day study calendars mapped directly to your examination dates.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Form Panel: 3D TiltCard */}
        <div className="lg:col-span-4 space-y-6">
          <TiltCard
            maxTilt={6}
            glareOpacity={0.06}
            className="bg-[#050505] border border-white/[0.06] rounded-2xl p-6 hover:border-white/[0.1] transition-colors"
          >
            <div className="space-y-6" style={{ transform: 'translateZ(15px)' }}>
              <div className="flex items-center gap-2 pb-4 border-b border-white/[0.06]">
                <Calendar size={15} className="text-white/40" />
                <h2 className="text-xs font-semibold uppercase tracking-wider text-white/70">Configuration</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-2">Target Subject</label>
                  <div className="relative">
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="appearance-none w-full px-4 py-2.5 bg-white/[0.02] border border-white/[0.06] rounded-xl text-xs text-white focus:outline-none cursor-pointer"
                      required
                    >
                      <option value="">Select a Subject...</option>
                      {subjects?.map((sub) => (
                        <option key={sub.id} value={sub.name}>{sub.name}</option>
                      ))}
                    </select>
                    <ChevronDown size={12} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-2 flex justify-between">
                    <span>Timeline Size</span>
                    <span className="text-white font-mono font-bold">{days} Days</span>
                  </label>
                  <input
                    type="range"
                    min="7"
                    max="90"
                    value={days}
                    onChange={(e) => setDays(Number(e.target.value))}
                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
                  />
                  <div className="flex justify-between text-[8px] text-white/20 pt-1 font-mono">
                    <span>7D</span>
                    <span>45D</span>
                    <span>90D</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !subject}
                  className="w-full py-3 bg-white text-black hover:bg-white/90 disabled:bg-white/30 disabled:text-black/50 font-bold rounded-xl text-xs uppercase tracking-wider transition flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      Drafting Plan...
                    </>
                  ) : (
                    <>
                      <Zap size={13} /> Create Roadmap
                    </>
                  )}
                </button>
              </form>
            </div>
          </TiltCard>
        </div>

        {/* Right Output Panel */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Active Generation Display */}
          {(isSubmitting || roadmapDays || error) && (
            <div className="bg-[#050505] border border-white/[0.06] rounded-2xl p-6 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.04]">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-white/70">Generated Schedule</h3>
                {isSubmitting && (
                  <span className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono animate-pulse">
                    <Zap size={10} className="animate-spin" /> STREAM ACTIVE
                  </span>
                )}
              </div>

              {error && (
                <div className="p-4 bg-red-500/[0.03] border border-red-500/20 rounded-xl flex items-start gap-3 text-xs text-red-400">
                  <AlertCircle className="shrink-0 mt-0.5" size={14} />
                  <div>
                    <p className="font-semibold">Generation Error</p>
                    <p className="text-red-400/80 mt-1">{error}</p>
                  </div>
                </div>
              )}

              {isSubmitting && !roadmapDays && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-white/[0.01] border border-white/[0.04]">
                    <p className="text-[10px] font-mono text-white/30 break-all leading-relaxed line-clamp-6">
                      {rawProgress || 'Initializing study syllabus templates...'}
                    </p>
                  </div>
                </div>
              )}

              {roadmapDays && (
                <div className="space-y-6 relative pl-5 before:absolute before:top-2 before:bottom-2 before:left-2.5 before:w-px before:bg-white/[0.06]">
                  {roadmapDays.map((dayItem) => (
                    <div key={dayItem.day} className="relative space-y-3">
                      {/* Timeline node dot */}
                      <span className="absolute -left-[23px] top-1.5 w-2 h-2 rounded-full bg-white border border-black flex items-center justify-center shadow-md shadow-white/25" />
                      
                      <div className="p-5 rounded-xl bg-white/[0.01] border border-white/[0.04] space-y-4 hover:border-white/[0.08] transition-colors">
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.04] pb-3">
                          <h4 className="text-xs font-semibold text-white/90">Day {dayItem.day} • {dayItem.topic}</h4>
                          <span className="text-[8px] font-mono font-bold text-white/40 bg-white/[0.04] px-2 py-0.5 rounded flex items-center gap-1 border border-white/[0.06]">
                            <Clock size={8} /> {dayItem.hoursRequired} Hrs Required
                          </span>
                        </div>

                        {/* Objectives Checklist */}
                        <div className="space-y-2">
                          <p className="text-[9px] uppercase tracking-wider font-semibold text-white/30 font-mono">Syllabus Focus</p>
                          <div className="space-y-1.5">
                            {dayItem.objectives.map((obj, oIdx) => {
                              const key = `roadmap-active-d${dayItem.day}-o${oIdx}`
                              const checked = !!checkedObjectives[key]
                              return (
                                <button
                                  key={oIdx}
                                  onClick={() => toggleObjective(key)}
                                  className="w-full flex items-start gap-2 text-[11px] text-left text-white/50 hover:text-white transition group py-0.5"
                                >
                                  <CheckCircle2 size={13} className={`shrink-0 mt-0.5 transition-colors ${checked ? 'text-white' : 'text-white/10 group-hover:text-white/20'}`} />
                                  <span className={checked ? 'line-through text-white/20' : 'font-light'}>{obj}</span>
                                </button>
                              )
                            })}
                          </div>
                        </div>

                        {/* Resources List */}
                        {dayItem.resources && dayItem.resources.length > 0 && (
                          <div className="space-y-1.5 pt-2.5 border-t border-white/[0.03]">
                            <p className="text-[9px] uppercase tracking-wider font-semibold text-white/30 font-mono">Suggested Reference</p>
                            <ul className="list-disc list-inside text-[10px] text-white/40 space-y-0.5 font-light pl-1">
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
          <div className="bg-[#050505] border border-white/[0.06] rounded-2xl p-6 space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-white/[0.04]">
              <Clock size={14} className="text-white/30" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-white/70">Study History</h3>
            </div>

            {historyLoading ? (
              <div className="space-y-3">
                <div className="h-12 bg-white/[0.01] border border-white/[0.04] rounded-xl animate-pulse" />
                <div className="h-12 bg-white/[0.01] border border-white/[0.04] rounded-xl animate-pulse" />
              </div>
            ) : !savedHistory || savedHistory.length === 0 ? (
              <div className="text-center py-6 text-[10px] text-white/20">
                No generated calendars found in active logs.
              </div>
            ) : (
              <div className="space-y-3">
                {savedHistory.map((item) => {
                  const isExpanded = selectedRoadmap?.id === item.id
                  const contentArray = item.content as any[]

                  return (
                    <div key={item.id} className="border border-white/[0.04] bg-white/[0.005] rounded-xl overflow-hidden transition-colors hover:bg-white/[0.01]">
                      <button
                        onClick={() => setSelectedRoadmap(isExpanded ? null : item)}
                        className="w-full px-4 py-3.5 flex items-center justify-between text-left transition"
                      >
                        <div className="space-y-1">
                          <h4 className="font-semibold text-xs text-white/80">{item.subject} Study Plan</h4>
                          <p className="text-[10px] text-white/30 font-mono">{new Date(item.createdAt).toLocaleDateString()} • {item.days} Days Timeline</p>
                        </div>
                        {isExpanded ? <ChevronUp size={14} className="text-white/30" /> : <ChevronDown size={14} className="text-white/30" />}
                      </button>

                      {isExpanded && (
                        <div className="px-4 pb-4 border-t border-white/[0.04] pt-4 space-y-4 bg-white/[0.005] max-h-[400px] overflow-y-auto">
                          {contentArray.map((dayItem: RoadmapDay, dayIdx: number) => (
                            <div key={dayIdx} className="p-4 rounded-xl bg-black/40 border border-white/[0.03] space-y-3 text-xs">
                              <div className="flex items-center justify-between pb-2 border-b border-white/[0.04]">
                                <span className="font-semibold text-white/80">Day {dayItem.day} • {dayItem.topic}</span>
                                <span className="text-[9px] font-mono text-white/40 bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.06] font-bold">{dayItem.hoursRequired} Hrs</span>
                              </div>
                              <div className="space-y-1.5">
                                {dayItem.objectives.map((obj, objIdx) => {
                                  const key = `roadmap-${item.id}-d${dayItem.day}-o${objIdx}`
                                  const checked = !!checkedObjectives[key]
                                  return (
                                    <button
                                      key={objIdx}
                                      onClick={() => toggleObjective(key)}
                                      className="w-full flex items-start gap-2 text-[11px] text-left text-white/50 hover:text-white py-0.5"
                                    >
                                      <CheckCircle2 size={13} className={`shrink-0 mt-0.5 ${checked ? 'text-white' : 'text-white/10'}`} />
                                      <span className={checked ? 'line-through text-white/20' : ''}>{obj}</span>
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
