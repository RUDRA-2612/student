'use client'

import { useState } from 'react'
import { api } from '@/lib/trpc/react'
import { useForm } from 'react-hook-form'
import { 
  Map, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  PlusCircle, 
  ListOrdered,
  Sparkles
} from 'lucide-react'

type MilestoneInput = {
  title: string
  description: string
  order: number
}

type RoadmapFormValues = {
  title: string
  description: string
  category: string
  isPublished: boolean
}

export default function AdminRoadmaps() {
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [milestones, setMilestones] = useState<MilestoneInput[]>([
    { title: 'Fundamentals', description: 'Get started with base concepts.', order: 0 }
  ])

  const utils = api.useUtils()
  const { data: roadmaps, isLoading } = api.roadmaps.list.useQuery()

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<RoadmapFormValues>({
    defaultValues: {
      title: '',
      description: '',
      category: 'Placement',
      isPublished: true
    }
  })

  const createMutation = api.roadmaps.create.useMutation({
    onSuccess: () => {
      setSuccessMsg('Academic Roadmap published successfully!')
      reset()
      setMilestones([{ title: 'Fundamentals', description: 'Get started with base concepts.', order: 0 }])
      utils.roadmaps.list.invalidate()
      setTimeout(() => setSuccessMsg(null), 4000)
    },
    onError: (err) => {
      setErrorMsg(err.message || 'Error occurred while creating roadmap.')
      setTimeout(() => setErrorMsg(null), 4000)
    }
  })

  const deleteMutation = api.roadmaps.delete.useMutation({
    onSuccess: () => {
      setSuccessMsg('Roadmap deleted successfully.')
      utils.roadmaps.list.invalidate()
      setTimeout(() => setSuccessMsg(null), 4000)
    },
    onError: (err) => {
      setErrorMsg(err.message || 'Error occurred while deleting roadmap.')
      setTimeout(() => setErrorMsg(null), 4000)
    }
  })

  const handleAddMilestone = () => {
    setMilestones([...milestones, { title: '', description: '', order: milestones.length }])
  }

  const handleRemoveMilestone = (index: number) => {
    setMilestones(milestones.filter((_, i) => i !== index).map((m, idx) => ({ ...m, order: idx })))
  }

  const handleMilestoneChange = (index: number, field: keyof MilestoneInput, value: string | number) => {
    const updated = [...milestones]
    updated[index] = { ...updated[index], [field]: value }
    setMilestones(updated)
  }

  const onSubmit = (data: RoadmapFormValues) => {
    createMutation.mutate({
      ...data,
      milestones: milestones.map(m => ({
        ...m,
        resources: [],
        checkpoints: []
      }))
    })
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this roadmap? This will delete all its milestones.')) {
      deleteMutation.mutate({ id })
    }
  }

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">Academic Roadmaps Architect</h1>
        <p className="text-white/40 text-sm font-light">
          Design career-oriented pathways like DSA sheets, Placement guides, or AI/ML specializations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Designer Panel */}
        <div className="lg:col-span-6">
          <div className="bg-bg-surface border border-white/[0.06] rounded-xl p-6 space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-white/[0.06]">
              <Sparkles size={18} className="text-accent" />
              <h2 className="font-display font-semibold text-sm uppercase tracking-wider">Design Roadmap</h2>
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

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="form-label">Roadmap Title</label>
                  <input
                    {...register('title', { required: 'Title is required' })}
                    type="text"
                    placeholder="e.g. Fullstack Web Development Guide"
                    className="form-input"
                  />
                  {errors.title && <p className="text-xs text-brand-coral mt-1.5">{errors.title.message}</p>}
                </div>

                <div>
                  <label className="form-label">Category</label>
                  <input
                    {...register('category', { required: 'Category is required' })}
                    type="text"
                    placeholder="e.g. Web Dev, DSA, AI/ML"
                    className="form-input"
                  />
                  {errors.category && <p className="text-xs text-brand-coral mt-1.5">{errors.category.message}</p>}
                </div>

                <div>
                  <label className="form-label">Roadmap Description</label>
                  <textarea
                    {...register('description', { required: 'Description is required' })}
                    rows={2}
                    placeholder="Provide overview details..."
                    className="form-input resize-none"
                  />
                  {errors.description && <p className="text-xs text-brand-coral mt-1.5">{errors.description.message}</p>}
                </div>

                <div className="flex items-center gap-3 py-1">
                  <input
                    {...register('isPublished')}
                    type="checkbox"
                    id="isPublished"
                    className="w-4 h-4 accent-accent cursor-pointer"
                  />
                  <label htmlFor="isPublished" className="text-xs text-white/60 cursor-pointer uppercase tracking-wider font-semibold">Publish Immediately</label>
                </div>
              </div>

              {/* Milestones dynamic builder */}
              <div className="space-y-4 pt-4 border-t border-white/[0.06]">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-white/60 flex items-center gap-1.5">
                    <ListOrdered size={14} /> Milestones
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddMilestone}
                    className="px-2.5 py-1 rounded bg-white/5 border border-white/10 hover:bg-white/10 text-[10px] text-white/70 flex items-center gap-1 transition"
                  >
                    <PlusCircle size={10} /> Add Milestone
                  </button>
                </div>

                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                  {milestones.map((m, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-bg-base/30 border border-white/[0.04] space-y-3 relative group">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-mono text-accent">Milestone #{idx + 1}</span>
                        {milestones.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveMilestone(idx)}
                            className="text-white/20 hover:text-brand-coral transition"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        placeholder="Milestone Title"
                        value={m.title}
                        onChange={(e) => handleMilestoneChange(idx, 'title', e.target.value)}
                        className="form-input py-2"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Brief description of goals/objectives"
                        value={m.description}
                        onChange={(e) => handleMilestoneChange(idx, 'description', e.target.value)}
                        className="form-input py-2"
                        required
                      />
                    </div>
                  ))}
                </div>
              </div>

              <button type="submit" disabled={isSubmitting} className="w-full btn-primary py-3">
                {isSubmitting ? 'Creating...' : 'Publish Roadmap'}
              </button>
            </form>
          </div>
        </div>

        {/* Directory Panel */}
        <div className="lg:col-span-6">
          <div className="bg-bg-surface border border-white/[0.06] rounded-xl p-6 space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-white/[0.06]">
              <Map size={16} className="text-white/40" />
              <h2 className="font-display font-semibold text-sm uppercase tracking-wider text-white/60">Active Roadmap Catalog</h2>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-white/5 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : !roadmaps || roadmaps.length === 0 ? (
              <div className="text-center py-12 text-xs text-white/30 space-y-2">
                <Map className="mx-auto opacity-35" size={32} />
                <p>No roadmaps found. Create your first career roadmap.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {roadmaps.map((r) => (
                  <div key={r.id} className="p-4 rounded-xl border border-white/[0.04] bg-bg-base/20 flex items-center justify-between gap-4 animate-fade-in">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[9px] font-semibold text-accent/80 bg-accent/10 px-2 py-0.5 rounded-full border border-accent/20">
                          {r.category}
                        </span>
                        <span className="text-[9px] font-semibold text-white/40 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                          {r.milestones.length} Milestones
                        </span>
                      </div>
                      <h4 className="font-display font-bold text-sm text-white/95 mt-1">{r.title}</h4>
                      <p className="text-xs text-white/40 leading-relaxed font-light">{r.description || 'No description.'}</p>
                    </div>

                    <div className="shrink-0">
                      <button
                        onClick={() => handleDelete(r.id)}
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
