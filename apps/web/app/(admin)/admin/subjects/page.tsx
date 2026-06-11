'use client'

import { useState } from 'react'
import { api } from '@/lib/trpc/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { SubjectCreateSchema } from '@examedge/validators'
import { z } from 'zod'
import { 
  BookOpen, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  FolderPlus,
  FolderOpen
} from 'lucide-react'

type SubjectFormValues = z.infer<typeof SubjectCreateSchema>

export default function AdminSubjects() {
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const utils = api.useUtils()

  // Fetch subjects list (including inactive ones)
  const { data: subjects, isLoading } = api.subjects.list.useQuery({ isActive: false })

  // Form setup
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<SubjectFormValues>({
    resolver: zodResolver(SubjectCreateSchema),
    defaultValues: {
      name: '',
      code: '',
      description: '',
      category: 'Competitive',
      sortOrder: 0
    }
  })

  // Create mutation
  const createMutation = api.subjects.create.useMutation({
    onSuccess: () => {
      setSuccessMsg('Subject module created successfully!')
      reset()
      utils.subjects.list.invalidate()
      setTimeout(() => setSuccessMsg(null), 4000)
    },
    onError: (err) => {
      setErrorMsg(err.message || 'Error occurred while creating subject.')
      setTimeout(() => setErrorMsg(null), 4000)
    }
  })

  // Delete mutation
  const deleteMutation = api.subjects.delete.useMutation({
    onSuccess: () => {
      setSuccessMsg('Subject module deleted successfully.')
      utils.subjects.list.invalidate()
      setTimeout(() => setSuccessMsg(null), 4000)
    },
    onError: (err) => {
      setErrorMsg(err.message || 'Error occurred while deleting subject.')
      setTimeout(() => setErrorMsg(null), 4000)
    }
  })

  const onSubmit = (data: SubjectFormValues) => {
    createMutation.mutate(data)
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this subject? This will cascade and delete all associated papers/questions!')) {
      deleteMutation.mutate({ id })
    }
  }

  return (
    <div className="space-y-10">
      {/* Header Profile */}
      <div className="space-y-2">
        <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">Syllabus Subjects</h1>
        <p className="text-white/40 text-sm font-light">
          Create, edit, and organize examination subject structures for Rajasthan REET, RPSC, and SI categories.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form: Add subject */}
        <div className="lg:col-span-4">
          <div className="bg-bg-surface border border-white/[0.06] rounded-xl p-6 space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-white/[0.06]">
              <FolderPlus size={18} className="text-accent" />
              <h2 className="font-display font-semibold text-sm uppercase tracking-wider">Add Subject</h2>
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
                <label className="block text-xs font-semibold text-white/50 uppercase tracking-wide mb-2">Subject Name</label>
                <input
                  {...register('name')}
                  type="text"
                  placeholder="e.g. Environmental Studies"
                  className="w-full px-4 py-2.5 bg-bg-input border border-white/[0.08] focus:border-accent/40 rounded-lg text-sm text-white placeholder:text-white/20 focus:outline-none"
                />
                {errors.name && <p className="text-xs text-brand-coral mt-1.5">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/50 uppercase tracking-wide mb-2">Code</label>
                <input
                  {...register('code')}
                  type="text"
                  placeholder="e.g. REET-EVS"
                  className="w-full px-4 py-2.5 bg-bg-input border border-white/[0.08] focus:border-accent/40 rounded-lg text-sm text-white placeholder:text-white/20 focus:outline-none"
                />
                {errors.code && <p className="text-xs text-brand-coral mt-1.5">{errors.code.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/50 uppercase tracking-wide mb-2">Category</label>
                <select
                  {...register('category')}
                  className="w-full px-4 py-2.5 bg-bg-input border border-white/[0.08] focus:border-accent/40 rounded-lg text-sm text-white focus:outline-none cursor-pointer"
                >
                  <option value="Competitive">Competitive (REET / RPSC)</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Medical">Medical</option>
                  <option value="Arts">Arts</option>
                  <option value="Commerce">Commerce</option>
                </select>
                {errors.category && <p className="text-xs text-brand-coral mt-1.5">{errors.category.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/50 uppercase tracking-wide mb-2">Sort Order</label>
                <input
                  {...register('sortOrder', { valueAsNumber: true })}
                  type="number"
                  className="w-full px-4 py-2.5 bg-bg-input border border-white/[0.08] focus:border-accent/40 rounded-lg text-sm text-white focus:outline-none"
                />
                {errors.sortOrder && <p className="text-xs text-brand-coral mt-1.5">{errors.sortOrder.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/50 uppercase tracking-wide mb-2">Description</label>
                <textarea
                  {...register('description')}
                  rows={3}
                  placeholder="Subject syllabus framework details..."
                  className="w-full px-4 py-2.5 bg-bg-input border border-white/[0.08] focus:border-accent/40 rounded-lg text-sm text-white placeholder:text-white/20 focus:outline-none resize-none"
                />
                {errors.description && <p className="text-xs text-brand-coral mt-1.5">{errors.description.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-accent hover:bg-accent-hover text-white font-semibold rounded-lg text-sm transition"
              >
                {isSubmitting ? 'Creating...' : 'Create Subject'}
              </button>
            </form>
          </div>
        </div>

        {/* Right List: Display subjects */}
        <div className="lg:col-span-8">
          <div className="bg-bg-surface border border-white/[0.06] rounded-xl p-6 space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-white/[0.06]">
              <FolderOpen size={16} className="text-white/40" />
              <h2 className="font-display font-semibold text-sm uppercase tracking-wider text-white/60">Subject Directory</h2>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-white/5 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : !subjects || subjects.length === 0 ? (
              <div className="text-center py-12 text-xs text-white/30 space-y-2">
                <BookOpen className="mx-auto opacity-35" size={32} />
                <p>No subjects found. Create your first subject using the form.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {subjects.map((sub) => (
                  <div key={sub.id} className="p-4 rounded-xl border border-white/[0.04] bg-bg-base/20 flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-[9px] font-semibold text-accent/80 bg-accent/10 px-2 py-0.5 rounded-full uppercase border border-accent/20 tracking-wider">
                        {sub.category}
                      </span>
                      <h4 className="font-display font-bold text-sm text-white/95 mt-1">{sub.name}</h4>
                      <p className="text-xs text-white/40 leading-relaxed font-light">{sub.description || 'No description provided.'}</p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs font-mono text-white/35 bg-white/5 border border-white/10 px-2 py-1 rounded">
                        {sub.code}
                      </span>
                      <button
                        onClick={() => handleDelete(sub.id)}
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
