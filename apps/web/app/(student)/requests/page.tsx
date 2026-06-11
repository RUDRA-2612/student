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
  FileText
} from 'lucide-react'

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
    // Convert empty string to null for DB compliance
    const payload = {
      ...data,
      subjectId: data.subjectId || null
    }
    createRequestMutation.mutate(payload)
  }

  return (
    <div className="space-y-10">
      {/* Header Profile */}
      <div className="space-y-2">
        <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">Requests & Support</h1>
        <p className="text-white/40 text-sm font-light">
          Submit demands for missing examination papers, request custom solutions, or report platform bugs directly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left pane: Form to submit request */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-bg-surface border border-white/[0.06] rounded-xl p-6 space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-white/[0.06]">
              <Send size={18} className="text-accent" />
              <h2 className="font-display font-semibold text-sm uppercase tracking-wider">New Request</h2>
            </div>

            {successMsg && (
              <div className="p-4 bg-brand-mint/10 border border-brand-mint/20 rounded-xl text-xs text-brand-mint flex items-start gap-2">
                <CheckCircle2 className="shrink-0 mt-0.5" size={14} />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="p-4 bg-brand-coral/10 border border-brand-coral/20 rounded-xl text-xs text-brand-coral flex items-start gap-2">
                <AlertCircle className="shrink-0 mt-0.5" size={14} />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/50 uppercase tracking-wide mb-2">Request Type</label>
                <select
                  {...register('type')}
                  className="w-full px-4 py-2.5 bg-bg-input border border-white/[0.08] focus:border-accent/40 rounded-lg text-sm text-white focus:outline-none cursor-pointer"
                >
                  <option value="PAPER_REQUEST">Missing Exam Paper</option>
                  <option value="SOLUTION_REQUEST">Detailed Solutions Guide</option>
                  <option value="TOPIC_CLARIFICATION">Topic Clarification / Doubt</option>
                  <option value="BUG_REPORT">Report Platform Bug</option>
                  <option value="FEATURE_REQUEST">Suggest New Feature</option>
                  <option value="OTHER">Other Query</option>
                </select>
                {errors.type && <p className="text-xs text-brand-coral mt-1.5">{errors.type.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/50 uppercase tracking-wide mb-2">Subject (Optional)</label>
                <select
                  {...register('subjectId')}
                  className="w-full px-4 py-2.5 bg-bg-input border border-white/[0.08] focus:border-accent/40 rounded-lg text-sm text-white focus:outline-none cursor-pointer"
                >
                  <option value="">No Subject Linked</option>
                  {subjects?.map((sub) => (
                    <option key={sub.id} value={sub.id}>{sub.name} ({sub.code})</option>
                  ))}
                </select>
                {errors.subjectId && <p className="text-xs text-brand-coral mt-1.5">{errors.subjectId.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/50 uppercase tracking-wide mb-2">Title</label>
                <input
                  {...register('title')}
                  type="text"
                  placeholder="e.g. REET 2021 Level 1 Math paper request"
                  className="w-full px-4 py-2.5 bg-bg-input border border-white/[0.08] focus:border-accent/40 rounded-lg text-sm text-white placeholder:text-white/20 focus:outline-none"
                />
                {errors.title && <p className="text-xs text-brand-coral mt-1.5">{errors.title.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/50 uppercase tracking-wide mb-2">Details / Message</label>
                <textarea
                  {...register('message')}
                  rows={4}
                  placeholder="Describe details regarding this request (e.g. Exam year, set number, specific questions to resolve)..."
                  className="w-full px-4 py-2.5 bg-bg-input border border-white/[0.08] focus:border-accent/40 rounded-lg text-sm text-white placeholder:text-white/20 focus:outline-none resize-none"
                />
                {errors.message && <p className="text-xs text-brand-coral mt-1.5">{errors.message.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-accent hover:bg-accent-hover disabled:bg-accent/40 text-white font-semibold rounded-lg text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-accent/15"
              >
                {isSubmitting ? 'Submitting Request...' : 'Submit Support Request'}
              </button>
            </form>
          </div>
        </div>

        {/* Right pane: List of user's past requests */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-bg-surface border border-white/[0.06] rounded-xl p-6 space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-white/[0.06]">
              <Clock size={16} className="text-white/40" />
              <h2 className="font-display font-semibold text-sm uppercase tracking-wider text-white/60">My Requests History</h2>
            </div>

            {listLoading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="h-24 bg-white/5 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : !listData?.requests || listData.requests.length === 0 ? (
              <div className="text-center py-12 text-xs text-white/30 space-y-2">
                <FileText className="mx-auto opacity-30" size={32} />
                <p>You haven&apos;t filed any support requests yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {listData.requests.map((req) => {
                  const statusColors = 
                    req.status === 'RESOLVED' ? 'bg-brand-mint/10 text-brand-mint border-brand-mint/20' :
                    req.status === 'IN_PROGRESS' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                    req.status === 'CLOSED' ? 'bg-white/5 text-white/40 border-white/10' :
                    'bg-brand-amber/10 text-brand-amber border-brand-amber/20'

                  return (
                    <div key={req.id} className="p-5 rounded-xl border border-white/[0.04] bg-bg-base/30 space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <span className="text-[9px] font-mono text-white/40 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                            {req.type.replace('_', ' ')}
                          </span>
                          <h3 className="font-display font-bold text-sm text-white mt-1.5">{req.title}</h3>
                          <p className="text-[10px] text-white/30">{new Date(req.createdAt).toLocaleString()} {req.subject && `• Subject: ${req.subject.name}`}</p>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full border text-[9px] font-bold uppercase tracking-wider shrink-0 ${statusColors}`}>
                          {req.status}
                        </span>
                      </div>

                      <p className="text-xs font-light text-white/60 leading-relaxed bg-bg-surface/30 p-3 rounded-lg border border-white/[0.02]">
                        {req.message}
                      </p>

                      {req.adminReply && (
                        <div className="p-4 rounded-xl bg-accent/5 border border-accent/15 space-y-2 relative overflow-hidden">
                          <div className="absolute top-0 bottom-0 left-0 w-1 bg-accent" />
                          <div className="flex items-center justify-between text-[10px] text-white/40 pb-1.5 border-b border-white/[0.04]">
                            <span className="font-semibold text-accent flex items-center gap-1">
                              <MessageSquare size={10} /> Expert Response
                            </span>
                            <span>{req.repliedAt ? new Date(req.repliedAt).toLocaleDateString() : ''}</span>
                          </div>
                          <p className="text-xs text-white/80 leading-relaxed font-light whitespace-pre-wrap">{req.adminReply}</p>
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
