'use client'

import { useState } from 'react'
import { api } from '@/lib/trpc/react'
import { useForm } from 'react-hook-form'
import { 
  BookOpen, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  FolderPlus,
  FolderOpen,
  GraduationCap,
  Layers
} from 'lucide-react'

type SubjectFormValues = {
  name: string
  code: string
  description: string
  category: string
  sortOrder: number
  credits: number
  semesterId: string | null
  facultyName: string | null
  facultyEmail: string | null
}

export default function AdminSubjects() {
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const utils = api.useUtils()

  // Fetch subjects list and active semesters list
  const { data: subjects, isLoading: subjectsLoading } = api.subjects.list.useQuery({ isActive: false })
  const { data: semesters } = api.semesters.list.useQuery({ isActiveOnly: true })

  // Form setup
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<SubjectFormValues>({
    defaultValues: {
      name: '',
      code: '',
      description: '',
      category: 'Core CSE',
      sortOrder: 0,
      credits: 3,
      semesterId: '',
      facultyName: '',
      facultyEmail: ''
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
    // Map empty semesterId string to null
    const payload = {
      ...data,
      semesterId: data.semesterId === '' ? null : data.semesterId,
      facultyName: data.facultyName === '' ? null : data.facultyName,
      facultyEmail: data.facultyEmail === '' ? null : data.facultyEmail,
    }
    createMutation.mutate(payload)
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this subject? This will cascade and delete all associated papers/questions/resources!')) {
      deleteMutation.mutate({ id })
    }
  }

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">University Subjects</h1>
        <p className="text-white/40 text-sm font-light">
          Create, edit, and organize academic subject structures, assign semesters, credits, and faculty details.
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
                <label className="form-label">Subject Name</label>
                <input
                  {...register('name', { required: 'Name is required' })}
                  type="text"
                  placeholder="e.g. Programming-I"
                  className="form-input"
                />
                {errors.name && <p className="text-xs text-brand-coral mt-1.5">{errors.name.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Subject Code</label>
                  <input
                    {...register('code', { required: 'Code is required' })}
                    type="text"
                    placeholder="e.g. CSE101"
                    className="form-input"
                  />
                  {errors.code && <p className="text-xs text-brand-coral mt-1.5">{errors.code.message}</p>}
                </div>
                <div>
                  <label className="form-label">Credits</label>
                  <input
                    {...register('credits', { valueAsNumber: true, required: 'Credits required' })}
                    type="number"
                    className="form-input"
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Semester Assignment</label>
                <select
                  {...register('semesterId')}
                  className="form-input cursor-pointer"
                >
                  <option value="">No Semester assigned</option>
                  {semesters?.map((sem) => (
                    <option key={sem.id} value={sem.id}>
                      {sem.name} ({sem.academicYear})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">Category</label>
                <select
                  {...register('category')}
                  className="form-input cursor-pointer"
                >
                  <option value="Core CSE">Core CSE</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Design & Thinking">Design & Thinking</option>
                  <option value="Humanities">Humanities</option>
                  <option value="Communication">Communication</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Faculty Name</label>
                  <input
                    {...register('facultyName')}
                    type="text"
                    placeholder="Dr. Smith"
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">Faculty Email</label>
                  <input
                    {...register('facultyEmail')}
                    type="email"
                    placeholder="smith@univ.edu"
                    className="form-input"
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Sort Order</label>
                <input
                  {...register('sortOrder', { valueAsNumber: true })}
                  type="number"
                  className="form-input"
                />
              </div>

              <div>
                <label className="form-label">Description</label>
                <textarea
                  {...register('description')}
                  rows={3}
                  placeholder="Subject details..."
                  className="form-input resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full btn-primary"
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

            {subjectsLoading ? (
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
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[9px] font-semibold text-accent/80 bg-accent/10 px-2 py-0.5 rounded-full uppercase border border-accent/20 tracking-wider">
                          {sub.category}
                        </span>
                        {sub.semester && (
                          <span className="text-[9px] font-semibold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full uppercase border border-blue-500/20 tracking-wider flex items-center gap-1">
                            <Layers size={9} /> {sub.semester.name}
                          </span>
                        )}
                        <span className="text-[9px] font-semibold text-white/40 bg-white/5 px-2 py-0.5 rounded-full border border-white/10 tracking-wider">
                          {sub.credits} Credits
                        </span>
                      </div>
                      <h4 className="font-display font-bold text-sm text-white/95 mt-1">{sub.name}</h4>
                      <p className="text-xs text-white/40 leading-relaxed font-light">{sub.description || 'No description provided.'}</p>
                      {sub.facultyName && (
                        <p className="text-[10px] text-white/30 flex items-center gap-1">
                          <GraduationCap size={11} /> Faculty: {sub.facultyName} ({sub.facultyEmail})
                        </p>
                      )}
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
