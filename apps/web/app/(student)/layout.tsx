'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import React, { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  BookOpen,
  HelpCircle,
  Send,
  LayoutDashboard,
  LogOut,
  User,
  Compass,
  Map,
  Shield,
  ChevronRight
} from 'lucide-react'
import { api } from '@/lib/trpc/react'

const navItems = [
  { name: 'Dashboard',        href: '/dashboard',   icon: LayoutDashboard },
  { name: 'Curriculum',       href: '/curriculum',  icon: Compass },
  { name: 'Papers',           href: '/papers',      icon: BookOpen },
  { name: 'Roadmaps',         href: '/roadmap',     icon: Map },
  { name: 'Requests',         href: '/requests',    icon: Send },
  { name: 'FAQs',             href: '/faqs',        icon: HelpCircle },
]

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  // Fetch student stats for real-time badge counts
  const { data: stats } = api.student.dashboardStats.useQuery(undefined, {
    enabled: status === 'authenticated'
  })

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  if (status === 'loading' || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#000000]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-5 h-5 rounded-full border border-white/20 border-t-white animate-spin" />
          <p className="text-[10px] font-mono tracking-widest uppercase text-white/30">Loading Workspace</p>
        </div>
      </div>
    )
  }

  const userRole = (session?.user as any)?.role || 'STUDENT'
  const isAdmin = ['ADMIN', 'SUPERADMIN'].includes(userRole)

  return (
    <div className="min-h-screen text-white bg-[#000000] flex font-sans selection:bg-white/20">
      
      {/* ─── Fixed Left Sidebar ─── */}
      <aside className="fixed top-0 left-0 bottom-0 w-64 bg-[#0A0A0A] border-r border-white/[0.04] flex flex-col z-40">
        
        {/* Workspace Switcher / Header */}
        <div className="h-14 px-4 flex items-center border-b border-white/[0.04]">
          <Link href="/dashboard" className="flex items-center gap-3 w-full hover:bg-white/[0.02] p-1.5 rounded-lg transition-colors">
            <div className="w-6 h-6 bg-white text-black rounded flex items-center justify-center font-bold text-[10px]">
              EE
            </div>
            <div className="flex flex-col flex-1">
              <span className="text-xs font-semibold text-white/90">ExamEdge</span>
              <span className="text-[9px] text-white/40">Student Portal</span>
            </div>
            <ChevronRight size={12} className="text-white/20" />
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-0.5">
          <p className="text-[9px] font-semibold tracking-wider uppercase text-white/30 px-3 mb-2 mt-2">Menu</p>
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
            let badgeCount: number | undefined = undefined
            if (item.name === 'Requests') badgeCount = stats?.requestsCount

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isActive 
                    ? 'bg-white/[0.06] text-white' 
                    : 'text-white/50 hover:bg-white/[0.03] hover:text-white/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={14} className={isActive ? 'text-white' : 'text-white/40'} />
                  {item.name}
                </div>
                {badgeCount !== undefined && badgeCount > 0 && (
                  <span className="min-w-[18px] h-4 flex items-center justify-center rounded bg-white/10 text-white text-[9px] font-mono">
                    {badgeCount}
                  </span>
                )}
              </Link>
            )
          })}

          {isAdmin && (
            <>
              <p className="text-[9px] font-semibold tracking-wider uppercase text-white/30 px-3 mb-2 mt-6">Administration</p>
              <Link
                href="/admin"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-white/50 hover:bg-white/[0.03] hover:text-white/80 transition-colors"
              >
                <Shield size={14} className="text-white/40" />
                Admin Panel
              </Link>
            </>
          )}
        </nav>

        {/* User Profile Footer */}
        <div className="p-3 border-t border-white/[0.04]">
          <div className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/[0.02] transition-colors cursor-pointer group">
            <div className="flex items-center gap-3 truncate">
              <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                <User size={12} className="text-white/50" />
              </div>
              <div className="flex flex-col truncate">
                <span className="text-xs font-medium text-white/80 truncate">{session.user?.name}</span>
                <span className="text-[9px] text-white/30 truncate">{session.user?.email}</span>
              </div>
            </div>
            <button 
              onClick={(e) => { e.preventDefault(); signOut({ callbackUrl: '/login' }); }}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-500/10 rounded text-red-400"
            >
              <LogOut size={12} />
            </button>
          </div>
        </div>

      </aside>

      {/* ─── Main Content Canvas ─── */}
      <main className="flex-1 ml-64 min-h-screen relative">
        {/* Subtle grid pattern for texture, highly professional */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.02]"
          style={{ backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`, backgroundSize: '24px 24px' }}
        />
        
        <div className="p-8 md:p-12 max-w-6xl mx-auto w-full relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="w-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

    </div>
  )
}
