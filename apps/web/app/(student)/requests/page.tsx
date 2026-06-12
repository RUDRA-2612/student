'use client'

import { useState } from 'react'
import { api } from '@/lib/trpc/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { RequestCreateSchema } from '@examedge/validators'
import { z } from 'zod'
import { 
  Send, 
  Clock, 
  CheckCircle2, 
  MessageSquare,
  AlertCircle,
  FileText,
  ChevronDown
} from 'lucide-react'
import { TiltCard } from '@/components/ui/tilt-card'

type RequestFormValues = z.infer<typeof RequestCreateSchema>

export default function StudentRequests() {
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const utils = api.useUtils()

  // Fetch subject list for dropdown selector
  const { data: subjects } = api.subjects.list.useQuery({ isActive: true })

  // Fetch student's requests list
  const { data: listData, isLoading: listLoading } = api.requests.list.useQuery({ page: 1, limit: 20 })

  // react-hook-form setup
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<RequestFormValues>({
    resolver: zodResolver(RequestCreateSchema),
    defaultValues: {
      type: 'PAPER_REQUEST',
      subjectId: '',
      title: '',
      message: ''
    }
  })

  // Create request mutation
  const createRequestMutation = api.requests.create.useMutation({
    onSuccess: () => {
      setSuccessMsg('Your request has been successfully queued. An admin will review it shortly.')
      reset()
      utils.requests.list.invalidate()
      utils.student.dashboardStats.invalidate()
      setTimeout(() => setSuccessMsg(null), 5000)
    },
    onError: (err) => {
      setErrorMsg(err.message || 'Failed to submit request. Please try again.')
      setTimeout(() => setErrorMsg(null), 5000)
    }
  })

  const onSubmit = (data: RequestFormValues) => {
    const payload = {
      ...data,
      subjectId: data.subjectId || null
    }
    createRequestMutation.mutate(payload)
  }

  return (
    <div className="space-y-8">
      {/* Header Profile */}
      <div className="border-b border-white/[0.04] pb-6">
        <p className="text-[10px] font-mono tracking-[0.3em] uppercase text-white/30 mb-2">Support Services</p>
        <h1 className="text-4xl md:text-5xl font-light tracking-[-0.02em]">
          Requests & <span className="italic text-white/40 font-serif" style={{ fontFamily: 'var(--font-serif), Georgia, serif' }}>Support</span>
        </h1>
        <p className="text-white/40 text-xs font-light max-w-xl mt-3 leading-relaxed">
          Submit missing exam paper demands, request custom expert solutions, or report technical bugs.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left pane: Form to submit request inside a TiltCard */}
        <div className="lg:col-span-5 space-y-6">
          <TiltCard
            maxTilt={5}
            glareOpacity={0.06}
            className="bg-[#050505] border border-white/[0.06] rounded-2xl p-6 hover:border-white/[0.1] transition-colors"
          >
            <div className="space-y-6" style={{ transform: 'translateZ(15px)' }}>
              <div className="flex items-center gap-2 pb-4 border-b border-white/[0.06]">
                <Send size={15} className="text-white/40" />
                <h2 className="text-xs font-semibold uppercase tracking-wider text-white/70">New Support Ticket</h2>
              </div>

              {successMsg && (
                <div className="p-4 bg-emerald-500/[0.03] border border-emerald-500/20 rounded-xl text-xs text-emerald-400 flex items-start gap-2">
                  <CheckCircle2 className="shrink-0 mt-0.5 text-emerald-400" size={14} />
                  <span>{successMsg}</span>
                </div>
              )}

              {errorMsg && (
                <div className="p-4 bg-red-500/[0.03] border border-red-500/20 rounded-xl text-xs text-red-400 flex items-start gap-2">
                  <AlertCircle className="shrink-0 mt-0.5 text-red-400" size={14} />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-[9px] font-semibold text-white/40 uppercase tracking-widest mb-2 font-mono">Category</label>
                  <div className="relative">
                    <select
                      {...register('type')}
                      className="appearance-none w-full px-4 py-2.5 bg-white/[0.02] border border-white/[0.06] rounded-xl text-xs text-white focus:outline-none cursor-pointer"
                    >
                      <option value="PAPER_REQUEST">Missing Exam Paper</option>
                      <option value="SOLUTION_REQUEST">Detailed Solutions Guide</option>
                      <option value="TOPIC_CLARIFICATION">Topic Clarification / Doubt</option>
                      <option value="BUG_REPORT">Report Platform Bug</option>
                      <option value="FEATURE_REQUEST">Suggest New Feature</option>
                      <option value="OTHER">Other Query</option>
                    </select>
                    <ChevronDown size={12} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                  </div>
                  {errors.type && <p className="text-[10px] text-red-400 mt-1.5">{errors.type.message}</p>}
                </div>

                <div>
                  <label className="block text-[9px] font-semibold text-white/40 uppercase tracking-widest mb-2 font-mono">Linked Subject (Optional)</label>
                  <div className="relative">
                    <select
                      {...register('subjectId')}
                      className="appearance-none w-full px-4 py-2.5 bg-white/[0.02] border border-white/[0.06] rounded-xl text-xs text-white focus:outline-none cursor-pointer"
                    >
                      <option value="">No Subject Linked</option>
                      {subjects?.map((sub) => (
                        <option key={sub.id} value={sub.id}>{sub.name}</option>
                      ))}
                    </select>
                    <ChevronDown size={12} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                  </div>
                  {errors.subjectId && <p className="text-[10px] text-red-400 mt-1.5">{errors.subjectId.message}</p>}
                </div>

                <div>
                  <label className="block text-[9px] font-semibold text-white/40 uppercase tracking-widest mb-2 font-mono">Short Summary</label>
                  <input
                    {...register('title')}
                    type="text"
                    placeholder="e.g. Calculus midterm solutions guide request"
                    className="w-full px-4 py-2.5 bg-white/[0.02] border border-white/[0.06] focus:border-white/20 rounded-xl text-xs text-white placeholder:text-white/20 focus:outline-none transition-colors"
                  />
                  {errors.title && <p className="text-[10px] text-red-400 mt-1.5">{errors.title.message}</p>}
                </div>

                <div>
                  <label className="block text-[9px] font-semibold text-white/40 uppercase tracking-widest mb-2 font-mono">Description</label>
                  <textarea
                    {...register('message')}
                    rows={4}
                    placeholder="Provide details (specific year, topics to explain, error details)..."
                    className="w-full px-4 py-2.5 bg-white/[0.02] border border-white/[0.06] focus:border-white/20 rounded-xl text-xs text-white placeholder:text-white/20 focus:outline-none resize-none transition-colors"
                  />
                  {errors.message && <p className="text-[10px] text-red-400 mt-1.5">{errors.message.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-white text-black hover:bg-white/90 disabled:bg-white/30 disabled:text-black/50 font-bold rounded-xl text-xs uppercase tracking-wider transition flex items-center justify-center gap-2"
                >
                  {isSubmitting ? 'Submitting Ticket...' : 'File Support Ticket'}
                </button>
              </form>
            </div>
          </TiltCard>
        </div>

        {/* Right pane: List of user's past requests */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-[#050505] border border-white/[0.06] rounded-2xl p-6 space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-white/[0.04]">
              <Clock size={14} className="text-white/30" />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-white/70">Support Logs History</h2>
            </div>

            {listLoading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="h-24 bg-white/[0.01] border border-white/[0.04] rounded-xl animate-pulse" />
                ))}
              </div>
            ) : !listData?.requests || listData.requests.length === 0 ? (
              <div className="text-center py-12 text-[10px] text-white/20 space-y-2">
                <FileText className="mx-auto opacity-20" size={24} />
                <p>No historical support logs on file.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {listData.requests.map((req) => {
                  const statusColors = 
                    req.status === 'RESOLVED' ? 'bg-emerald-500/[0.04] text-emerald-400 border-emerald-500/20' :
                    req.status === 'IN_PROGRESS' ? 'bg-blue-500/[0.04] text-blue-400 border-blue-500/20' :
                    req.status === 'CLOSED' ? 'bg-white/[0.02] text-white/30 border-white/[0.06]' :
                    'bg-amber-500/[0.04] text-amber-400 border-amber-500/20'

                  return (
                    <div key={req.id} className="p-5 rounded-2xl border border-white/[0.04] bg-white/[0.005] space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <span className="text-[8px] font-mono font-bold text-white/30 bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.06] tracking-wider uppercase">
                            {req.type.replace('_', ' ')}
                          </span>
                          <h3 className="text-xs font-semibold text-white/80 mt-2">{req.title}</h3>
                          <p className="text-[9px] font-mono text-white/20">{new Date(req.createdAt).toLocaleString()} {req.subject && `• Subject: ${req.subject.name}`}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full border text-[8px] font-bold uppercase tracking-wider shrink-0 ${statusColors}`}>
                          {req.status}
                        </span>
                      </div>

                      <p className="text-xs font-light text-white/45 leading-relaxed bg-white/[0.01] p-3 rounded-xl border border-white/[0.03]">
                        {req.message}
                      </p>

                      {req.adminReply && (
                        <div className="p-4 rounded-xl bg-white/[0.01] border border-white/[0.04] space-y-2 relative overflow-hidden">
                          <div className="absolute top-0 bottom-0 left-0 w-0.5 bg-white/20" />
                          <div className="flex items-center justify-between text-[9px] text-white/35 pb-1.5 border-b border-white/[0.03]">
                            <span className="font-semibold text-white/60 flex items-center gap-1">
                              <MessageSquare size={9} /> Mentor Response
                            </span>
                            <span>{req.repliedAt ? new Date(req.repliedAt).toLocaleDateString() : ''}</span>
                          </div>
                          <p className="text-[11px] text-white/60 leading-relaxed font-light whitespace-pre-wrap">{req.adminReply}</p>
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
