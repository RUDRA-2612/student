'use client'

import { useState } from 'react'
import { api } from '@/lib/trpc/react'
import { useForm } from 'react-hook-form'
import { 
  Calendar, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  PlusCircle, 
  Clock,
  CalendarDays
} from 'lucide-react'

type EventFormValues = {
  title: string
  description: string
  type: 'MIDTERM1' | 'MIDTERM2' | 'QUIZ' | 'ENDTERM' | 'REGISTRATION' | 'HOLIDAY' | 'EVENT' | 'PLACEMENT'
  date: string
  startDate: string
  endDate: string
}

export default function AdminCalendar() {
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const utils = api.useUtils()
  const { data: events, isLoading } = api.calendar.list.useQuery()

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<EventFormValues>({
    defaultValues: {
      title: '',
      description: '',
      type: 'EVENT',
      date: new Date().toISOString().split('T')[0],
      startDate: '',
      endDate: ''
    }
  })

  const createMutation = api.calendar.create.useMutation({
    onSuccess: () => {
      setSuccessMsg('Academic event scheduled successfully!')
      reset()
      utils.calendar.list.invalidate()
      setTimeout(() => setSuccessMsg(null), 4000)
    },
    onError: (err) => {
      setErrorMsg(err.message || 'Error occurred while creating event.')
      setTimeout(() => setErrorMsg(null), 4000)
    }
  })

  const deleteMutation = api.calendar.delete.useMutation({
    onSuccess: () => {
      setSuccessMsg('Calendar event removed successfully.')
      utils.calendar.list.invalidate()
      setTimeout(() => setSuccessMsg(null), 4000)
    },
    onError: (err) => {
      setErrorMsg(err.message || 'Error occurred while deleting event.')
      setTimeout(() => setErrorMsg(null), 4000)
    }
  })

  const onSubmit = (data: EventFormValues) => {
    createMutation.mutate({
      ...data,
      date: new Date(data.date),
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
    })
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to remove this academic event?')) {
      deleteMutation.mutate({ id })
    }
  }

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">Academic Calendar Scheduler</h1>
        <p className="text-white/40 text-sm font-light">
          Manage mid-term/end-term exam dates, quiz timelines, registration deadlines, and holidays.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Add Event Form */}
        <div className="lg:col-span-4">
          <div className="bg-bg-surface border border-white/[0.06] rounded-xl p-6 space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-white/[0.06]">
              <PlusCircle size={18} className="text-accent" />
              <h2 className="font-display font-semibold text-sm uppercase tracking-wider">Schedule Event</h2>
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
                <label className="form-label">Event Title</label>
                <input
                  {...register('title', { required: 'Event title is required' })}
                  type="text"
                  placeholder="e.g. Mid-Term 1 Examination"
                  className="form-input"
                />
                {errors.title && <p className="text-xs text-brand-coral mt-1.5">{errors.title.message}</p>}
              </div>

              <div>
                <label className="form-label">Event Type</label>
                <select
                  {...register('type')}
                  className="form-input cursor-pointer"
                >
                  <option value="MIDTERM1">Mid-Term I Exam</option>
                  <option value="MIDTERM2">Mid-Term II Exam</option>
                  <option value="QUIZ">Quiz / Assessment</option>
                  <option value="ENDTERM">End-Term Examination</option>
                  <option value="REGISTRATION">Registration Deadline</option>
                  <option value="HOLIDAY">Holiday</option>
                  <option value="PLACEMENT">Placement/Internship Drive</option>
                  <option value="EVENT">University Event</option>
                </select>
              </div>

              <div>
                <label className="form-label">Event Date</label>
                <input
                  {...register('date', { required: 'Date is required' })}
                  type="date"
                  className="form-input cursor-pointer"
                />
                {errors.date && <p className="text-xs text-brand-coral mt-1.5">{errors.date.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Start Date (Optional)</label>
                  <input
                    {...register('startDate')}
                    type="date"
                    className="form-input cursor-pointer"
                  />
                </div>
                <div>
                  <label className="form-label">End Date (Optional)</label>
                  <input
                    {...register('endDate')}
                    type="date"
                    className="form-input cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Event Description</label>
                <textarea
                  {...register('description')}
                  rows={3}
                  placeholder="Details about syllabus, venue, or time..."
                  className="form-input resize-none"
                />
              </div>

              <button type="submit" disabled={isSubmitting} className="w-full btn-primary">
                {isSubmitting ? 'Scheduling...' : 'Schedule Event'}
              </button>
            </form>
          </div>
        </div>

        {/* Directory List */}
        <div className="lg:col-span-8">
          <div className="bg-bg-surface border border-white/[0.06] rounded-xl p-6 space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-white/[0.06]">
              <CalendarDays size={16} className="text-white/40" />
              <h2 className="font-display font-semibold text-sm uppercase tracking-wider text-white/60">Academic Calendar Timeline</h2>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-white/5 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : !events || events.length === 0 ? (
              <div className="text-center py-12 text-xs text-white/30 space-y-2">
                <Calendar className="mx-auto opacity-35" size={32} />
                <p>No events scheduled. Create your first calendar event.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {events.map((evt) => (
                  <div key={evt.id} className="p-4 rounded-xl border border-white/[0.04] bg-bg-base/20 flex items-center justify-between gap-4 animate-fade-in">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-semibold text-accent/80 bg-accent/10 px-2 py-0.5 rounded-full border border-accent/20">
                          {evt.type}
                        </span>
                        <span className="text-[10px] text-white/30 font-mono flex items-center gap-1">
                          <Clock size={10} /> {new Date(evt.date).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="font-display font-bold text-sm text-white/95 mt-1">{evt.title}</h4>
                      <p className="text-xs text-white/40 leading-relaxed font-light">{evt.description || 'No additional details.'}</p>
                    </div>

                    <div className="shrink-0">
                      <button
                        onClick={() => handleDelete(evt.id)}
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
