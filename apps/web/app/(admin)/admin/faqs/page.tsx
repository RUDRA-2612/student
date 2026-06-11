'use client'

import { useState } from 'react'
import { api } from '@/lib/trpc/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FAQCreateSchema } from '@examedge/validators'
import { z } from 'zod'
import { 
  HelpCircle, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  FolderPlus,
  MessageSquare
} from 'lucide-react'

type FAQFormValues = z.infer<typeof FAQCreateSchema>

export default function AdminFAQs() {
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const utils = api.useUtils()

  // Fetch FAQs list
  const { data: faqs, isLoading } = api.faqs.list.useQuery()

  // Fetch active subjects list
  const { data: subjects } = api.subjects.list.useQuery({ isActive: true })

  // Form Setup
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FAQFormValues>({
    resolver: zodResolver(FAQCreateSchema),
    defaultValues: {
      question: '',
      answer: '',
      category: 'General',
      subjectId: '',
      sortOrder: 0
    }
  })

  // Create FAQ mutation
  const createMutation = api.faqs.create.useMutation({
    onSuccess: () => {
      setSuccessMsg('FAQ entry published successfully!')
      reset()
      utils.faqs.list.invalidate()
      setTimeout(() => setSuccessMsg(null), 4000)
    },
    onError: (err) => {
      setErrorMsg(err.message || 'Failed to save FAQ.')
      setTimeout(() => setErrorMsg(null), 4000)
    }
  })

  // Delete FAQ mutation
  const deleteMutation = api.faqs.delete.useMutation({
    onSuccess: () => {
      setSuccessMsg('FAQ entry deleted.')
      utils.faqs.list.invalidate()
      setTimeout(() => setSuccessMsg(null), 4000)
    },
    onError: (err) => {
      setErrorMsg(err.message || 'Failed to delete FAQ.')
      setTimeout(() => setErrorMsg(null), 4000)
    }
  })

  const onSubmit = (data: FAQFormValues) => {
    createMutation.mutate({
      ...data,
      sortOrder: Number(data.sortOrder),
      subjectId: data.subjectId || null
    })
  }

  const handleDelete = (id: string) => {
    if (confirm('Delete this FAQ record?')) {
      deleteMutation.mutate({ id })
    }
  }

  return (
    <div className="space-y-10">
      {/* Header Profile */}
      <div className="space-y-2">
        <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">Help Desk & FAQs</h1>
        <p className="text-white/40 text-sm font-light">
          Publish and structure platform help guidelines, Rajasthan board logistics, or portal feature explanations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Form: Add FAQ */}
        <div className="lg:col-span-5">
          <div className="bg-bg-surface border border-white/[0.06] rounded-xl p-6 space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-white/[0.06]">
              <FolderPlus size={18} className="text-accent" />
              <h2 className="font-display font-semibold text-sm uppercase tracking-wider">Publish FAQ</h2>
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
                <label className="block text-xs font-semibold text-white/50 uppercase tracking-wide mb-2">Category</label>
                <select
                  {...register('category')}
                  className="w-full px-4 py-2.5 bg-bg-input border border-white/[0.08] focus:border-accent/40 rounded-lg text-sm text-white focus:outline-none cursor-pointer"
                >
                  <option value="General">General Help</option>
                  <option value="Exam">Exam Logistics</option>
                  <option value="Platform">AI Features</option>
                  <option value="Results">Syllabus & Scoring</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/50 uppercase tracking-wide mb-2">Subject Link (Optional)</label>
                <select
                  {...register('subjectId')}
                  className="w-full px-4 py-2.5 bg-bg-input border border-white/[0.08] focus:border-accent/40 rounded-lg text-sm text-white focus:outline-none cursor-pointer"
                >
                  <option value="">No Subject Linked</option>
                  {subjects?.map((sub) => (
                    <option key={sub.id} value={sub.id}>{sub.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/50 uppercase tracking-wide mb-2">Sort Order</label>
                <input
                  {...register('sortOrder', { valueAsNumber: true })}
                  type="number"
                  className="w-full px-4 py-2.5 bg-bg-input border border-white/[0.08] focus:border-accent/40 rounded-lg text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/50 uppercase tracking-wide mb-2">Question</label>
                <input
                  {...register('question')}
                  type="text"
                  placeholder="e.g. When will REET admit cards release?"
                  className="w-full px-4 py-2.5 bg-bg-input border border-white/[0.08] focus:border-accent/40 rounded-lg text-sm text-white placeholder:text-white/20 focus:outline-none"
                />
                {errors.question && <p className="text-xs text-brand-coral mt-1">{errors.question.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/50 uppercase tracking-wide mb-2">Answer</label>
                <textarea
                  {...register('answer')}
                  rows={4}
                  placeholder="Answer context details..."
                  className="w-full px-4 py-2.5 bg-bg-input border border-white/[0.08] focus:border-accent/40 rounded-lg text-sm text-white placeholder:text-white/20 focus:outline-none resize-none font-light"
                />
                {errors.answer && <p className="text-xs text-brand-coral mt-1">{errors.answer.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-accent hover:bg-accent-hover text-white font-semibold rounded-lg text-sm transition"
              >
                {isSubmitting ? 'Saving FAQ...' : 'Publish FAQ'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Directory list */}
        <div className="lg:col-span-7">
          <div className="bg-bg-surface border border-white/[0.06] rounded-xl p-6 space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-white/[0.06]">
              <HelpCircle size={16} className="text-white/40" />
              <h2 className="font-display font-semibold text-sm uppercase tracking-wider text-white/60">FAQ Directory</h2>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-white/5 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : !faqs || faqs.length === 0 ? (
              <div className="text-center py-12 text-xs text-white/30 space-y-2">
                <MessageSquare className="mx-auto opacity-35" size={32} />
                <p>No FAQs registered. Publish your first FAQ above.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {faqs.map((faq) => (
                  <div key={faq.id} className="p-4 rounded-xl border border-white/[0.04] bg-bg-base/20 flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <span className="text-[9px] font-semibold text-accent/80 bg-accent/10 border border-accent/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                          {faq.category}
                        </span>
                        <h4 className="font-display font-bold text-sm text-white/95 mt-1.5 leading-tight">{faq.question}</h4>
                      </div>

                      <button
                        onClick={() => handleDelete(faq.id)}
                        className="w-8 h-8 rounded-lg bg-brand-coral/5 hover:bg-brand-coral/10 text-brand-coral border border-brand-coral/15 flex items-center justify-center transition shrink-0"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                    <p className="text-xs text-white/60 leading-relaxed font-light whitespace-pre-wrap">{faq.answer}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
