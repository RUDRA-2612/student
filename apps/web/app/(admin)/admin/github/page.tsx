'use client'

import { useState } from 'react'
import { api } from '@/lib/trpc/react'
import { useForm } from 'react-hook-form'
import { 
  GitBranch, 
  Database, 
  UploadCloud, 
  CheckCircle2, 
  AlertCircle, 
  Github,
  Loader2
} from 'lucide-react'

type GitFormValues = {
  commitMessage: string
}

export default function AdminGitHubSync() {
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  
  // Queries
  const { data: gitStatus, isLoading: statusLoading, refetch: refetchStatus } = api.github.status.useQuery(undefined, {
    refetchOnWindowFocus: false,
  })

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<GitFormValues>({
    defaultValues: {
      commitMessage: ''
    }
  })

  // Mutations
  const backupMutation = api.github.backup.useMutation({
    onSuccess: (data) => {
      setSuccessMsg(data.message)
      refetchStatus()
      setTimeout(() => setSuccessMsg(null), 5000)
    },
    onError: (err) => {
      setErrorMsg(err.message || 'Database backup failed.')
      setTimeout(() => setErrorMsg(null), 5000)
    }
  })

  const pushMutation = api.github.pushCodeUpdates.useMutation({
    onSuccess: (data) => {
      setSuccessMsg(data.message)
      reset()
      refetchStatus()
      setTimeout(() => setSuccessMsg(null), 5000)
    },
    onError: (err) => {
      setErrorMsg(err.message || 'Pushing updates failed.')
      setTimeout(() => setErrorMsg(null), 5000)
    }
  })

  const handleBackup = () => {
    backupMutation.mutate()
  }

  const onSubmit = (data: GitFormValues) => {
    pushMutation.mutate(data)
  }

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">GitHub & Backup Integration</h1>
        <p className="text-white/40 text-sm font-light">
          Monitor code repositories, trigger backups of academic databases, and push updates directly to production.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 bg-sage/10 border border-sage/20 rounded-xl text-sm text-sage flex items-start gap-2 animate-fade-in max-w-4xl">
          <CheckCircle2 className="shrink-0 mt-0.5" size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-brand-coral/10 border border-brand-coral/20 rounded-xl text-sm text-brand-coral flex items-start gap-2 animate-fade-in max-w-4xl">
          <AlertCircle className="shrink-0 mt-0.5" size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Status Dashboard */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-bg-surface border border-white/[0.06] rounded-xl p-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <Github size={18} className="text-white/70" />
                <h2 className="font-display font-semibold text-sm uppercase tracking-wider text-white/80">Repository Status</h2>
              </div>
              <button
                onClick={() => refetchStatus()}
                className="px-2.5 py-1 rounded bg-white/5 border border-white/10 hover:bg-white/10 text-[10px] text-white/70 transition"
              >
                Refresh
              </button>
            </div>

            {statusLoading ? (
              <div className="flex items-center justify-center py-12 text-white/30 gap-2">
                <Loader2 size={16} className="animate-spin" />
                <span>Checking repository status...</span>
              </div>
            ) : !gitStatus ? (
              <p className="text-xs text-white/30">Failed to fetch git details.</p>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-bg-base/30 border border-white/[0.04] space-y-1">
                    <span className="text-[10px] font-mono uppercase text-white/30">Active Branch</span>
                    <p className="text-sm font-semibold text-white flex items-center gap-1.5">
                      <GitBranch size={14} className="text-accent" /> {gitStatus.branch}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-bg-base/30 border border-white/[0.04] space-y-1">
                    <span className="text-[10px] font-mono uppercase text-white/30">Modified Code</span>
                    <p className={`text-sm font-semibold ${gitStatus.hasUncommittedChanges ? 'text-brand-amber' : 'text-sage'}`}>
                      {gitStatus.hasUncommittedChanges ? 'Dirty Files Present' : 'Clean Copy'}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-bg-base/30 border border-white/[0.04] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase text-white/30">Academic Database Backup</span>
                    <span className="text-[10px] font-semibold text-white/40">{gitStatus.lastBackupSize}</span>
                  </div>
                  <p className="text-xs text-white/60">Last Sync: {gitStatus.lastBackupTime}</p>
                </div>

                {gitStatus.recentCommits.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono uppercase text-white/30 block">Recent Git Commit Logs</span>
                    <div className="space-y-1.5">
                      {gitStatus.recentCommits.map((commit, index) => (
                        <div key={index} className="p-2.5 rounded bg-bg-base/50 font-mono text-[10px] text-white/50 border border-white/[0.02]">
                          {commit}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Action Center */}
        <div className="lg:col-span-6 space-y-6">
          {/* Database Backup */}
          <div className="bg-bg-surface border border-white/[0.06] rounded-xl p-6 space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-white/[0.06]">
              <Database size={18} className="text-accent" />
              <h2 className="font-display font-semibold text-sm uppercase tracking-wider">Database Backup</h2>
            </div>
            <p className="text-xs text-white/40 leading-relaxed font-light">
              Create a full snapshot of subjects, syllabus versions, curriculum structures, calendar events, and study resources into a serialized JSON file and sync it to the GitHub repository.
            </p>
            <button
              onClick={handleBackup}
              disabled={backupMutation.isPending}
              className="w-full btn-primary flex items-center justify-center gap-2 py-3"
            >
              {backupMutation.isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Running Backup Sync...</span>
                </>
              ) : (
                <>
                  <Database size={16} />
                  <span>Backup Database & Sync to GitHub</span>
                </>
              )}
            </button>
          </div>

          {/* Commit & Push Code */}
          <div className="bg-bg-surface border border-white/[0.06] rounded-xl p-6 space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-white/[0.06]">
              <UploadCloud size={18} className="text-accent" />
              <h2 className="font-display font-semibold text-sm uppercase tracking-wider">Deploy Code Changes</h2>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="form-label">Deployment Commit Message</label>
                <input
                  {...register('commitMessage', { required: 'Commit message is required' })}
                  type="text"
                  placeholder="e.g. feat: add new study resources & calendar items"
                  className="form-input"
                />
                {errors.commitMessage && <p className="text-xs text-brand-coral mt-1.5">{errors.commitMessage.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full btn-primary flex items-center justify-center gap-2 py-3"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Pushing updates...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud size={16} />
                    <span>Commit & Push Platform Updates</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
