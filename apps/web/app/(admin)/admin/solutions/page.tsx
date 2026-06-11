'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/trpc/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  Video, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Sparkles,
  HelpCircle
} from 'lucide-react'

const LocalSolutionSchema = z.object({
  paperId:     z.string().cuid(),
  content:     z.string().min(5, 'Solutions guide content must be at least 5 characters'),
  videoUrl:    z.string().url().or(z.literal('')).optional().nullable(),
  isPublished: z.boolean().default(true)
})

type SolutionFormValues = z.infer<typeof LocalSolutionSchema>

export default function AdminSolutions() {
  const [selectedPaperId, setSelectedPaperId] = useState('')
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const utils = api.useUtils()

  // Fetch papers list for selection
  const { data: papersData } = api.papers.list.useQuery({ page: 1, limit: 100 })
  
  // Fetch solution details for selected paper
  const { data: activeSolution, isLoading: solutionLoading, error: solutionError } = api.solutions.byPaperId.useQuery(
    { paperId: selectedPaperId },
    { enabled: !!selectedPaperId, retry: false }
  )

  // Form Hook
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<SolutionFormValues>({
    resolver: zodResolver(LocalSolutionSchema),
    defaultValues: {
      paperId: '',
      content: '',
      videoUrl: '',
      isPublished: true
    }
  })

  // Set selected paper in form state
  useEffect(() => {
    if (selectedPaperId) {
      setValue('paperId', selectedPaperId)
    }
  }, [selectedPaperId, setValue])

  // Populate form when active solution loads or reset when none exists
  useEffect(() => {
    if (activeSolution) {
      setValue('content', activeSolution.content)
      setValue('videoUrl', activeSolution.videoUrl || '')
      setValue('isPublished', activeSolution.isPublished)
    } else if (solutionError) {
      // Clear content to write a new one
      setValue('content', '')
      setValue('videoUrl', '')
      setValue('isPublished', true)
    }
  }, [activeSolution, solutionError, setValue])

  // Upsert mutation
  const upsertMutation = api.solutions.upsert.useMutation({
    onSuccess: () => {
      setSuccessMsg('Solutions guide saved successfully!')
      utils.solutions.byPaperId.invalidate({ paperId: selectedPaperId })
      setTimeout(() => setSuccessMsg(null), 4000)
    },
    onError: (err) => {
      setErrorMsg(err.message || 'Failed to save solutions guide.')
      setTimeout(() => setErrorMsg(null), 4000)
    }
  })

  const onSubmit = (data: SolutionFormValues) => {
    upsertMutation.mutate({
      paperId: data.paperId,
      content: data.content,
      videoUrl: data.videoUrl || null,
      isPublished: data.isPublished
    })
  }

  return (
    <div className="space-y-10">
      {/* Header Profile */}
      <div className="space-y-2">
        <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">Solutions Editor</h1>
        <p className="text-white/40 text-sm font-light">
          Draft study solutions, connect video analysis files, and publish guidelines for examination syllabus modules.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Selection and parameters */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-bg-surface border border-white/[0.06] rounded-xl p-6 space-y-5">
            <div className="flex items-center gap-2 pb-4 border-b border-white/[0.06]">
              <FileText size={18} className="text-accent" />
              <h2 className="font-display font-semibold text-sm uppercase tracking-wider">Select Paper</h2>
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-wide mb-2">Target Paper</label>
              <select
                value={selectedPaperId}
                onChange={(e) => setSelectedPaperId(e.target.value)}
                className="w-full px-4 py-2.5 bg-bg-input border border-white/[0.08] focus:border-accent/40 rounded-lg text-xs text-white focus:outline-none cursor-pointer"
              >
                <option value="">Choose a paper index...</option>
                {papersData?.papers.map((paper: any) => (
                  <option key={paper.id} value={paper.id}>
                    {paper.year} - {paper.title} ({paper.examType})
                  </option>
                ))}
              </select>
            </div>

            {selectedPaperId && (
              <div className="p-4 bg-bg-base/30 border border-white/[0.04] rounded-lg space-y-2 text-xs">
                <p className="font-semibold text-white/95">Solutions Status</p>
                {solutionLoading ? (
                  <p className="text-white/45">Checking database records...</p>
                ) : activeSolution ? (
                  <p className="text-brand-mint font-semibold flex items-center gap-1">
                    <CheckCircle2 size={12} /> Active guide published
                  </p>
                ) : (
                  <p className="text-brand-amber font-semibold flex items-center gap-1">
                    <HelpCircle size={12} /> No solutions guide drafted
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: Rich Content Editor form */}
        <div className="lg:col-span-8">
          {selectedPaperId ? (
            <div className="bg-bg-surface border border-white/[0.06] rounded-xl p-6 space-y-6">
              <div className="flex items-center gap-2 pb-4 border-b border-white/[0.06]">
                <Sparkles size={16} className="text-accent" />
                <h3 className="font-display font-semibold text-sm uppercase tracking-wider">Draft Solutions Content</h3>
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
                  <label className="block text-xs font-semibold text-white/50 uppercase tracking-wide mb-2">Video Solutions URL (Optional)</label>
                  <input
                    {...register('videoUrl')}
                    type="url"
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full px-4 py-2.5 bg-bg-input border border-white/[0.08] focus:border-accent/40 rounded-lg text-sm text-white placeholder:text-white/20 focus:outline-none"
                  />
                  {errors.videoUrl && <p className="text-xs text-brand-coral mt-1">{errors.videoUrl.message}</p>}
                </div>

                <div className="flex items-center gap-2 py-2">
                  <input
                    {...register('isPublished')}
                    type="checkbox"
                    id="is-solution-published"
                    className="w-4 h-4 bg-bg-input border border-white/[0.08] rounded cursor-pointer accent-accent"
                  />
                  <label htmlFor="is-solution-published" className="text-xs font-semibold text-white/70 cursor-pointer select-none">
                    Publish immediately (Make visible to student portal)
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/50 uppercase tracking-wide mb-2">Solutions Guide Text (Markdown / Content)</label>
                  <textarea
                    {...register('content')}
                    rows={12}
                    placeholder="Draft detailed, structured step-by-step explanations for each question item..."
                    className="w-full px-4 py-3 bg-bg-input border border-white/[0.08] focus:border-accent/40 rounded-lg text-sm text-white placeholder:text-white/20 focus:outline-none resize-none font-mono"
                  />
                  {errors.content && <p className="text-xs text-brand-coral mt-1">{errors.content.message}</p>}
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-accent hover:bg-accent-hover text-white font-semibold rounded-lg text-sm transition flex items-center justify-center gap-1.5"
                >
                  <Save size={16} /> Save Solution Details
                </button>
              </form>
            </div>
          ) : (
            <div className="p-12 bg-bg-surface border border-white/[0.06] rounded-xl text-center text-white/30 text-xs">
              <Video className="mx-auto opacity-35 mb-2" size={32} />
              Please select a paper from the list to start editing solutions.
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
