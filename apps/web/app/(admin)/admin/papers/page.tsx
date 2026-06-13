'use client'

import { useState } from 'react'
import { api } from '@/lib/trpc/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { PaperCreateSchema } from '@examedge/validators'
import { useUploadThing } from '@/lib/uploadthing'
import { z } from 'zod'
import { 
  FileText, 
  Trash2, 
  Plus, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Download
} from 'lucide-react'

// Form schema extending standard fields with client file field
const ClientPaperSchema = PaperCreateSchema.extend({
  tagInput: z.string().optional()
})

type PaperFormValues = z.infer<typeof ClientPaperSchema>

export default function AdminPapers() {
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const utils = api.useUtils()

  // Fetch data
  const { data: subjects } = api.subjects.list.useQuery({ isActive: true })
  const { data: listData, isLoading } = api.papers.list.useQuery({ page: 1, limit: 30 })

  // Form hook
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<PaperFormValues>({
    resolver: zodResolver(ClientPaperSchema),
    defaultValues: {
      title: '',
      subjectId: '',
      year: new Date().getFullYear(),
      examType: 'MOCK',
      university: 'Board of Secondary Education Rajasthan (BSER)',
      difficulty: 'MEDIUM',
      videoUrl: '',
      tagInput: '',
      pdfUrl: '',
      pdfKey: ''
    }
  })

  // UploadThing hook
  const { startUpload, isUploading } = useUploadThing('pdfUploader', {
    onClientUploadComplete: (res) => {
      if (res && res[0]) {
        setValue('pdfUrl', res[0].url)
        setValue('pdfKey', res[0].key)
        setSuccessMsg('PDF uploaded successfully! Click Create to save.')
        setTimeout(() => setSuccessMsg(null), 3000)
      }
    },
    onUploadError: (err) => {
      setErrorMsg(`Upload failed: ${err.message}`)
      setTimeout(() => setErrorMsg(null), 3000)
    }
  })

  // Mutations
  const createMutation = api.papers.create.useMutation({
    onSuccess: () => {
      setSuccessMsg('Paper entry saved successfully!')
      reset()
      setSelectedFile(null)
      utils.papers.list.invalidate()
      setTimeout(() => setSuccessMsg(null), 4000)
    },
    onError: (err) => {
      setErrorMsg(err.message || 'Error saving paper details.')
      setTimeout(() => setErrorMsg(null), 4000)
    }
  })

  const deleteMutation = api.papers.delete.useMutation({
    onSuccess: () => {
      setSuccessMsg('Paper deleted successfully.')
      utils.papers.list.invalidate()
      setTimeout(() => setSuccessMsg(null), 4000)
    },
    onError: (err) => {
      setErrorMsg(err.message || 'Failed to delete paper.')
      setTimeout(() => setErrorMsg(null), 4000)
    }
  })

  // Handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleUploadClick = async () => {
    if (!selectedFile) return
    setErrorMsg(null)
    await startUpload([selectedFile])
  }

  const onSubmit = (data: PaperFormValues) => {
    // Format comma separated tags to array
    const tagsArray = data.tagInput
      ? data.tagInput.split(',').map(tag => tag.trim()).filter(Boolean)
      : []

    const payload = {
      title: data.title,
      subjectId: data.subjectId,
      year: Number(data.year),
      examType: data.examType as any,
      university: data.university,
      difficulty: data.difficulty as any,
      pdfUrl: data.pdfUrl || null,
      pdfKey: data.pdfKey || null,
      videoUrl: data.videoUrl || null,
      tags: tagsArray
    }

    createMutation.mutate(payload)
  }

  const handleDelete = (id: string) => {
    if (confirm('Delete this paper? This will also remove solutions and index fields.')) {
      deleteMutation.mutate({ id })
    }
  }

  return (
    <div className="space-y-10">
      {/* Header Profile */}
      <div className="space-y-2">
        <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">Manage Examination Papers</h1>
        <p className="text-white/40 text-sm font-light">
          Upload PDF previous years question papers (PYQs), configure mock metadata, and trigger Algolia text indexing.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left pane: Create Paper Form */}
        <div className="lg:col-span-5">
          <div className="bg-bg-surface border border-white/[0.06] rounded-xl p-6 space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-white/[0.06]">
              <Plus size={18} className="text-accent" />
              <h2 className="font-display font-semibold text-sm uppercase tracking-wider">Publish Paper</h2>
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
                <label className="block text-xs font-semibold text-white/50 uppercase tracking-wide mb-2">Paper Title</label>
                <input
                  {...register('title')}
                  type="text"
                  placeholder="e.g. REET 2022 Level 1 Child Development"
                  className="w-full px-4 py-2.5 bg-bg-input border border-white/[0.08] focus:border-accent/40 rounded-lg text-sm text-white placeholder:text-white/20 focus:outline-none"
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
                    <option value="">Select Subject...</option>
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

              {/* Tag input */}
              <div>
                <label className="block text-xs font-semibold text-white/50 uppercase tracking-wide mb-2">Tags (Comma Separated)</label>
                <input
                  {...register('tagInput')}
                  type="text"
                  placeholder="REET, Level 1, 2022, Pedagogy"
                  className="w-full px-4 py-2.5 bg-bg-input border border-white/[0.08] focus:border-accent/40 rounded-lg text-sm text-white placeholder:text-white/20 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/50 uppercase tracking-wide mb-2">Video Analysis URL (Optional)</label>
                <input
                  {...register('videoUrl')}
                  type="url"
                  placeholder="https://youtube.com/watch?v=..."
                  className="w-full px-4 py-2.5 bg-bg-input border border-white/[0.08] focus:border-accent/40 rounded-lg text-sm text-white placeholder:text-white/20 focus:outline-none"
                />
              </div>

              {/* PDF file uploader */}
              <div className="border border-dashed border-white/10 rounded-lg p-4 bg-bg-base/30 space-y-3">
                <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">Upload Question PDF</p>
                <div className="flex gap-2">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    id="pdf-file-selector"
                  />
                  <label
                    htmlFor="pdf-file-selector"
                    className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-semibold cursor-pointer text-center hover:bg-white/10 text-white flex items-center justify-center gap-1.5"
                  >
                    <Upload size={12} /> {selectedFile ? selectedFile.name : 'Select PDF File'}
                  </label>
                  {selectedFile && (
                    <button
                      type="button"
                      onClick={handleUploadClick}
                      disabled={isUploading}
                      className="px-4 py-2 bg-accent hover:bg-accent-hover disabled:bg-accent/40 text-white rounded-lg text-xs font-semibold"
                    >
                      {isUploading ? 'Uploading...' : 'Upload'}
                    </button>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-accent hover:bg-accent-hover text-white font-semibold rounded-lg text-sm transition"
              >
                Publish Paper Guide
              </button>
            </form>
          </div>
        </div>

        {/* Right pane: Directory list */}
        <div className="lg:col-span-7">
          <div className="bg-bg-surface border border-white/[0.06] rounded-xl p-6 space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-white/[0.06]">
              <FileText size={16} className="text-white/40" />
              <h2 className="font-display font-semibold text-sm uppercase tracking-wider text-white/60">Published Papers Index</h2>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-white/5 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : !listData?.papers || listData.papers.length === 0 ? (
              <div className="text-center py-12 text-xs text-white/30">
                No papers found. Add paper metadata details.
              </div>
            ) : (
              <div className="space-y-3">
                {listData.papers.map((paper: any) => (
                  <div key={paper.id} className="p-4 rounded-xl border border-white/[0.04] bg-bg-base/20 flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-mono text-white/40 bg-white/5 px-2 py-0.5 rounded border border-white/10">{paper.year}</span>
                        <span className="text-[9px] text-white/40 uppercase">{paper.examType}</span>
                      </div>
                      <h4 className="font-display font-bold text-sm text-white/95 mt-1 leading-tight">{paper.title}</h4>
                      <p className="text-[10px] text-white/40">{paper.subject?.name || 'Subject'}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {paper.pdfUrl && (
                        <a
                          href={paper.pdfUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 border border-white/10 flex items-center justify-center transition"
                        >
                          <Download size={12} />
                        </a>
                      )}
                      <button
                        onClick={() => handleDelete(paper.id)}
                        className="w-8 h-8 rounded-lg bg-brand-coral/5 hover:bg-brand-coral/10 text-brand-coral border border-brand-coral/15 flex items-center justify-center transition"
                      >
                        <Trash2 size={12} />
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
