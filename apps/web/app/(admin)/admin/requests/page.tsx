'use client'

import { useState } from 'react'
import { api } from '@/lib/trpc/react'
import { 
  CheckCircle2, 
  MessageSquare,
  AlertCircle,
  HelpCircle,
  CornerDownRight
} from 'lucide-react'

export default function AdminRequests() {
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const utils = api.useUtils()

  // Fetch all support requests in the platform queue
  const { data: listData, isLoading } = api.requests.list.useQuery({ page: 1, limit: 50 })

  // Resolve mutation
  const resolveMutation = api.requests.resolve.useMutation({
    onSuccess: () => {
      setSuccessMsg('Ticket successfully resolved and email notification queued.')
      setActiveReplyId(null)
      setReplyText('')
      utils.requests.list.invalidate()
      utils.analytics.overview.invalidate()
      setTimeout(() => setSuccessMsg(null), 4000)
    },
    onError: (err) => {
      setErrorMsg(err.message || 'Failed to submit reply.')
      setTimeout(() => setErrorMsg(null), 4000)
    }
  })

  const handleResolveSubmit = (requestId: string) => {
    if (replyText.trim().length < 5) {
      alert('Reply must be at least 5 characters long')
      return
    }
    resolveMutation.mutate({
      id: requestId,
      adminReply: replyText
    })
  }

  return (
    <div className="space-y-10">
      {/* Header Profile */}
      <div className="space-y-2">
        <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">Support Requests Queue</h1>
        <p className="text-white/40 text-sm font-light">
          Review student demands for missing papers, coordinate doubt clarifications, and dispatch answers.
        </p>
      </div>

      <div className="bg-bg-surface border border-white/[0.06] rounded-xl p-6 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
          <h2 className="font-display font-semibold text-sm uppercase tracking-wider text-white/60">Tickets Desk</h2>
          {successMsg && (
            <span className="text-xs text-brand-mint font-semibold animate-pulse flex items-center gap-1">
              <CheckCircle2 size={12} /> {successMsg}
            </span>
          )}
          {errorMsg && (
            <span className="text-xs text-brand-coral font-semibold flex items-center gap-1">
              <AlertCircle size={12} /> {errorMsg}
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-28 bg-white/5 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : !listData?.requests || listData.requests.length === 0 ? (
          <div className="text-center py-12 text-xs text-white/30 space-y-2">
            <HelpCircle className="mx-auto opacity-35" size={32} />
            <p>No support tickets registered in the queue.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {listData.requests.map((req) => {
              const isReplying = activeReplyId === req.id
              const badgeColors = 
                req.status === 'RESOLVED' ? 'bg-brand-mint/10 text-brand-mint border-brand-mint/20' :
                req.status === 'IN_PROGRESS' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                req.status === 'CLOSED' ? 'bg-white/5 text-white/40 border-white/10' :
                'bg-brand-amber/10 text-brand-amber border-brand-amber/20'

              return (
                <div key={req.id} className="p-5 rounded-xl border border-white/[0.04] bg-bg-base/20 space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-mono text-white/40 bg-white/5 px-2 py-0.5 rounded border border-white/10 uppercase">
                          {req.type.replace('_', ' ')}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full border text-[9px] font-bold uppercase tracking-wider ${badgeColors}`}>
                          {req.status}
                        </span>
                      </div>
                      <h3 className="font-display font-bold text-sm text-white mt-2">{req.title}</h3>
                      <p className="text-[10px] text-white/40">
                        Filed by: <strong className="text-white/60">{req.user?.name || req.user?.email}</strong> • {new Date(req.createdAt).toLocaleString()} {req.subject && `• Subject: ${req.subject.name}`}
                      </p>
                    </div>

                    {req.status === 'PENDING' && !isReplying && (
                      <button
                        onClick={() => {
                          setActiveReplyId(req.id)
                          setReplyText('')
                        }}
                        className="px-4 py-2 bg-accent hover:bg-accent-hover text-white text-xs font-semibold rounded-lg transition"
                      >
                        Write Reply
                      </button>
                    )}
                  </div>

                  <p className="text-xs font-light text-white/60 leading-relaxed bg-bg-surface/30 p-3 rounded-lg border border-white/[0.02]">
                    {req.message}
                  </p>

                  {/* Resolution Input Box */}
                  {isReplying && (
                    <div className="p-4 rounded-xl bg-accent/5 border border-accent/15 space-y-3">
                      <div className="flex items-center gap-1.5 text-[10px] text-accent font-semibold">
                        <CornerDownRight size={12} /> Draft Reply
                      </div>
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        rows={3}
                        placeholder="Provide detailed information or confirm syllabus uploads details..."
                        className="w-full px-4 py-2 bg-bg-input border border-white/[0.08] focus:border-accent/40 rounded-lg text-xs text-white focus:outline-none resize-none font-light"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setActiveReplyId(null)}
                          className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white/70 text-xs font-semibold"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleResolveSubmit(req.id)}
                          className="px-3 py-1.5 rounded-lg bg-accent hover:bg-accent-hover text-white text-xs font-semibold"
                        >
                          Resolve & Send Email
                        </button>
                      </div>
                    </div>
                  )}

                  {req.adminReply && (
                    <div className="p-4 rounded-xl bg-accent/5 border border-accent/15 space-y-2 relative overflow-hidden">
                      <div className="absolute top-0 bottom-0 left-0 w-1 bg-accent" />
                      <div className="flex items-center justify-between text-[10px] text-white/40 pb-1.5 border-b border-white/[0.04]">
                        <span className="font-semibold text-accent flex items-center gap-1">
                          <MessageSquare size={10} /> Reply Sent
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
  )
}
