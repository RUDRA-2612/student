'use client'

import { api } from '@/lib/trpc/react'
import { 
  BarChart3, 
  TrendingUp 
} from 'lucide-react'
import { useState } from 'react'

export default function AdminAnalytics() {
  const [days, setDays] = useState(30)
  
  // Fetch statistics history
  const { data: statsData, isLoading } = api.analytics.statsHistory.useQuery({ days })

  return (
    <div className="space-y-10">
      {/* Header Profile */}
      <div className="space-y-2">
        <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">System Performance & Analytics</h1>
        <p className="text-white/40 text-sm font-light">
          Monitor transaction volumes, AI prediction throughput, study roadmap queries, and client-side downloads metrics.
        </p>
      </div>

      {/* Select days filter */}
      <div className="flex justify-end bg-bg-surface border border-white/[0.06] rounded-xl p-4">
        <div className="flex items-center gap-3">
          <span className="text-xs text-white/50">Timeline Range</span>
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="px-3 py-1.5 bg-bg-base border border-white/[0.08] focus:border-accent/40 rounded-lg text-xs text-white focus:outline-none cursor-pointer"
          >
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
          </select>
        </div>
      </div>

      {/* Analytics Panel */}
      <div className="bg-bg-surface border border-white/[0.06] rounded-xl p-6 space-y-6">
        <div className="flex items-center gap-2 pb-4 border-b border-white/[0.06]">
          <BarChart3 size={16} className="text-accent" />
          <h2 className="font-display font-semibold text-sm uppercase tracking-wider text-white/60">Platform Activity Records</h2>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <div className="h-48 bg-white/5 rounded-lg animate-pulse" />
          </div>
        ) : !statsData || statsData.length === 0 ? (
          <div className="text-center py-12 text-xs text-white/30 space-y-2">
            <TrendingUp className="mx-auto opacity-35" size={32} />
            <p>No platform statistics records found for the selected range.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Display Stats Table */}
            <div className="overflow-x-auto rounded-xl border border-white/[0.05] bg-bg-base/30">
              <table className="w-full text-left border-collapse text-xs font-light">
                <thead>
                  <tr className="border-b border-white/[0.08] bg-white/[0.02] text-white/50 uppercase font-mono text-[10px]">
                    <th className="p-4 font-semibold">Date</th>
                    <th className="p-4 font-semibold">Total Users</th>
                    <th className="p-4 font-semibold">New Registrations</th>
                    <th className="p-4 font-semibold">Paper Views</th>
                    <th className="p-4 font-semibold">PDF Downloads</th>
                    <th className="p-4 font-semibold">AI Predictions</th>
                    <th className="p-4 font-semibold">AI Roadmaps</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03] text-white/80">
                  {statsData.map((row) => (
                    <tr key={row.id} className="hover:bg-white/[0.01] transition-colors">
                      <td className="p-4 font-mono">{new Date(row.date).toLocaleDateString()}</td>
                      <td className="p-4">{row.totalUsers}</td>
                      <td className="p-4 text-brand-mint font-semibold">+{row.newUsers}</td>
                      <td className="p-4">{row.paperViews}</td>
                      <td className="p-4 text-accent">{row.paperDownloads}</td>
                      <td className="p-4 font-mono font-medium text-brand-mint">{row.aiPredictions}</td>
                      <td className="p-4 font-mono font-medium text-brand-amber">{row.aiRoadmaps}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
