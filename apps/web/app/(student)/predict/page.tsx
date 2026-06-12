'use client'

import { useState } from 'react'
import { api } from '@/lib/trpc/react'
import { 
  Zap, 
  Target, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  AlertCircle,
  BrainCircuit,
  TrendingUp,
  BarChart
} from 'lucide-react'
import { TiltCard } from '@/components/ui/tilt-card'

interface PredictionItem {
  topic: string
  probability: number
  reasoning: string
  importance: string
}

export default function ExamPredictor() {
  const [subject, setSubject] = useState('')
  const [examType, setExamType] = useState('FINAL')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Streaming state
  const [predictions, setPredictions] = useState<PredictionItem[] | null>(null)
  const [rawProgress, setRawProgress] = useState('')

  // tRPC queries
  const utils = api.useUtils()
  const { data: subjects } = api.subjects.list.useQuery({ isActive: true })
  const { data: savedHistory, isLoading: historyLoading } = api.student.myPredictions.useQuery()

  // Selected saved prediction state
  const [selectedPrediction, setSelectedPrediction] = useState<any | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!subject || !examType) return

    setIsSubmitting(true)
    setError(null)
    setPredictions(null)
    setRawProgress('')
    setSelectedPrediction(null)

    try {
      const response = await fetch('/api/ai/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, examType }),
      })

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Hourly rate limit exceeded (Max 10 AI requests per hour).')
        }
        throw new Error('Failed to generate predictions.')
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
          setPredictions(parsed)
        } else {
          const parsed = JSON.parse(accumulatedText)
          setPredictions(parsed)
        }
      } catch (err) {
        console.error('Failed parsing predictions json:', accumulatedText, err)
        throw new Error('AI engine returned invalid payload format. Please retry.')
      }

      // Invalidate queries
      utils.student.myPredictions.invalidate()
      utils.student.dashboardStats.invalidate()

    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getProbabilityColor = (prob: number) => {
    if (prob >= 80) return 'text-red-400 bg-red-400/10 border-red-400/20'
    if (prob >= 50) return 'text-amber-400 bg-amber-400/10 border-amber-400/20'
    return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20'
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="border-b border-white/[0.04] pb-6">
        <p className="text-[10px] font-mono tracking-[0.3em] uppercase text-brand-mint mb-2 flex items-center gap-2">
          <BrainCircuit size={14} /> Intelligence Engine
        </p>
        <h1 className="text-4xl md:text-5xl font-light tracking-[-0.02em]">
          AI Exam <span className="italic text-brand-mint font-serif" style={{ fontFamily: 'var(--font-serif), Georgia, serif' }}>Predictor</span>
        </h1>
        <p className="text-white/40 text-xs font-light max-w-xl mt-3 leading-relaxed">
          Leverage historical paper analysis and Claude 3.5 Sonnet to predict the highest probability topics for your next exam.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Form Panel: 3D TiltCard */}
        <div className="lg:col-span-4 space-y-6">
          <TiltCard
            maxTilt={6}
            glareOpacity={0.06}
            className="bg-bg-surface/40 backdrop-blur-md border border-white/[0.06] rounded-3xl p-6 hover:border-white/[0.1] transition-colors"
          >
            <div className="space-y-6" style={{ transform: 'translateZ(15px)' }}>
              <div className="flex items-center gap-2 pb-4 border-b border-white/[0.06]">
                <Target size={15} className="text-brand-mint" />
                <h2 className="text-xs font-semibold uppercase tracking-wider text-white/90">Prediction Settings</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-2">Target Subject</label>
                  <div className="relative">
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="appearance-none w-full px-4 py-3 bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.06] rounded-xl text-xs text-white focus:outline-none focus:border-brand-mint/50 cursor-pointer transition-colors"
                      required
                    >
                      <option value="">Select a Subject...</option>
                      {subjects?.map((sub) => (
                        <option key={sub.id} value={sub.name}>{sub.name}</option>
                      ))}
                    </select>
                    <ChevronDown size={12} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-2">Exam Type</label>
                  <div className="relative">
                    <select
                      value={examType}
                      onChange={(e) => setExamType(e.target.value)}
                      className="appearance-none w-full px-4 py-3 bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.06] rounded-xl text-xs text-white focus:outline-none focus:border-brand-mint/50 cursor-pointer transition-colors"
                      required
                    >
                      <option value="MIDTERM">Midterm</option>
                      <option value="FINAL">Final</option>
                      <option value="COMPETITIVE">Competitive</option>
                      <option value="MOCK">Mock</option>
                      <option value="ASSIGNMENT">Assignment</option>
                    </select>
                    <ChevronDown size={12} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !subject}
                  className="w-full py-3.5 bg-brand-mint text-black hover:bg-brand-mint/90 disabled:bg-brand-mint/30 disabled:text-black/50 font-bold rounded-xl text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-lg shadow-brand-mint/10"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                      Analyzing Patterns...
                    </>
                  ) : (
                    <>
                      <TrendingUp size={14} /> Generate Prediction
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
          {(isSubmitting || predictions || error) && (
            <div className="bg-bg-surface/40 backdrop-blur-md border border-white/[0.06] rounded-3xl p-6 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.04]">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-white/90">Prediction Results</h3>
                {isSubmitting && (
                  <span className="flex items-center gap-1.5 text-[10px] text-brand-mint font-mono animate-pulse">
                    <Zap size={10} className="animate-spin" /> NEURAL LINK ACTIVE
                  </span>
                )}
              </div>

              {error && (
                <div className="p-4 bg-red-500/[0.03] border border-red-500/20 rounded-xl flex items-start gap-3 text-xs text-red-400">
                  <AlertCircle className="shrink-0 mt-0.5" size={14} />
                  <div>
                    <p className="font-semibold">Analysis Error</p>
                    <p className="text-red-400/80 mt-1">{error}</p>
                  </div>
                </div>
              )}

              {isSubmitting && !predictions && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-white/[0.01] border border-white/[0.04]">
                    <p className="text-[10px] font-mono text-white/30 break-all leading-relaxed line-clamp-6">
                      {rawProgress || 'Initializing neural network... scanning historical syllabus matrices...'}
                    </p>
                  </div>
                </div>
              )}

              {predictions && (
                <div className="space-y-4">
                  {predictions.sort((a, b) => b.probability - a.probability).map((item, idx) => (
                    <div key={idx} className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.04] space-y-3 hover:border-white/[0.08] transition-colors relative overflow-hidden group">
                      {/* Background Probability Bar Indicator */}
                      <div 
                        className="absolute bottom-0 left-0 h-1 bg-white/[0.04] group-hover:bg-brand-mint/20 transition-colors"
                        style={{ width: `${item.probability}%` }}
                      />

                      <div className="flex flex-wrap items-start justify-between gap-3 relative z-10">
                        <div>
                          <h4 className="text-sm font-medium text-white/90 mb-1">{item.topic}</h4>
                          <span className="text-[9px] font-mono font-bold text-white/40 bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.06]">
                            Importance: {item.importance.replace('_', ' ')}
                          </span>
                        </div>
                        <div className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 ${getProbabilityColor(item.probability)}`}>
                          <BarChart size={12} />
                          <span className="text-xs font-bold font-mono">{item.probability}%</span>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-white/[0.04] relative z-10">
                        <p className="text-[11px] text-white/50 leading-relaxed font-light flex items-start gap-2">
                          <BrainCircuit size={12} className="shrink-0 mt-0.5 text-white/20" />
                          {item.reasoning}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* History Panel */}
          <div className="bg-bg-surface/40 backdrop-blur-md border border-white/[0.06] rounded-3xl p-6 space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-white/[0.04]">
              <Clock size={14} className="text-white/30" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-white/70">Prediction Log</h3>
            </div>

            {historyLoading ? (
              <div className="space-y-3">
                <div className="h-14 bg-white/[0.01] border border-white/[0.04] rounded-xl animate-pulse" />
                <div className="h-14 bg-white/[0.01] border border-white/[0.04] rounded-xl animate-pulse" />
              </div>
            ) : !savedHistory || savedHistory.length === 0 ? (
              <div className="text-center py-6 text-[10px] text-white/20">
                No past predictions found in your log.
              </div>
            ) : (
              <div className="space-y-3">
                {savedHistory.map((item) => {
                  const isExpanded = selectedPrediction?.id === item.id
                  const contentArray = item.content as unknown as PredictionItem[]

                  return (
                    <div key={item.id} className="border border-white/[0.04] bg-white/[0.01] rounded-xl overflow-hidden transition-colors hover:bg-white/[0.02]">
                      <button
                        onClick={() => setSelectedPrediction(isExpanded ? null : item)}
                        className="w-full px-4 py-3.5 flex items-center justify-between text-left transition"
                      >
                        <div className="space-y-1">
                          <h4 className="font-semibold text-xs text-white/80">{item.subject} <span className="text-white/40 font-normal">({item.examType})</span></h4>
                          <span suppressHydrationWarning className="text-[10px] text-white/30 font-mono flex items-center gap-1">
                            <Clock size={10} /> {new Date(item.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {isExpanded ? <ChevronUp size={14} className="text-white/30" /> : <ChevronDown size={14} className="text-white/30" />}
                      </button>

                      {isExpanded && (
                        <div className="px-4 pb-4 border-t border-white/[0.04] pt-4 space-y-4 bg-white/[0.005] max-h-[400px] overflow-y-auto">
                          {contentArray.map((pred: PredictionItem, idx: number) => (
                            <div key={idx} className="p-3.5 rounded-xl bg-black/40 border border-white/[0.03] space-y-2">
                              <div className="flex items-start justify-between gap-2">
                                <span className="font-semibold text-xs text-white/80">{pred.topic}</span>
                                <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${getProbabilityColor(pred.probability)}`}>
                                  {pred.probability}%
                                </span>
                              </div>
                              <p className="text-[10px] text-white/40 leading-relaxed font-light">{pred.reasoning}</p>
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
