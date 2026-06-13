'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import React, { useState, useEffect, useRef } from 'react'
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
  ExternalLink,
  ChevronDown,
  Target
} from 'lucide-react'
import { api } from '@/lib/trpc/react'

const navItems = [
  { name: 'Dashboard',        href: '/dashboard',   icon: LayoutDashboard },
  { name: 'Curriculum',       href: '/curriculum',  icon: Compass },
  { name: 'Papers',           href: '/papers',      icon: BookOpen },
  { name: 'Predict',          href: '/predict',     icon: Target },
  { name: 'Roadmaps',         href: '/roadmap',     icon: Map },
  { name: 'Requests',         href: '/requests',    icon: Send },
  { name: 'FAQs',             href: '/faqs',        icon: HelpCircle },
]

function DockItem({ href, icon: Icon, label, isActive, count }: {
  href: string; icon: any; label: string; isActive: boolean; count?: number
}) {
  return (
    <Link href={href} className="group relative">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 border ${
        isActive
          ? 'bg-[hsl(340,82%,62%)]/12 border-[hsl(340,82%,62%)]/25 text-[hsl(340,82%,62%)]'
          : 'bg-white/[0.02] border-white/[0.04] text-white/40 group-hover:bg-white/[0.05] group-hover:text-white/80 group-hover:scale-110'
      }`}>
        <Icon size={17} />
        {count !== undefined && count > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[15px] h-[15px] px-1 rounded-full bg-[hsl(340,82%,62%)] text-white text-[8px] font-bold flex items-center justify-center border-2 border-[hsl(20,6%,8%)]">
            {count}
          </span>
        )}
      </div>

      {isActive && (
        <motion.div
          layoutId="activeDockDot"
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[hsl(340,82%,62%)]"
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      )}

      <span className="absolute -top-9 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-lg bg-[hsl(20,6%,12%)] text-white/70 border border-white/[0.06] text-[9px] font-medium tracking-wider uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
        {label}
      </span>
    </Link>
  )
}

/** Branded loading screen shown while session is loading or redirecting */
function StudentLoadingScreen({ message = 'Loading' }: { message?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(20,8%,5%)]">
      <div className="flex flex-col items-center gap-5">
        {/* Branded spinner */}
        <div className="relative">
          <div className="w-10 h-10 rounded-xl border-2 border-[hsl(340,82%,62%)]/20 border-t-[hsl(340,82%,62%)] animate-spin" />
          <div className="absolute inset-0 w-10 h-10 rounded-xl bg-[hsl(340,82%,62%)]/5" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-xs font-mono tracking-wider uppercase text-white/25">{message}</p>
          <p className="text-[10px] text-white/15">Exam<span className="text-[hsl(340,82%,62%)]/40">Edge</span></p>
        </div>
      </div>
    </div>
  )
}

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const { data: stats } = api.student.dashboardStats.useQuery(undefined, {
    enabled: status === 'authenticated',
    refetchOnWindowFocus: false,
  })

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Unified auth guard — single effect handles all redirect cases
  useEffect(() => {
    if (status === 'unauthenticated' && !isRedirecting) {
      setIsRedirecting(true)
      router.replace('/login')
    }
  }, [status, router, isRedirecting])

  // Show loading screen while session is being fetched
  if (status === 'loading') {
    return <StudentLoadingScreen />
  }

  // Show loading screen while redirecting unauthenticated users
  // This prevents the flash-of-nothing between detection and redirect
  if (!session || status === 'unauthenticated') {
    return <StudentLoadingScreen message="Redirecting" />
  }

  const userRole = (session?.user as any)?.role || 'STUDENT'
  const isAdmin = ['ADMIN', 'SUPERADMIN'].includes(userRole)

  return (
    <div className="min-h-screen text-[#f5ede6] bg-[hsl(20,8%,5%)] relative overflow-x-hidden">

      {/* Single subtle ambient blob */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[30%] right-[-10%] w-[50vw] h-[50vw] rounded-full opacity-[0.04] animate-drift"
          style={{ background: 'radial-gradient(circle, hsl(340 82% 62%) 0%, transparent 55%)' }} />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-14 bg-[hsl(20,6%,8%)]/85 backdrop-blur-md border-b border-white/[0.04] z-40 px-5 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <span className="text-sm font-semibold tracking-tight">Exam<span className="text-[hsl(340,82%,62%)]">Edge</span></span>
          <span className="text-[7px] font-mono text-white/20 flex items-center gap-1 mt-0.5">
            <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" /> live
          </span>
        </Link>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-all"
          >
            <div className="w-6 h-6 rounded-md bg-[hsl(340,82%,62%)]/10 flex items-center justify-center">
              <User size={11} className="text-[hsl(340,82%,62%)]/70" />
            </div>
            <span className="text-xs text-white/60 max-w-[80px] truncate hidden sm:block">
              {session.user?.name || 'User'}
            </span>
            <ChevronDown size={11} className={`text-white/30 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.12 }}
                className="absolute right-0 mt-2 w-52 rounded-xl bg-[hsl(20,6%,10%)]/95 backdrop-blur-xl border border-white/[0.06] shadow-2xl p-1.5 z-50"
              >
                <div className="px-3 py-2 border-b border-white/[0.04] mb-1">
                  <p className="text-xs font-semibold truncate">{session.user?.name || 'Account'}</p>
                  <p className="text-[10px] text-white/30 truncate">{session.user?.email}</p>
                </div>

                <Link href="/dashboard" onClick={() => setDropdownOpen(false)}>
                  <span className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-white/60 hover:text-white hover:bg-white/[0.04] transition-colors">
                    <LayoutDashboard size={12} /> Dashboard
                  </span>
                </Link>

                {isAdmin && (
                  <Link href="/admin" onClick={() => setDropdownOpen(false)}>
                    <span className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-white/60 hover:text-white hover:bg-white/[0.04] transition-colors">
                      <Shield size={12} className="text-[hsl(340,82%,62%)]/60" /> Admin Panel
                      <ExternalLink size={9} className="ml-auto opacity-30" />
                    </span>
                  </Link>
                )}

                <div className="h-px bg-white/[0.04] my-1" />

                <button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-red-400/80 hover:text-red-400 hover:bg-red-500/8 transition-colors text-left"
                >
                  <LogOut size={12} /> Sign Out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Main */}
      <main className="pt-22 pb-24 md:pb-28 px-4 md:px-8 max-w-6xl mx-auto w-full min-h-screen relative z-10" style={{ paddingTop: '5.5rem' }}>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="w-full"
        >
          {children}
        </motion.div>
      </main>

      {/* Desktop Dock */}
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 hidden md:block">
        <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-[hsl(20,6%,8%)]/85 backdrop-blur-xl border border-white/[0.05] shadow-2xl">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
            return (
              <DockItem
                key={item.href}
                href={item.href}
                icon={item.icon}
                label={item.name}
                isActive={isActive}
                count={item.name === 'Requests' ? stats?.requestsCount : undefined}
              />
            )
          })}
        </div>
      </div>

      {/* Mobile Nav */}
      <div className="fixed bottom-0 left-0 right-0 h-14 bg-[hsl(20,6%,8%)]/90 backdrop-blur-xl border-t border-white/[0.04] z-40 md:hidden flex items-center justify-around px-2">
        {navItems.slice(0, 5).map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
          return (
            <Link key={item.href} href={item.href} className="flex flex-col items-center gap-0.5 flex-1 py-1 relative">
              <div className={`p-1 transition-colors duration-300 ${isActive ? 'text-[hsl(340,82%,62%)]' : 'text-white/30'}`}>
                <item.icon size={17} />
              </div>
              <span className={`text-[8px] font-medium tracking-wider uppercase transition-colors duration-300 ${isActive ? 'text-[hsl(340,82%,62%)]/70' : 'text-white/20'}`}>
                {item.name}
              </span>
              {isActive && (
                <motion.div
                  layoutId="mobileActiveBar"
                  className="absolute bottom-0 left-1/4 right-1/4 h-[2px] rounded-t-full bg-[hsl(340,82%,62%)]"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
