'use client'

import { useState } from 'react'
import { api } from '@/lib/trpc/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AnnouncementCreateSchema } from '@examedge/validators'
import { z } from 'zod'
import { 
  Bell, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  FolderPlus,
  Volume2,
  Clock
} from 'lucide-react'

type AnnouncementFormValues = z.infer<typeof AnnouncementCreateSchema>

export default function AdminAnnouncements() {
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const utils = api.useUtils()

  // Fetch announcements list
  const { data: announcements, isLoading } = api.announcements.list.useQuery()

  // Fetch active subjects list
  const { data: subjects } = api.subjects.list.useQuery({ isActive: true })

  // Form setup
  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm<AnnouncementFormValues>({
    resolver: zodResolver(AnnouncementCreateSchema),
    defaultValues: {
      title: '',
      message: '',
      type: 'INFO',
      isActive: true,
      targetAll: true,
      subjects: [],
      expiresAt: ''
    }
  })

  const watchTargetAll = watch('targetAll')

  // Create mutation
  const createMutation = api.announcements.create.useMutation({
    onSuccess: () => {
      setSuccessMsg('Announcement published successfully!')
      reset()
      utils.announcements.list.invalidate()
      setTimeout(() => setSuccessMsg(null), 4000)
    },
    onError: (err) => {
      setErrorMsg(err.message || 'Failed to publish announcement.')
      setTimeout(() => setErrorMsg(null), 4000)
    }
  })

  // Delete mutation
  const deleteMutation = api.announcements.delete.useMutation({
    onSuccess: () => {
      setSuccessMsg('Announcement removed.')
      utils.announcements.list.invalidate()
      setTimeout(() => setSuccessMsg(null), 4000)
    },
    onError: (err) => {
      setErrorMsg(err.message || 'Failed to remove announcement.')
      setTimeout(() => setErrorMsg(null), 4000)
    }
  })

  const onSubmit = (data: AnnouncementFormValues) => {
    // Format expiresAt if it's set
    const payload = {
      ...data,
      expiresAt: data.expiresAt ? new Date(data.expiresAt).toISOString() : null,
      subjects: data.targetAll ? [] : data.subjects
    }
    createMutation.mutate(payload)
  }

  const handleDelete = (id: string) => {
    if (confirm('Delete this announcement?')) {
      deleteMutation.mutate({ id })
    }
  }

  return (
    <div className="space-y-10">
      {/* Header Profile */}
      <div className="space-y-2">
        <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">System Announcements</h1>
        <p className="text-white/40 text-sm font-light">
          Broadcast alerts regarding Rajasthan exam notifications, REET dates updates, or schedule changes.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Form: Add Announcement */}
        <div className="lg:col-span-5">
          <div className="bg-bg-surface border border-white/[0.06] rounded-xl p-6 space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-white/[0.06]">
              <FolderPlus size={18} className="text-accent" />
              <h2 className="font-display font-semibold text-sm uppercase tracking-wider">Publish Alert</h2>
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
                <label className="block text-xs font-semibold text-white/50 uppercase tracking-wide mb-2">Alert Title</label>
                <input
                  {...register('title')}
                  type="text"
                  placeholder="e.g. REET 2026 Registration Open"
                  className="w-full px-4 py-2.5 bg-bg-input border border-white/[0.08] focus:border-accent/40 rounded-lg text-sm text-white placeholder:text-white/20 focus:outline-none"
                />
                {errors.title && <p className="text-xs text-brand-coral mt-1">{errors.title.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-white/50 uppercase tracking-wide mb-2">Category type</label>
                  <select
                    {...register('type')}
                    className="w-full px-4 py-2.5 bg-bg-input border border-white/[0.08] focus:border-accent/40 rounded-lg text-xs text-white focus:outline-none cursor-pointer"
                  >
                    <option value="INFO">Info Alert</option>
                    <option value="IMPORTANT">Important (High Priority)</option>
                    <option value="WARNING">Warning</option>
                    <option value="MAINTENANCE">Maintenance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/50 uppercase tracking-wide mb-2">Expiry Date (Optional)</label>
                  <input
                    {...register('expiresAt')}
                    type="datetime-local"
                    className="w-full px-4 py-2.5 bg-bg-input border border-white/[0.08] focus:border-accent/40 rounded-lg text-xs text-white focus:outline-none cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 py-1">
                <input
                  {...register('targetAll')}
                  type="checkbox"
                  id="target-all-students"
                  className="w-4 h-4 bg-bg-input border border-white/[0.08] rounded cursor-pointer accent-accent"
                />
                <label htmlFor="target-all-students" className="text-xs font-semibold text-white/70 cursor-pointer select-none">
                  Broadcast to all registered students
                </label>
              </div>

              {!watchTargetAll && (
                <div>
                  <label className="block text-xs font-semibold text-white/50 uppercase tracking-wide mb-2">Target Subjects (Select Multiple)</label>
                  <select
                    {...register('subjects')}
                    multiple
                    className="w-full px-4 py-2.5 bg-bg-input border border-white/[0.08] focus:border-accent/40 rounded-lg text-xs text-white focus:outline-none cursor-pointer h-24"
                  >
                    {subjects?.map((sub) => (
                      <option key={sub.id} value={sub.id}>{sub.name}</option>
                    ))}
                  </select>
                  <p className="text-[10px] text-white/30 mt-1">Hold Control/Cmd to select multiple options.</p>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-white/50 uppercase tracking-wide mb-2">Alert Message</label>
                <textarea
                  {...register('message')}
                  rows={4}
                  placeholder="Detail alerts information..."
                  className="w-full px-4 py-2.5 bg-bg-input border border-white/[0.08] focus:border-accent/40 rounded-lg text-sm text-white placeholder:text-white/20 focus:outline-none resize-none font-light"
                />
                {errors.message && <p className="text-xs text-brand-coral mt-1.5">{errors.message.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-accent hover:bg-accent-hover text-white font-semibold rounded-lg text-sm transition"
              >
                {isSubmitting ? 'Publishing Alert...' : 'Publish Broadcast'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Directory list */}
        <div className="lg:col-span-7">
          <div className="bg-bg-surface border border-white/[0.06] rounded-xl p-6 space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-white/[0.06]">
              <Bell size={16} className="text-white/40" />
              <h2 className="font-display font-semibold text-sm uppercase tracking-wider text-white/60">Active Alerts</h2>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="h-16 bg-white/5 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : !announcements || announcements.length === 0 ? (
              <div className="text-center py-12 text-xs text-white/30 space-y-2">
                <Volume2 className="mx-auto opacity-35" size={32} />
                <p>No active announcements broadcasts.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {announcements.map((ann) => {
                  const badgeColor = 
                    ann.type === 'IMPORTANT' ? 'bg-red-500/10 text-red-400 border-red-500/25' : 
                    ann.type === 'WARNING' ? 'bg-brand-amber/10 text-brand-amber border-brand-amber/25' : 
                    ann.type === 'MAINTENANCE' ? 'bg-blue-500/10 text-blue-400 border-blue-500/25' : 
                    'bg-white/5 text-white/60 border-white/10'

                  return (
                    <div key={ann.id} className="p-4 rounded-xl border border-white/[0.04] bg-bg-base/20 flex flex-col gap-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded border text-[9px] font-bold uppercase tracking-wider ${badgeColor}`}>
                              {ann.type}
                            </span>
                            <span className="text-[10px] text-white/30 flex items-center gap-1 font-mono">
                              <Clock size={10} />
                              {new Date(ann.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <h4 className="font-display font-bold text-sm text-white/95 mt-2 leading-tight">{ann.title}</h4>
                        </div>

                        <button
                          onClick={() => handleDelete(ann.id)}
                          className="w-8 h-8 rounded-lg bg-brand-coral/5 hover:bg-brand-coral/10 text-brand-coral border border-brand-coral/15 flex items-center justify-center transition shrink-0"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                      <p className="text-xs text-white/60 leading-relaxed font-light whitespace-pre-wrap">{ann.message}</p>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
