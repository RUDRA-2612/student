'use client'

import { api } from '@/lib/trpc/react'
import { 
  Users, 
  FileText, 
  HelpCircle, 
  MessageSquare, 
  Activity, 
  Download, 
  Eye, 
  ShieldCheck,
  TrendingUp
} from 'lucide-react'
import { motion } from 'framer-motion'

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
}

export default function AdminOverview() {
  const { data: overview, isLoading } = api.analytics.overview.useQuery(undefined, {
    refetchOnWindowFocus: false,
  })

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        <p className="text-white/40 text-xs font-mono">Loading overview data...</p>
      </div>
    )
  }

  if (!overview) return null

  const stats = [
    { label: 'Total Students', value: overview.studentCount, icon: Users, color: 'text-accent border-accent/10 bg-accent/5' },
    { label: 'Exam Papers', value: overview.paperCount, icon: FileText, color: 'text-brand-mint border-brand-mint/10 bg-brand-mint/5' },
    { label: 'Question Bank', value: overview.questionCount, icon: HelpCircle, color: 'text-brand-amber border-brand-amber/10 bg-brand-amber/5' },
    { label: 'Pending Requests', value: overview.pendingRequests, icon: MessageSquare, color: 'text-blue-400 border-blue-500/10 bg-blue-500/5' }
  ]

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-10"
    >
      {/* Banner */}
      <motion.div 
        variants={itemVariants}
        className="relative overflow-hidden rounded-2xl p-8 flex flex-col md:flex-row md:items-center justify-between gap-6"
        style={{ background: 'linear-gradient(135deg, hsl(327 100% 62% / 0.2) 0%, hsl(327 100% 62% / 0.04) 70%, transparent 100%)', border: '1px solid hsl(327 100% 62% / 0.2)' }}
      >
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-accent uppercase tracking-wider">
            <ShieldCheck size={14} /> System Administrator Portal
          </div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight">Admin Headquarters</h1>
          <p className="text-white/60 text-sm max-w-lg font-light">
            Manage Rajasthan Board exam papers, monitor student support tickets, and review AI prediction metrics.
          </p>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div 
        variants={itemVariants}
        className="grid grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className={`p-5 rounded-xl border flex flex-col justify-between gap-3 ${stat.color}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white/50 tracking-wide uppercase">{stat.label}</span>
                <Icon size={18} className="opacity-80" />
              </div>
              <span className="text-2xl md:text-3xl font-display font-bold text-white">
                {stat.value}
              </span>
            </div>
          )
        })}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left pane: Top Papers & Stats */}
        <motion.div variants={itemVariants} className="lg:col-span-6 space-y-6">
          <div className="rounded-xl p-6 space-y-6" style={{ background: 'hsl(220 14% 9%)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-2 pb-4 border-b border-white/[0.06]">
              <TrendingUp size={16} className="text-brand-mint" />
              <h3 className="font-display font-bold text-sm uppercase tracking-wider text-white/80">Most Popular Papers</h3>
            </div>
            
            <div className="space-y-4">
              {overview.topPapers.map((paper) => (
                <div key={paper.id} className="p-4 rounded-xl flex items-center justify-between gap-4" style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <div className="space-y-1 min-w-0">
                    <h4 className="text-xs font-semibold text-white/95 truncate">{paper.title}</h4>
                    <p className="text-[10px] text-white/40">Paper ID: {paper.id}</p>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-white/50 shrink-0">
                    <span className="flex items-center gap-1"><Eye size={12} /> {paper.viewCount}</span>
                    <span className="flex items-center gap-1"><Download size={12} className="text-brand-mint" /> {paper.downloadCount}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Right pane: Recent Activity Logs */}
        <motion.div variants={itemVariants} className="lg:col-span-6 space-y-6">
          <div className="rounded-xl p-6 space-y-6" style={{ background: 'hsl(220 14% 9%)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-2 pb-4 border-b border-white/[0.06]">
              <Activity size={16} className="text-accent" />
              <h3 className="font-display font-bold text-sm uppercase tracking-wider text-white/80">Recent Audit Logs</h3>
            </div>

            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {overview.recentLogs.map((log) => (
                <div key={log.id} className="p-3 rounded-xl text-xs space-y-1.5" style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <div className="flex justify-between items-center text-[10px] text-white/30">
                    <span className="font-semibold text-accent/80 uppercase">{log.action}</span>
                    <span>{new Date(log.createdAt).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-white/80 font-light">
                    {log.user?.name || log.user?.email || 'System'} performed {log.action.toLowerCase()} on {log.entity}.
                  </p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
