'use client'

import { useSession } from 'next-auth/react'
import { useState } from 'react'
import { 
  Settings, 
  ShieldAlert, 
  Server, 
  CheckCircle2, 
  Sliders
} from 'lucide-react'

export default function AdminSettings() {
  const { data: session } = useSession()
  const [success, setSuccess] = useState(false)

  // Mock settings values
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [rateLimit, setRateLimit] = useState(10)
  const [cacheDuration, setCacheDuration] = useState(24)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
  }

  return (
    <div className="space-y-10">
      {/* Header Profile */}
      <div className="space-y-2">
        <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">System Settings</h1>
        <p className="text-white/40 text-sm font-light">
          Configure server-side caching thresholds, API limits, security configurations, and portal states.
        </p>
      </div>

      <div className="bg-bg-surface border border-white/[0.06] rounded-xl p-6 md:p-8 max-w-2xl">
        <div className="flex items-center gap-2 pb-4 border-b border-white/[0.06] mb-6">
          <Settings size={18} className="text-accent" />
          <h2 className="font-display font-semibold text-sm uppercase tracking-wider">Parameters Control Panel</h2>
        </div>

        {success && (
          <div className="p-4 bg-brand-mint/10 border border-brand-mint/20 rounded-xl text-xs text-brand-mint flex items-start gap-2 mb-6 animate-fade-up">
            <CheckCircle2 className="shrink-0 mt-0.5" size={14} />
            <span>Configurations updated successfully on the edge router nodes!</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Caching and limits */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider flex items-center gap-2">
              <Sliders size={14} className="text-accent" /> API Caching & Rate Limits
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-white/40 mb-2 font-semibold">AI Predict Rate Limit (Req/Hr)</label>
                <input
                  type="number"
                  value={rateLimit}
                  onChange={(e) => setRateLimit(Number(e.target.value))}
                  className="w-full px-4 py-2 bg-bg-input border border-white/[0.08] focus:border-accent/40 rounded-lg text-xs text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-white/40 mb-2 font-semibold">Semantic Cache duration (Hrs)</label>
                <input
                  type="number"
                  value={cacheDuration}
                  onChange={(e) => setCacheDuration(Number(e.target.value))}
                  className="w-full px-4 py-2 bg-bg-input border border-white/[0.08] focus:border-accent/40 rounded-lg text-xs text-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Maintenance switch */}
          <div className="space-y-4 pt-4 border-t border-white/[0.04]">
            <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider flex items-center gap-2">
              <Server size={14} className="text-brand-amber" /> System Operation Mode
            </h3>

            <div className="flex items-center justify-between p-4 bg-bg-base/30 border border-white/[0.04] rounded-lg">
              <div className="space-y-1">
                <p className="text-xs font-bold text-white/90">Maintenance Mode</p>
                <p className="text-[10px] text-white/40">Block student requests temporarily to deploy database structural migrations.</p>
              </div>
              <input
                type="checkbox"
                checked={maintenanceMode}
                onChange={(e) => setMaintenanceMode(e.target.checked)}
                className="w-4 h-4 bg-bg-input border border-white/[0.08] rounded cursor-pointer accent-accent"
              />
            </div>
          </div>

          {/* Security details */}
          <div className="space-y-4 pt-4 border-t border-white/[0.04]">
            <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert size={14} className="text-brand-coral" /> Security & Session
            </h3>

            <div className="p-4 bg-bg-base/30 border border-white/[0.04] rounded-lg space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-white/50">Current session ID:</span>
                <span className="font-mono text-white/30 truncate max-w-[200px]">{(session?.user as any)?.id || 'Null'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/50">Admin clearance scope:</span>
                <span className="font-mono text-brand-mint font-bold uppercase">{(session?.user as any)?.role || 'Null'}</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-accent hover:bg-accent-hover text-white font-semibold rounded-lg text-sm transition"
          >
            Apply Configurations
          </button>
        </form>
      </div>
    </div>
  )
}
