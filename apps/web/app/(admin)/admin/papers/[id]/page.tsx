'use client'

import { useParams } from 'next/navigation'
import { api } from '@/lib/trpc/react'
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { PaperCreateSchema } from '@examedge/validators'
import { z } from 'zod'
import { 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  Save,
  ExternalLink
} from 'lucide-react'
import Link from 'next/link'

const EditPaperSchema = PaperCreateSchema.extend({
  tagInput: z.string().optional()
})

type EditPaperFormValues = z.infer<typeof EditPaperSchema>

export default function AdminEditPaper() {
  const { id } = useParams() as { id: string }

  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const utils = api.useUtils()

  // Fetch subject list
  const { data: subjects } = api.subjects.list.useQuery({ isActive: true })

  // Fetch Paper details
  const { data: paper, isLoading, error } = api.papers.byId.useQuery({ id })

  // Form Hook
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<EditPaperFormValues>({
    resolver: zodResolver(EditPaperSchema)
  })

  // Set default values when paper details load
  useEffect(() => {
    if (paper) {
      setValue('title', paper.title)
      setValue('subjectId', paper.subjectId)
      setValue('year', paper.year)
      setValue('examType', paper.examType)
      setValue('university', paper.university)
      setValue('difficulty', paper.difficulty)
      setValue('videoUrl', paper.videoUrl || '')
      setValue('pdfUrl', paper.pdfUrl || '')
      setValue('pdfKey', paper.pdfKey || '')
      setValue('tagInput', paper.tags.map(t => t.name).join(', '))
    }
  }, [paper, setValue])

  // Update Mutation
  const updateMutation = api.papers.update.useMutation({
    onSuccess: () => {
      setSuccessMsg('Paper updated successfully!')
      utils.papers.byId.invalidate({ id })
      utils.papers.list.invalidate()
      setTimeout(() => setSuccessMsg(null), 4000)
    },
    onError: (err) => {
      setErrorMsg(err.message || 'Failed to update paper details.')
      setTimeout(() => setErrorMsg(null), 4000)
    }
  })

  const onSubmit = (data: EditPaperFormValues) => {
    const tagsArray = data.tagInput
      ? data.tagInput.split(',').map(t => t.trim()).filter(Boolean)
      : []

    const payload = {
      id,
      title: data.title,
      subjectId: data.subjectId,
      year: Number(data.year),
      examType: data.examType as any,
      university: data.university,
      difficulty: data.difficulty as any,
      videoUrl: data.videoUrl || null,
      pdfUrl: data.pdfUrl || null,
      pdfKey: data.pdfKey || null,
      tags: tagsArray
    }

    updateMutation.mutate(payload)
  }

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        <p className="text-white/40 text-xs font-mono">Fetching Paper profiles...</p>
      </div>
    )
  }

  if (error || !paper) {
    return (
      <div className="p-8 bg-bg-surface border border-white/[0.06] rounded-xl text-center space-y-4 max-w-sm mx-auto">
        <AlertCircle className="mx-auto text-brand-coral" size={32} />
        <h3 className="font-bold text-white">Paper Not Found</h3>
        <Link href="/admin/papers" className="inline-block px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-semibold">
          Return to directory
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Top breadcrumb */}
      <div>
        <Link 
          href="/admin/papers" 
          className="text-xs text-white/50 hover:text-white flex items-center gap-1.5 transition"
        >
          <ArrowLeft size={14} /> Back to Papers Directory
        </Link>
      </div>

      <div className="space-y-1">
        <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">Edit Paper Details</h1>
        <p className="text-white/40 text-sm font-light">
          Modify published metadata parameters, tags list, or video reference resources.
        </p>
      </div>

      <div className="bg-bg-surface border border-white/[0.06] rounded-xl p-6 md:p-8 max-w-2xl">
        {successMsg && (
          <div className="p-4 bg-brand-mint/10 border border-brand-mint/20 rounded-xl text-xs text-brand-mint flex items-start gap-2 mb-6">
            <CheckCircle2 className="shrink-0 mt-0.5" size={14} />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 bg-brand-coral/10 border border-brand-coral/20 rounded-xl text-xs text-brand-coral flex items-start gap-2 mb-6">
            <AlertCircle className="shrink-0 mt-0.5" size={14} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-white/50 uppercase tracking-wide mb-2">Paper Title</label>
            <input
              {...register('title')}
              type="text"
              className="w-full px-4 py-2.5 bg-bg-input border border-white/[0.08] focus:border-accent/40 rounded-lg text-sm text-white focus:outline-none"
            />
            {errors.title && <p className="text-xs text-brand-coral mt-1.5">{errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-wide mb-2">Subject</label>
              <select
                {...register('subjectId')}
                className="w-full px-4 py-2.5 bg-bg-input border border-white/[0.08] focus:border-accent/40 rounded-lg text-xs text-white focus:outline-none cursor-pointer"
              >
                {subjects?.map((sub) => (
                  <option key={sub.id} value={sub.id}>{sub.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-wide mb-2">Year</label>
              <input
                {...register('year', { valueAsNumber: true })}
                type="number"
                className="w-full px-4 py-2.5 bg-bg-input border border-white/[0.08] focus:border-accent/40 rounded-lg text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/50 uppercase tracking-wide mb-2">Exam Type</label>
            <select
              {...register('examType')}
              className="w-full px-4 py-2.5 bg-bg-input border border-white/[0.08] focus:border-accent/40 rounded-lg text-xs text-white focus:outline-none cursor-pointer"
            >
              <option value="MOCK">Mock Paper</option>
              <option value="COMPETITIVE">Competitive (REET/RPSC)</option>
              <option value="FINAL">Final</option>
              <option value="MIDTERM">Midterm</option>
              <option value="ASSIGNMENT">Assignment</option>
            </select>
          </div>

          <input type="hidden" {...register('difficulty')} />
          <input type="hidden" {...register('university')} />

          <div>
            <label className="block text-xs font-semibold text-white/50 uppercase tracking-wide mb-2">Tags (Comma Separated)</label>
            <input
              {...register('tagInput')}
              type="text"
              className="w-full px-4 py-2.5 bg-bg-input border border-white/[0.08] focus:border-accent/40 rounded-lg text-sm text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/50 uppercase tracking-wide mb-2">Video Analysis URL (Optional)</label>
            <input
              {...register('videoUrl')}
              type="url"
              className="w-full px-4 py-2.5 bg-bg-input border border-white/[0.08] focus:border-accent/40 rounded-lg text-sm text-white focus:outline-none"
            />
          </div>

          <div className="flex gap-4 pt-4 border-t border-white/[0.06]">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 bg-accent hover:bg-accent-hover text-white font-semibold rounded-lg text-sm transition flex items-center justify-center gap-1.5"
            >
              <Save size={16} /> {isSubmitting ? 'Saving Changes...' : 'Save Paper Profile'}
            </button>
            <Link
              href={`/papers/${id}`}
              className="px-5 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-lg text-sm transition flex items-center justify-center gap-1.5"
            >
              Preview Solutions <ExternalLink size={14} />
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
