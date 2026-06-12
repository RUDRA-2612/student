'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import React, { useState, useEffect, useRef } from 'react'
import { AnimatePresence, motion, useMotionValue, useSpring } from 'framer-motion'
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
  ChevronDown
} from 'lucide-react'
import { api } from '@/lib/trpc/react'
import { NoiseOverlay } from '@/components/ui/noise-overlay'

// Navigation configuration
const navItems = [
  { name: 'Dashboard',        href: '/dashboard',   icon: LayoutDashboard },
  { name: 'Curriculum',       href: '/curriculum',  icon: Compass },
  { name: 'Papers',           href: '/papers',      icon: BookOpen },
  { name: 'Roadmaps',         href: '/roadmap',     icon: Map },
  { name: 'FAQs',             href: '/faqs',        icon: HelpCircle },
  { name: 'Requests',         href: '/requests',    icon: Send },
]

/* ───── Dock Item Component (Desktop) ───── */
function DockItem({ 
  href, 
  icon: Icon, 
  label, 
  isActive, 
  count 
}: { 
  href: string 
  icon: any 
  label: string 
  isActive: boolean
  count?: number 
}) {
  const ref = useRef<HTMLAnchorElement>(null)
  const scale = useMotionValue(1)
  const springScale = useSpring(scale, { stiffness: 300, damping: 20 })

  return (
    <Link href={href} ref={ref} className="group relative">
      <motion.div
        style={{ scale: springScale }}
        onHoverStart={() => scale.set(1.18)}
        onHoverEnd={() => scale.set(1)}
        className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
          isActive 
            ? 'bg-white/10 border-white/20 text-white' 
            : 'bg-white/[0.02] border-white/[0.04] text-white/50 group-hover:bg-white/[0.06] group-hover:border-white/[0.1] group-hover:text-white'
        } border backdrop-blur-xl`}
      >
        <Icon size={18} />
        {count !== undefined && count > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-white text-black text-[9px] font-bold flex items-center justify-center border border-black shadow">
            {count}
          </span>
        )}
      </motion.div>
      
      {/* Sliding Active Dot */}
      {isActive && (
        <motion.div
          layoutId="activeDockDot"
          className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white"
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      )}
      
      {/* Tooltip */}
      <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded bg-black/95 text-white/70 border border-white/[0.08] text-[9px] font-mono tracking-wider uppercase opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl">
        {label}
      </span>
    </Link>
  )
}

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Fetch student stats for real-time badge counts
  const { data: stats } = api.student.dashboardStats.useQuery(undefined, {
    enabled: status === 'authenticated'
  })

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-white/5 border-t-white/50 animate-spin" />
          <p className="text-xs font-mono tracking-wider uppercase text-white/30">Syncing workspace</p>
        </div>
      </div>
    )
  }

  if (!session) return null

  const userRole = (session?.user as any)?.role || 'STUDENT'
  const isAdmin = ['ADMIN', 'SUPERADMIN'].includes(userRole)

  return (
    <div className="min-h-screen text-white bg-black relative overflow-x-hidden selection:bg-white/20">
      {/* Premium Texture & Overlays */}
      <NoiseOverlay />
      
      {/* Ambient Radial Lights */}
      <div className="fixed -top-40 -right-40 w-96 h-96 bg-white/[0.015] rounded-full blur-[100px] pointer-events-none" />
      <div className="fixed -bottom-40 -left-40 w-96 h-96 bg-white/[0.015] rounded-full blur-[100px] pointer-events-none" />

      {/* Grid Pattern Background */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.07]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }}
      />

      {/* ─── Fixed Header ─── */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-black/40 backdrop-blur-md border-b border-white/[0.06] z-40 px-6 flex items-center justify-between">
        {/* Brand Logo & Status */}
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-serif text-xs font-bold text-black bg-white transition-transform group-hover:scale-105">
            EE
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm tracking-tight text-white/90">ExamEdge</span>
            <span className="text-[8px] font-mono text-white/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Link
            </span>
          </div>
        </Link>

        {/* User Account / Navigation Trigger */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] transition-all"
          >
            <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
              <User size={12} className="text-white/60" />
            </div>
            <span className="text-xs font-medium text-white/70 max-w-[100px] truncate hidden sm:block">
              {session.user?.name || 'User'}
            </span>
            <ChevronDown size={12} className={`text-white/40 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Account Dropdown Menu */}
          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="absolute right-0 mt-2 w-56 rounded-xl bg-[#090909] border border-white/[0.08] shadow-2xl p-1.5 z-50 overflow-hidden"
              >
                <div className="px-3 py-2 border-b border-white/[0.04] mb-1">
                  <p className="text-xs font-semibold text-white/95 truncate">{session.user?.name || 'Account'}</p>
                  <p className="text-[10px] text-white/40 truncate">{session.user?.email}</p>
                </div>

                <Link href="/dashboard" onClick={() => setDropdownOpen(false)}>
                  <span className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-white/70 hover:text-white hover:bg-white/[0.04] transition-colors">
                    <LayoutDashboard size={13} />
                    <span>Dashboard</span>
                  </span>
                </Link>

                {isAdmin && (
                  <Link href="/admin" onClick={() => setDropdownOpen(false)}>
                    <span className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-white/70 hover:text-white hover:bg-white/[0.04] transition-colors">
                      <Shield size={13} className="text-white/60" />
                      <span className="font-semibold">Admin Panel</span>
                      <ExternalLink size={10} className="ml-auto opacity-40" />
                    </span>
                  </Link>
                )}

                <div className="h-px bg-white/[0.04] my-1" />

                <button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors text-left"
                >
                  <LogOut size={13} />
                  <span>Sign Out</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* ─── Main Content Canvas ─── */}
      <main className="pt-24 pb-28 md:pb-32 px-4 md:px-8 max-w-6xl mx-auto w-full min-h-screen relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 15, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -15, filter: 'blur(4px)' }}
            transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
            className="w-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* ─── Universal Floating Dock (Desktop) ─── */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 hidden md:block">
        <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-black/85 backdrop-blur-2xl border border-white/[0.08] shadow-2xl shadow-black/80">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
            let badgeCount: number | undefined = undefined
            if (item.name === 'Requests') badgeCount = stats?.requestsCount
            
            return (
              <DockItem
                key={item.href}
                href={item.href}
                icon={item.icon}
                label={item.name}
                isActive={isActive}
                count={badgeCount}
              />
            )
          })}
        </div>
      </div>

      {/* ─── Mobile Bottom Navigation Tab Bar (Mobile) ─── */}
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-[#030303]/90 backdrop-blur-xl border-t border-white/[0.06] z-40 md:hidden flex items-center justify-around px-2">
        {navItems.slice(0, 5).map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
          return (
            <Link key={item.href} href={item.href} className="flex flex-col items-center gap-1 flex-1 py-1 relative">
              <div className={`p-1 rounded-lg transition-colors ${isActive ? 'text-white' : 'text-white/40'}`}>
                <item.icon size={18} />
              </div>
              <span className={`text-[9px] font-medium tracking-wider uppercase transition-colors ${isActive ? 'text-white/80' : 'text-white/30'}`}>
                {item.name}
              </span>
              
              {isActive && (
                <motion.div
                  layoutId="mobileActiveBar"
                  className="absolute bottom-0 left-1/4 right-1/4 h-[2px] bg-white rounded-t-full"
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
