'use client'

import { useState } from 'react'
import { api } from '@/lib/trpc/react'
import { useForm } from 'react-hook-form'
import { 
  BookOpen, 
  History, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeftRight,
  FileText
} from 'lucide-react'

type SyllabusFormValues = {
  subjectId: string
  fileUrl: string
  changesSummary: string
  unit1: string
  unit2: string
  unit3: string
  unit4: string
  unit5: string
}

export default function AdminSyllabus() {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [editorMode, setEditorMode] = useState<'upload' | 'manual'>('upload')

  const utils = api.useUtils()

  // Queries
  const { data: subjects } = api.subjects.list.useQuery({ isActive: false })
  const { data: subjectDetails, isLoading: detailsLoading } = api.subjects.byId.useQuery(
    { id: selectedSubjectId ?? '' },
    { enabled: !!selectedSubjectId }
  )

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<SyllabusFormValues>({
    defaultValues: {
      subjectId: '',
      fileUrl: '',
      changesSummary: '',
      unit1: '',
      unit2: '',
      unit3: '',
      unit4: '',
      unit5: ''
    }
  })

  // Mutations
  const createSyllabusMutation = api.syllabus.create.useMutation({
    onSuccess: () => {
      setSuccessMsg('Syllabus version successfully updated!')
      reset({
        subjectId: selectedSubjectId || '',
        fileUrl: '',
        changesSummary: '',
        unit1: '',
        unit2: '',
        unit3: '',
        unit4: '',
        unit5: ''
      })
      if (selectedSubjectId) {
        utils.subjects.byId.invalidate({ id: selectedSubjectId })
        utils.syllabus.history.invalidate({ subjectId: selectedSubjectId })
      }
      setTimeout(() => setSuccessMsg(null), 4000)
    },
    onError: (err) => {
      setErrorMsg(err.message || 'Failed to update syllabus.')
      setTimeout(() => setErrorMsg(null), 4000)
    }
  })

  const restoreMutation = api.syllabus.restore.useMutation({
    onSuccess: () => {
      setSuccessMsg('Syllabus version restored successfully!')
      if (selectedSubjectId) {
        utils.subjects.byId.invalidate({ id: selectedSubjectId })
        utils.syllabus.history.invalidate({ subjectId: selectedSubjectId })
      }
      setTimeout(() => setSuccessMsg(null), 4000)
    },
    onError: (err) => {
      setErrorMsg(err.message || 'Failed to restore version.')
      setTimeout(() => setErrorMsg(null), 4000)
    }
  })

  const onSubmit = (data: SyllabusFormValues) => {
    if (!selectedSubjectId) return

    let manualContent = null
    if (editorMode === 'manual') {
      manualContent = {
        units: [
          { name: 'Unit I', details: data.unit1 },
          { name: 'Unit II', details: data.unit2 },
          { name: 'Unit III', details: data.unit3 },
          { name: 'Unit IV', details: data.unit4 },
          { name: 'Unit V', details: data.unit5 },
        ].filter(u => u.details.trim().length > 0)
      }
    }

    createSyllabusMutation.mutate({
      subjectId: selectedSubjectId,
      fileUrl: editorMode === 'upload' ? data.fileUrl : undefined,
      changesSummary: data.changesSummary,
      manualContent: manualContent || undefined,
    })
  }

  const handleRestore = (versionId: string) => {
    if (confirm('Are you sure you want to restore the syllabus to this version?')) {
      restoreMutation.mutate({ id: versionId })
    }
  }

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">Syllabus versioning</h1>
        <p className="text-white/40 text-sm font-light">
          Manage, upload PDFs, and manually break down unit-wise course structures with full revision history.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Subject selector */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-bg-surface border border-white/[0.06] rounded-xl p-6 space-y-4">
            <label className="form-label">Select Subject</label>
            <select
              value={selectedSubjectId ?? ''}
              onChange={(e) => setSelectedSubjectId(e.target.value || null)}
              className="form-input cursor-pointer"
            >
              <option value="">Choose a subject...</option>
              {subjects?.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name} ({sub.code})
                </option>
              ))}
            </select>
          </div>

          {selectedSubjectId && subjectDetails && (
            <div className="bg-bg-surface border border-white/[0.06] rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-white/[0.06]">
                <History size={16} className="text-accent" />
                <h3 className="font-display font-semibold text-xs uppercase tracking-wider">Revision History</h3>
              </div>

              {detailsLoading ? (
                <p className="text-xs text-white/30">Loading history...</p>
              ) : !subjectDetails.syllabusVersions || subjectDetails.syllabusVersions.length === 0 ? (
                <p className="text-xs text-white/30">No previous versions.</p>
              ) : (
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {subjectDetails.syllabusVersions.map((v: any) => (
                    <div key={v.id} className="p-3 bg-bg-base/30 rounded-lg border border-white/[0.04] text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-accent">Version {v.version}</span>
                        <span className="text-[10px] text-white/20">{new Date(v.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-white/50">{v.changesSummary}</p>
                      {v.version !== subjectDetails.syllabusVersion && (
                        <button
                          onClick={() => handleRestore(v.id)}
                          className="text-[10px] text-accent/80 hover:text-accent font-semibold flex items-center gap-1 transition"
                        >
                          <ArrowLeftRight size={10} /> Restore this version
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Syllabus Editor / Uploader */}
        <div className="lg:col-span-8">
          {!selectedSubjectId ? (
            <div className="h-64 rounded-xl border border-dashed border-white/[0.08] flex flex-col items-center justify-center text-center p-6 text-white/20 space-y-2">
              <BookOpen size={36} className="opacity-40" />
              <p className="text-sm">Please select a subject from the left column to configure its syllabus.</p>
            </div>
          ) : (
            <div className="bg-bg-surface border border-white/[0.06] rounded-xl p-6 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <FileText size={18} className="text-accent" />
                  <h2 className="font-display font-semibold text-sm uppercase tracking-wider">Configure Syllabus</h2>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditorMode('upload')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                      editorMode === 'upload' 
                        ? 'bg-accent/10 border-accent/20 text-accent' 
                        : 'bg-white/5 border-white/10 text-white/40'
                    }`}
                  >
                    File Link
                  </button>
                  <button
                    onClick={() => setEditorMode('manual')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                      editorMode === 'manual' 
                        ? 'bg-accent/10 border-accent/20 text-accent' 
                        : 'bg-white/5 border-white/10 text-white/40'
                    }`}
                  >
                    Manual Entry
                  </button>
                </div>
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
                {editorMode === 'upload' ? (
                  <div>
                    <label className="form-label">Syllabus Document Link (PDF)</label>
                    <div className="relative">
                      <input
                        {...register('fileUrl', { required: editorMode === 'upload' ? 'URL is required' : false })}
                        type="url"
                        placeholder="https://example.com/syllabus.pdf"
                        className="form-input"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="form-label">Unit I Details</label>
                      <textarea {...register('unit1')} rows={2} className="form-input resize-none" placeholder="Topics for Unit 1..." />
                    </div>
                    <div>
                      <label className="form-label">Unit II Details</label>
                      <textarea {...register('unit2')} rows={2} className="form-input resize-none" placeholder="Topics for Unit 2..." />
                    </div>
                    <div>
                      <label className="form-label">Unit III Details</label>
                      <textarea {...register('unit3')} rows={2} className="form-input resize-none" placeholder="Topics for Unit 3..." />
                    </div>
                    <div>
                      <label className="form-label">Unit IV Details</label>
                      <textarea {...register('unit4')} rows={2} className="form-input resize-none" placeholder="Topics for Unit 4..." />
                    </div>
                    <div>
                      <label className="form-label">Unit V Details</label>
                      <textarea {...register('unit5')} rows={2} className="form-input resize-none" placeholder="Topics for Unit 5..." />
                    </div>
                  </div>
                )}

                <div>
                  <label className="form-label">Version Modification Log</label>
                  <input
                    {...register('changesSummary', { required: 'Changes summary is required' })}
                    type="text"
                    placeholder="e.g. Added Unit-wise breakdown & updated lecture hours"
                    className="form-input"
                  />
                  {errors.changesSummary && <p className="text-xs text-brand-coral mt-1.5">{errors.changesSummary.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full btn-primary"
                >
                  {isSubmitting ? 'Updating...' : 'Publish Syllabus Version'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
