'use client'

import { useState } from 'react'
import { api } from '@/lib/trpc/react'
import { useForm } from 'react-hook-form'
import { 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  PlusCircle, 
  Compass,
  ToggleLeft,
  ToggleRight
} from 'lucide-react'

type CurriculumFormValues = {
  branch: string
  academicYear: string
  semester: number
  version: string
  fileUrl: string
  content: string
  isActive: boolean
}

export default function AdminCurriculum() {
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const utils = api.useUtils()
  const { data: curriculums, isLoading } = api.curriculum.list.useQuery()

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<CurriculumFormValues>({
    defaultValues: {
      branch: 'CSE',
      academicYear: '2025-2026',
      semester: 1,
      version: 'v1.0',
      fileUrl: '',
      content: '',
      isActive: true
    }
  })

  const createMutation = api.curriculum.create.useMutation({
    onSuccess: () => {
      setSuccessMsg('Curriculum created successfully!')
      reset()
      utils.curriculum.list.invalidate()
      setTimeout(() => setSuccessMsg(null), 4000)
    },
    onError: (err) => {
      setErrorMsg(err.message || 'Error occurred while creating curriculum.')
      setTimeout(() => setErrorMsg(null), 4000)
    }
  })

  const updateMutation = api.curriculum.update.useMutation({
    onSuccess: () => {
      setSuccessMsg('Curriculum status updated.')
      utils.curriculum.list.invalidate()
      setTimeout(() => setSuccessMsg(null), 4000)
    },
    onError: (err) => {
      setErrorMsg(err.message || 'Error occurred while updating curriculum.')
      setTimeout(() => setErrorMsg(null), 4000)
    }
  })

  const deleteMutation = api.curriculum.delete.useMutation({
    onSuccess: () => {
      setSuccessMsg('Curriculum deleted successfully.')
      utils.curriculum.list.invalidate()
      setTimeout(() => setSuccessMsg(null), 4000)
    },
    onError: (err) => {
      setErrorMsg(err.message || 'Error occurred while deleting curriculum.')
      setTimeout(() => setErrorMsg(null), 4000)
    }
  })

  const onSubmit = (data: CurriculumFormValues) => {
    createMutation.mutate(data)
  }

  const handleToggleActive = (id: string, currentStatus: boolean) => {
    updateMutation.mutate({ id, isActive: !currentStatus })
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this curriculum scheme?')) {
      deleteMutation.mutate({ id })
    }
  }

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">Curriculum Schemes</h1>
        <p className="text-white/40 text-sm font-light">
          Configure university branch-wide, year-wide, and semester-wise academic structures.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form panel */}
        <div className="lg:col-span-4">
          <div className="bg-bg-surface border border-white/[0.06] rounded-xl p-6 space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-white/[0.06]">
              <PlusCircle size={18} className="text-accent" />
              <h2 className="font-display font-semibold text-sm uppercase tracking-wider">Add Curriculum</h2>
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
                <label className="form-label">Branch/Department</label>
                <select {...register('branch')} className="form-input cursor-pointer">
                  <option value="CSE">Computer Science & Engineering (CSE)</option>
                  <option value="ECE">Electronics & Communication (ECE)</option>
                  <option value="ME">Mechanical Engineering (ME)</option>
                  <option value="CE">Civil Engineering (CE)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Semester</label>
                  <input
                    {...register('semester', { valueAsNumber: true, min: 1, max: 8 })}
                    type="number"
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">Version</label>
                  <input
                    {...register('version', { required: 'Version is required' })}
                    type="text"
                    placeholder="e.g. v2025"
                    className="form-input"
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Academic Year</label>
                <input
                  {...register('academicYear', { required: 'Academic Year is required' })}
                  type="text"
                  placeholder="e.g. 2025-2026"
                  className="form-input"
                />
              </div>

              <div>
                <label className="form-label">Document PDF URL</label>
                <input
                  {...register('fileUrl', { required: 'PDF URL is required' })}
                  type="url"
                  placeholder="https://example.com/curriculum.pdf"
                  className="form-input"
                />
              </div>

              <div>
                <label className="form-label">Scheme Description</label>
                <textarea
                  {...register('content')}
                  rows={3}
                  placeholder="Summary of course structure..."
                  className="form-input resize-none"
                />
              </div>

              <div className="flex items-center gap-3 py-2">
                <input
                  {...register('isActive')}
                  type="checkbox"
                  id="isActive"
                  className="w-4 h-4 accent-accent cursor-pointer"
                />
                <label htmlFor="isActive" className="text-xs text-white/60 cursor-pointer uppercase tracking-wider font-semibold">Mark Active Version</label>
              </div>

              <button type="submit" disabled={isSubmitting} className="w-full btn-primary">
                {isSubmitting ? 'Publishing...' : 'Publish Curriculum'}
              </button>
            </form>
          </div>
        </div>

        {/* Directory List */}
        <div className="lg:col-span-8">
          <div className="bg-bg-surface border border-white/[0.06] rounded-xl p-6 space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-white/[0.06]">
              <Compass size={16} className="text-white/40" />
              <h2 className="font-display font-semibold text-sm uppercase tracking-wider text-white/60">Curriculum catalog</h2>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-white/5 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : !curriculums || curriculums.length === 0 ? (
              <div className="text-center py-12 text-xs text-white/30 space-y-2">
                <Compass className="mx-auto opacity-35" size={32} />
                <p>No curriculums found. Publish a curriculum to get started.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {curriculums.map((curr) => (
                  <div key={curr.id} className="p-4 rounded-xl border border-white/[0.04] bg-bg-base/20 flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-semibold text-accent/80 bg-accent/10 px-2 py-0.5 rounded-full border border-accent/20">
                          {curr.branch}
                        </span>
                        <span className="text-[9px] font-semibold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                          Sem {curr.semester}
                        </span>
                        <span className={`text-[8px] font-semibold px-2 py-0.5 rounded-full border ${
                          curr.isActive 
                            ? 'bg-sage/10 text-sage border-sage/20' 
                            : 'bg-white/5 text-white/40 border-white/10'
                        }`}>
                          {curr.isActive ? 'ACTIVE' : 'ARCHIVED'}
                        </span>
                      </div>
                      <h4 className="font-display font-bold text-sm text-white/95 mt-1">
                        Curriculum Scheme {curr.version} ({curr.academicYear})
                      </h4>
                      <p className="text-xs text-white/40 leading-relaxed font-light">{curr.content || 'No description.'}</p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <button
                        onClick={() => handleToggleActive(curr.id, curr.isActive)}
                        className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 flex items-center justify-center transition border border-white/10"
                        title={curr.isActive ? "Deactivate" : "Activate"}
                      >
                        {curr.isActive ? <ToggleRight size={16} className="text-sage" /> : <ToggleLeft size={16} />}
                      </button>
                      <button
                        onClick={() => handleDelete(curr.id)}
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
