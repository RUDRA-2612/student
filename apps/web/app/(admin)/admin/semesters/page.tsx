'use client'

import { useState } from 'react'
import { api } from '@/lib/trpc/react'
import { useForm } from 'react-hook-form'
import { 
  Layers, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  PlusCircle, 
  ToggleLeft,
  ToggleRight
} from 'lucide-react'

type SemesterFormValues = {
  name: string
  academicYear: string
  isActive: boolean
  sortOrder: number
}

export default function AdminSemesters() {
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const utils = api.useUtils()
  const { data: semesters, isLoading } = api.semesters.list.useQuery()

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<SemesterFormValues>({
    defaultValues: {
      name: '',
      academicYear: '2025-2026',
      isActive: true,
      sortOrder: 0
    }
  })

  const createMutation = api.semesters.create.useMutation({
    onSuccess: () => {
      setSuccessMsg('Semester created successfully!')
      reset()
      utils.semesters.list.invalidate()
      setTimeout(() => setSuccessMsg(null), 4000)
    },
    onError: (err) => {
      setErrorMsg(err.message || 'Error occurred while creating semester.')
      setTimeout(() => setErrorMsg(null), 4000)
    }
  })

  const updateMutation = api.semesters.update.useMutation({
    onSuccess: () => {
      setSuccessMsg('Semester updated successfully.')
      utils.semesters.list.invalidate()
      setTimeout(() => setSuccessMsg(null), 4000)
    },
    onError: (err) => {
      setErrorMsg(err.message || 'Error occurred while updating semester.')
      setTimeout(() => setErrorMsg(null), 4000)
    }
  })

  const deleteMutation = api.semesters.delete.useMutation({
    onSuccess: () => {
      setSuccessMsg('Semester deleted successfully.')
      utils.semesters.list.invalidate()
      setTimeout(() => setSuccessMsg(null), 4000)
    },
    onError: (err) => {
      setErrorMsg(err.message || 'Error occurred while deleting semester.')
      setTimeout(() => setErrorMsg(null), 4000)
    }
  })

  const onSubmit = (data: SemesterFormValues) => {
    createMutation.mutate(data)
  }

  const handleToggleActive = (id: string, currentStatus: boolean) => {
    updateMutation.mutate({ id, isActive: !currentStatus })
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this semester? This will unlink all subjects!')) {
      deleteMutation.mutate({ id })
    }
  }

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">Semesters Management</h1>
        <p className="text-white/40 text-sm font-light">
          Organize academic periods (Semester 1 to 8) and assign subjects.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Add Semester Form */}
        <div className="lg:col-span-4">
          <div className="bg-bg-surface border border-white/[0.06] rounded-xl p-6 space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-white/[0.06]">
              <PlusCircle size={18} className="text-accent" />
              <h2 className="font-display font-semibold text-sm uppercase tracking-wider">Add Semester</h2>
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
                <label className="form-label">Semester Name</label>
                <input
                  {...register('name', { required: 'Name is required' })}
                  type="text"
                  placeholder="e.g. Semester 1"
                  className="form-input"
                />
                {errors.name && <p className="text-xs text-brand-coral mt-1.5">{errors.name.message}</p>}
              </div>

              <div>
                <label className="form-label">Academic Year</label>
                <input
                  {...register('academicYear', { required: 'Academic Year is required' })}
                  type="text"
                  placeholder="e.g. 2025-2026"
                  className="form-input"
                />
                {errors.academicYear && <p className="text-xs text-brand-coral mt-1.5">{errors.academicYear.message}</p>}
              </div>

              <div>
                <label className="form-label">Sort Order</label>
                <input
                  {...register('sortOrder', { valueAsNumber: true })}
                  type="number"
                  className="form-input"
                />
              </div>

              <div className="flex items-center gap-3 py-2">
                <input
                  {...register('isActive')}
                  type="checkbox"
                  id="isActive"
                  className="w-4 h-4 accent-accent cursor-pointer"
                />
                <label htmlFor="isActive" className="text-xs text-white/60 cursor-pointer uppercase tracking-wider font-semibold">Active Period</label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full btn-primary"
              >
                {isSubmitting ? 'Creating...' : 'Create Semester'}
              </button>
            </form>
          </div>
        </div>

        {/* Semesters List */}
        <div className="lg:col-span-8">
          <div className="bg-bg-surface border border-white/[0.06] rounded-xl p-6 space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-white/[0.06]">
              <Layers size={16} className="text-white/40" />
              <h2 className="font-display font-semibold text-sm uppercase tracking-wider text-white/60">Semester Directory</h2>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-white/5 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : !semesters || semesters.length === 0 ? (
              <div className="text-center py-12 text-xs text-white/30 space-y-2">
                <Layers className="mx-auto opacity-35" size={32} />
                <p>No semesters found. Add a semester to get started.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {semesters.map((sem) => (
                  <div key={sem.id} className="p-4 rounded-xl border border-white/[0.04] bg-bg-base/20 flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-display font-bold text-sm text-white/95">{sem.name}</h4>
                        <span className={`text-[8px] font-semibold px-2 py-0.5 rounded-full border ${
                          sem.isActive 
                            ? 'bg-sage/10 text-sage border-sage/20' 
                            : 'bg-white/5 text-white/40 border-white/10'
                        }`}>
                          {sem.isActive ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </div>
                      <p className="text-xs text-white/45 font-light">Academic Year: {sem.academicYear} | Subjects: {sem.subjects.length}</p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <button
                        onClick={() => handleToggleActive(sem.id, sem.isActive)}
                        className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 flex items-center justify-center transition border border-white/10"
                        title={sem.isActive ? "Deactivate" : "Activate"}
                      >
                        {sem.isActive ? <ToggleRight size={16} className="text-sage" /> : <ToggleLeft size={16} />}
                      </button>
                      <button
                        onClick={() => handleDelete(sem.id)}
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
