'use client'

import { useState } from 'react'
import { api } from '@/lib/trpc/react'
import { useForm } from 'react-hook-form'
import { 
  PlusCircle, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink,
  GraduationCap
} from 'lucide-react'

type PlacementFormValues = {
  title: string
  category: 'DSA_SHEET' | 'APTITUDE' | 'INTERVIEW_Q' | 'RESUME' | 'HR' | 'CODING_CHALLENGE'
  content: string
  url: string
}

export default function AdminPlacement() {
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [filterCategory, setFilterCategory] = useState<string>('')

  const utils = api.useUtils()

  // Queries
  const { data: resources, isLoading } = api.placement.list.useQuery(
    filterCategory ? { category: filterCategory as any } : undefined
  )

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<PlacementFormValues>({
    defaultValues: {
      title: '',
      category: 'DSA_SHEET',
      content: '',
      url: ''
    }
  })

  // Mutations
  const createMutation = api.placement.create.useMutation({
    onSuccess: () => {
      setSuccessMsg('Placement resource added successfully!')
      reset()
      utils.placement.list.invalidate()
      setTimeout(() => setSuccessMsg(null), 4000)
    },
    onError: (err) => {
      setErrorMsg(err.message || 'Error occurred while creating resource.')
      setTimeout(() => setErrorMsg(null), 4000)
    }
  })

  const deleteMutation = api.placement.delete.useMutation({
    onSuccess: () => {
      setSuccessMsg('Placement resource deleted successfully.')
      utils.placement.list.invalidate()
      setTimeout(() => setSuccessMsg(null), 4000)
    },
    onError: (err) => {
      setErrorMsg(err.message || 'Error occurred while deleting resource.')
      setTimeout(() => setErrorMsg(null), 4000)
    }
  })

  const onSubmit = (data: PlacementFormValues) => {
    createMutation.mutate({
      ...data,
      content: data.content || undefined,
      url: data.url || undefined,
    })
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this placement resource?')) {
      deleteMutation.mutate({ id })
    }
  }

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">Placement Preparation Hub</h1>
        <p className="text-white/40 text-sm font-light">
          Manage curated DSA sheets, aptitude prep guides, coding challenge platforms, resume tips, and HR interview guides.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Add Placement Resource */}
        <div className="lg:col-span-4">
          <div className="bg-bg-surface border border-white/[0.06] rounded-xl p-6 space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-white/[0.06]">
              <PlusCircle size={18} className="text-accent" />
              <h2 className="font-display font-semibold text-sm uppercase tracking-wider">Add Placement Resource</h2>
            </div>

            {successMsg && (
              <div className="p-4 bg-sage/10 border border-sage/20 rounded-xl text-xs text-sage flex items-start gap-2">
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
                <label className="form-label">Resource Title</label>
                <input
                  {...register('title', { required: 'Title is required' })}
                  type="text"
                  placeholder="e.g. Blind 75 LeetCode DSA Sheet"
                  className="form-input"
                />
                {errors.title && <p className="text-xs text-brand-coral mt-1.5">{errors.title.message}</p>}
              </div>

              <div>
                <label className="form-label">Category</label>
                <select
                  {...register('category')}
                  className="form-input cursor-pointer"
                >
                  <option value="DSA_SHEET">DSA Practice Sheet</option>
                  <option value="APTITUDE">Aptitude Prep Material</option>
                  <option value="INTERVIEW_Q">Technical Interview Questions</option>
                  <option value="RESUME">Resume Guidance</option>
                  <option value="HR">HR Interview Questions</option>
                  <option value="CODING_CHALLENGE">Coding Challenge Link</option>
                </select>
              </div>

              <div>
                <label className="form-label">Reference URL (Optional)</label>
                <input
                  {...register('url')}
                  type="url"
                  placeholder="https://leetcode.com/problemset/"
                  className="form-input"
                />
              </div>

              <div>
                <label className="form-label">Markdown / Details (Optional)</label>
                <textarea
                  {...register('content')}
                  rows={4}
                  placeholder="List down steps, topics, or guidelines..."
                  className="form-input resize-none"
                />
              </div>

              <button type="submit" disabled={isSubmitting} className="w-full btn-primary">
                {isSubmitting ? 'Creating...' : 'Create Resource'}
              </button>
            </form>
          </div>
        </div>

        {/* Directory List */}
        <div className="lg:col-span-8 space-y-4">
          {/* Filters */}
          <div className="bg-bg-surface border border-white/[0.06] rounded-xl p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">Filter Category</span>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-1.5 bg-bg-input border border-white/[0.08] focus:border-accent/40 rounded-lg text-xs text-white focus:outline-none cursor-pointer"
              >
                <option value="">All Categories</option>
                <option value="DSA_SHEET">DSA Practice Sheet</option>
                <option value="APTITUDE">Aptitude Prep Material</option>
                <option value="INTERVIEW_Q">Technical Interview Questions</option>
                <option value="RESUME">Resume Guidance</option>
                <option value="HR">HR Interview Questions</option>
                <option value="CODING_CHALLENGE">Coding Challenge Link</option>
              </select>
            </div>
          </div>

          <div className="bg-bg-surface border border-white/[0.06] rounded-xl p-6 space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-white/[0.06]">
              <GraduationCap size={16} className="text-white/40" />
              <h2 className="font-display font-semibold text-sm uppercase tracking-wider text-white/60">Placement materials catalog</h2>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-white/5 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : !resources || resources.length === 0 ? (
              <div className="text-center py-12 text-xs text-white/30 space-y-2">
                <GraduationCap className="mx-auto opacity-35" size={32} />
                <p>No placement materials found. Add some resources to prepare students.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {resources.map((res) => (
                  <div key={res.id} className="p-4 rounded-xl border border-white/[0.04] bg-bg-base/20 flex items-center justify-between gap-4 animate-fade-in">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-semibold text-accent/80 bg-accent/10 px-2 py-0.5 rounded-full border border-accent/20">
                          {res.category.replace('_', ' ')}
                        </span>
                      </div>
                      <h4 className="font-display font-bold text-sm text-white/95 mt-1">{res.title}</h4>
                      {res.content && <p className="text-xs text-white/40 leading-relaxed font-light">{res.content}</p>}
                      {res.url && (
                        <a 
                          href={res.url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-[10px] text-accent/80 hover:text-accent font-semibold flex items-center gap-0.5 w-fit"
                        >
                          Visit Link <ExternalLink size={10} />
                        </a>
                      )}
                    </div>

                    <div className="shrink-0">
                      <button
                        onClick={() => handleDelete(res.id)}
                        className="w-8 h-8 rounded-lg bg-brand-coral/5 hover:bg-brand-coral/10 text-brand-coral border border-brand-coral/15 flex items-center justify-center transition"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
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
