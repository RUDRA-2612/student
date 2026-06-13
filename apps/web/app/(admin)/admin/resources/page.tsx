'use client'

import { useState } from 'react'
import { api } from '@/lib/trpc/react'
import { useForm } from 'react-hook-form'
import { 
  Video, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  PlusCircle, 
  ExternalLink
} from 'lucide-react'

type ResourceFormValues = {
  title: string
  type: 'NOTES' | 'PPT' | 'LAB_MANUAL' | 'CHEAT_SHEET' | 'YOUTUBE_PLAYLIST' | 'VIDEO' | 'EXTERNAL'
  url: string
  subjectId: string
}

export default function AdminResources() {
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [filterSubjectId, setFilterSubjectId] = useState<string>('')

  const utils = api.useUtils()

  // Queries
  const { data: subjects } = api.subjects.list.useQuery({ isActive: false })
  const { data: resources, isLoading } = api.resources.list.useQuery(
    filterSubjectId ? { subjectId: filterSubjectId } : undefined
  )

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ResourceFormValues>({
    defaultValues: {
      title: '',
      type: 'NOTES',
      url: '',
      subjectId: ''
    }
  })

  // Mutations
  const createMutation = api.resources.create.useMutation({
    onSuccess: () => {
      setSuccessMsg('Study resource added successfully!')
      reset({
        title: '',
        type: 'NOTES',
        url: '',
        subjectId: filterSubjectId || ''
      })
      utils.resources.list.invalidate()
      setTimeout(() => setSuccessMsg(null), 4000)
    },
    onError: (err) => {
      setErrorMsg(err.message || 'Error occurred while creating resource.')
      setTimeout(() => setErrorMsg(null), 4000)
    }
  })

  const deleteMutation = api.resources.delete.useMutation({
    onSuccess: () => {
      setSuccessMsg('Study resource deleted successfully.')
      utils.resources.list.invalidate()
      setTimeout(() => setSuccessMsg(null), 4000)
    },
    onError: (err) => {
      setErrorMsg(err.message || 'Error occurred while deleting resource.')
      setTimeout(() => setErrorMsg(null), 4000)
    }
  })

  const onSubmit = (data: ResourceFormValues) => {
    createMutation.mutate(data)
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this study resource?')) {
      deleteMutation.mutate({ id })
    }
  }

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">Study Resources Manager</h1>
        <p className="text-white/40 text-sm font-light">
          Upload and organize course notes, PPT lecture slides, lab manuals, cheat sheets, and YouTube video playlists.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Add Resource Form */}
        <div className="lg:col-span-4">
          <div className="bg-bg-surface border border-white/[0.06] rounded-xl p-6 space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-white/[0.06]">
              <PlusCircle size={18} className="text-accent" />
              <h2 className="font-display font-semibold text-sm uppercase tracking-wider">Add Resource</h2>
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
                  placeholder="e.g. Unit 1 Lecture Notes - OOP"
                  className="form-input"
                />
                {errors.title && <p className="text-xs text-brand-coral mt-1.5">{errors.title.message}</p>}
              </div>

              <div>
                <label className="form-label">Subject</label>
                <select
                  {...register('subjectId', { required: 'Subject selection is required' })}
                  className="form-input cursor-pointer"
                >
                  <option value="">Select subject...</option>
                  {subjects?.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name} ({sub.code})
                    </option>
                  ))}
                </select>
                {errors.subjectId && <p className="text-xs text-brand-coral mt-1.5">{errors.subjectId.message}</p>}
              </div>

              <div>
                <label className="form-label">Resource Type</label>
                <select
                  {...register('type')}
                  className="form-input cursor-pointer"
                >
                  <option value="NOTES">Notes (PDF/DOC)</option>
                  <option value="PPT">PPT Slides</option>
                  <option value="LAB_MANUAL">Lab Manual</option>
                  <option value="CHEAT_SHEET">Cheat Sheet / Quick Reference</option>
                  <option value="YOUTUBE_PLAYLIST">YouTube Playlist</option>
                  <option value="VIDEO">Video Lecture Link</option>
                  <option value="EXTERNAL">External Web Link</option>
                </select>
              </div>

              <div>
                <label className="form-label">Resource URL</label>
                <input
                  {...register('url', { required: 'URL is required' })}
                  type="url"
                  placeholder="https://example.com/document.pdf"
                  className="form-input"
                />
                {errors.url && <p className="text-xs text-brand-coral mt-1.5">{errors.url.message}</p>}
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
              <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">Filter Subject</span>
              <select
                value={filterSubjectId}
                onChange={(e) => setFilterSubjectId(e.target.value)}
                className="px-3 py-1.5 bg-bg-input border border-white/[0.08] focus:border-accent/40 rounded-lg text-xs text-white focus:outline-none cursor-pointer"
              >
                <option value="">All Subjects</option>
                {subjects?.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name} ({sub.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-bg-surface border border-white/[0.06] rounded-xl p-6 space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-white/[0.06]">
              <Video size={16} className="text-white/40" />
              <h2 className="font-display font-semibold text-sm uppercase tracking-wider text-white/60">Study Resource Catalog</h2>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-white/5 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : !resources || resources.length === 0 ? (
              <div className="text-center py-12 text-xs text-white/30 space-y-2">
                <Video className="mx-auto opacity-35" size={32} />
                <p>No study resources found. Create one using the form.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {resources.map((res) => (
                  <div key={res.id} className="p-4 rounded-xl border border-white/[0.04] bg-bg-base/20 flex items-center justify-between gap-4 animate-fade-in">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-semibold text-accent/80 bg-accent/10 px-2 py-0.5 rounded-full border border-accent/20">
                          {res.type}
                        </span>
                        <span className="text-[9px] font-mono text-white/40">
                          {res.subject?.code}
                        </span>
                      </div>
                      <h4 className="font-display font-bold text-sm text-white/95 mt-1">{res.title}</h4>
                      <a 
                        href={res.url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-[10px] text-accent/80 hover:text-accent font-semibold flex items-center gap-0.5 w-fit"
                      >
                        Visit Link <ExternalLink size={10} />
                      </a>
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
