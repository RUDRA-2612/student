'use client'

import React from 'react'
import { useSession } from 'next-auth/react'
import { api } from '@/lib/trpc/react'
import Link from 'next/link'
import { BookOpen, Map, Bookmark, Clock, Send, Compass, Activity, ChevronRight, MoreHorizontal } from 'lucide-react'

export default function StudentDashboard() {
  const { data: session } = useSession()
  const name = session?.user?.name || 'Scholar'

  const { data: stats, isLoading: statsLoading } = api.student.dashboardStats.useQuery()
  const { data: subjects, isLoading: subjectsLoading } = api.subjects.list.useQuery({ isActive: true })
  const { data: announcements, isLoading: announcementsLoading } = api.announcements.list.useQuery()

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="w-full text-white flex flex-col gap-8 pb-12">
      
      {/* ─── Header Section ─── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/[0.04] pb-6">
        <div>
          <h1 className="text-2xl font-semibold text-white/90 tracking-tight">
            {greeting}, {name.split(' ')[0]}
          </h1>
          <p className="text-xs text-white/40 mt-1">Here is the latest overview of your workspace.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/requests" className="px-3 py-1.5 rounded-md bg-white text-black text-xs font-semibold hover:bg-white/90 transition-colors">
            New Request
          </Link>
        </div>
      </div>

      {/* ─── High-Density Stats Row ─── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Activity', value: (stats?.roadmapsCount ?? 0) + (stats?.requestsCount ?? 0) + (stats?.bookmarksCount ?? 0), icon: Activity },
          { label: 'Bookmarks', value: stats?.bookmarksCount, icon: Bookmark },
          { label: 'Roadmaps', value: stats?.roadmapsCount, icon: Map },
          { label: 'Pending Requests', value: stats?.requestsCount, icon: Send },
        ].map((stat, i) => (
          <div key={i} className="p-4 rounded-lg bg-[#111111] border border-white/[0.06] flex flex-col justify-between hover:bg-[#141414] transition-colors cursor-default">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-medium tracking-wider uppercase text-white/40">{stat.label}</span>
              <stat.icon size={12} className="text-white/20" />
            </div>
            {statsLoading ? (
              <div className="h-7 w-12 bg-white/[0.04] rounded animate-pulse" />
            ) : (
              <span className="text-2xl font-semibold text-white/90 font-mono tracking-tight">{stat.value ?? 0}</span>
            )}
          </div>
        ))}
      </div>

      {/* ─── Main Grid Layout ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column: Data Table for Subjects */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white/80">Active Syllabus</h2>
            <Link href="/papers" className="text-xs text-white/40 hover:text-white transition-colors">View Catalog →</Link>
          </div>
          
          <div className="rounded-lg border border-white/[0.06] bg-[#111111] overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#141414] border-b border-white/[0.06]">
                <tr>
                  <th className="px-4 py-3 font-medium text-white/40">Code</th>
                  <th className="px-4 py-3 font-medium text-white/40">Subject Name</th>
                  <th className="px-4 py-3 font-medium text-white/40 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {subjectsLoading ? (
                  [1,2,3,4].map(i => (
                    <tr key={i}>
                      <td className="px-4 py-3"><div className="h-4 w-12 bg-white/[0.02] rounded animate-pulse" /></td>
                      <td className="px-4 py-3"><div className="h-4 w-32 bg-white/[0.02] rounded animate-pulse" /></td>
                      <td className="px-4 py-3"><div className="h-4 w-4 bg-white/[0.02] rounded animate-pulse ml-auto" /></td>
                    </tr>
                  ))
                ) : !subjects?.length ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-white/30">No subjects assigned yet.</td>
                  </tr>
                ) : (
                  subjects.slice(0, 5).map((sub) => (
                    <tr key={sub.id} className="hover:bg-white/[0.02] transition-colors group cursor-pointer" onClick={() => window.location.href = `/papers?subjectId=${sub.id}`}>
                      <td className="px-4 py-3 font-mono text-white/40">{sub.code}</td>
                      <td className="px-4 py-3 font-medium text-white/80">{sub.name}</td>
                      <td className="px-4 py-3 text-right">
                        <MoreHorizontal size={14} className="inline-block text-white/20 group-hover:text-white/60" />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Feed and Actions */}
        <div className="flex flex-col gap-6">
          
          {/* Quick Launch List */}
          <div className="flex flex-col gap-4">
            <h2 className="text-sm font-semibold text-white/80">Quick Launch</h2>
            <div className="flex flex-col rounded-lg border border-white/[0.06] bg-[#111111] overflow-hidden divide-y divide-white/[0.04]">
              {[
                { href: '/curriculum', icon: Compass, label: 'Explore Curriculum' },
                { href: '/roadmap', icon: Map, label: 'Study Roadmaps' },
                { href: '/papers', icon: BookOpen, label: 'Past Papers' },
              ].map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center justify-between p-3.5 hover:bg-white/[0.02] transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={14} className="text-white/40 group-hover:text-white/80 transition-colors" />
                    <span className="text-xs font-medium text-white/60 group-hover:text-white transition-colors">{item.label}</span>
                  </div>
                  <ChevronRight size={14} className="text-white/20 group-hover:text-white/60 transition-colors" />
                </Link>
              ))}
            </div>
          </div>

          {/* Announcements Feed */}
          <div className="flex flex-col gap-4">
            <h2 className="text-sm font-semibold text-white/80">Bulletins</h2>
            <div className="flex flex-col gap-3">
              {announcementsLoading ? (
                [1,2].map(i => <div key={i} className="h-20 bg-white/[0.02] rounded-lg animate-pulse border border-white/[0.04]" />)
              ) : !announcements?.length ? (
                <div className="p-4 text-center text-xs text-white/30 border border-white/[0.04] border-dashed rounded-lg">All caught up.</div>
              ) : (
                announcements.slice(0, 3).map((ann) => (
                  <div key={ann.id} className="p-3.5 rounded-lg border border-white/[0.06] bg-[#111111] hover:bg-[#141414] transition-colors group cursor-default">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[9px] font-semibold tracking-wider uppercase text-white/40">{ann.type}</span>
                      <span className="text-[9px] text-white/30 font-mono flex items-center gap-1">
                        <Clock size={8} />{new Date(ann.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h4 className="text-xs font-medium text-white/80 mb-1">{ann.title}</h4>
                    <p className="text-[10px] text-white/40 leading-relaxed line-clamp-2">{ann.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
