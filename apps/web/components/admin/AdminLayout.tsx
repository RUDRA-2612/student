'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  HelpCircle,
  Bell,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Shield,
  Send,
  Video,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
} from 'lucide-react'

const adminNavItems = [
  { name: 'Overview',       href: '/admin',                icon: LayoutDashboard },
  { name: 'Subjects',       href: '/admin/subjects',       icon: BookOpen },
  { name: 'Papers',         href: '/admin/papers',         icon: FileText },
  { name: 'Questions',      href: '/admin/questions',      icon: HelpCircle },
  { name: 'Solutions',      href: '/admin/solutions',      icon: Video },
  { name: 'FAQs',           href: '/admin/faqs',           icon: MessageSquare },
  { name: 'Requests',       href: '/admin/requests',       icon: Send },
  { name: 'Announcements',  href: '/admin/announcements',  icon: Bell },
  { name: 'Analytics',      href: '/admin/analytics',      icon: BarChart3 },
  { name: 'Settings',       href: '/admin/settings',       icon: Settings },
]

const S = {
  base:    'hsl(220 16% 6%)',
  surface: 'hsl(220 14% 9%)',
  accent:  'hsl(327 100% 62%)',
  border:  'rgba(255,255,255,0.06)',
}

export default function AdminLayoutComponent({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router   = useRouter()
  const pathname = usePathname()
  const [collapsed,  setCollapsed]  = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (session && !['ADMIN', 'SUPERADMIN'].includes((session.user as any)?.role)) {
      router.push('/unauthorized')
    }
  }, [status, session, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: S.base }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl animate-spin"
            style={{ border: '2px solid transparent', borderTopColor: S.accent, background: 'hsl(327 100% 62% / 0.1)' }}
          />
          <p className="text-sm text-white/40">Loading Admin Headquarters…</p>
        </div>
      </div>
    )
  }

  if (!session || !['ADMIN', 'SUPERADMIN'].includes((session.user as any)?.role)) {
    return null
  }

  const NavLink = ({ item, onClick }: { item: typeof adminNavItems[0]; onClick?: () => void }) => {
    const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
    const Icon = item.icon
    return (
      <Link href={item.href} onClick={onClick}>
        <span
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative"
          style={isActive ? {
            background: 'hsl(327 100% 62% / 0.12)',
            color: S.accent,
          } : { color: 'rgba(255,255,255,0.5)' }}
          onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)' }}
          onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = '' }}
        >
          <Icon size={16} style={isActive ? { color: S.accent } : {}} />
          {!collapsed && <span className="whitespace-nowrap">{item.name}</span>}
          {isActive && (
            <motion.div
              layoutId="adminActiveIndicator"
              className="absolute right-3 w-1.5 h-1.5 rounded-full"
              style={{ background: S.accent }}
            />
          )}
        </span>
      </Link>
    )
  }

  return (
    <div className="min-h-screen text-white flex overflow-hidden" style={{ background: S.base }}>
      {/* ─── Desktop Sidebar ─── */}
      <aside
        className="hidden md:flex flex-col shrink-0 h-screen transition-all duration-300 relative z-20"
        style={{
          width: collapsed ? 68 : 244,
          background: S.surface,
          borderRight: `1px solid ${S.border}`,
        }}
      >
        {/* Logo */}
        <div className="h-16 px-4 flex items-center gap-3" style={{ borderBottom: `1px solid ${S.border}` }}>
          {collapsed ? (
            <div className="mx-auto w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <Shield size={15} style={{ color: S.accent }} />
            </div>
          ) : (
            <Link href="/admin" className="flex items-center gap-2.5 flex-1 overflow-hidden">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <Shield size={15} style={{ color: S.accent }} />
              </div>
              <div className="overflow-hidden min-w-0">
                <p className="font-display font-bold text-sm tracking-tight whitespace-nowrap">Admin HQ</p>
                <p className="text-[9px] text-white/30 whitespace-nowrap">ExamEdge Platform</p>
              </div>
            </Link>
          )}
          <button
            onClick={() => setCollapsed(v => !v)}
            className="ml-auto text-white/25 hover:text-white transition shrink-0"
            style={collapsed ? { margin: 'auto' } : {}}
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
          {adminNavItems.map(item => <NavLink key={item.href} item={item} />)}
        </nav>

        {/* Footer */}
        <div className="p-3 space-y-2" style={{ borderTop: `1px solid ${S.border}` }}>
          {!collapsed && (
            <Link
              href="/dashboard"
              className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all text-white/60 hover:text-white"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <span>Student Space</span>
              <ExternalLink size={11} />
            </Link>
          )}
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut size={14} />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* ─── Main Content Area ─── */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Mobile header */}
        <header
          className="md:hidden h-14 px-4 flex items-center justify-between shrink-0 z-10"
          style={{ background: S.surface, borderBottom: `1px solid ${S.border}` }}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <Shield size={14} style={{ color: S.accent }} />
            </div>
            <span className="font-display font-bold text-sm">Admin HQ</span>
          </div>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white/60 hover:text-white"
            style={{ background: 'rgba(255,255,255,0.04)' }}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </header>

        {/* Mobile drawer */}
        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black z-30 md:hidden"
                onClick={() => setMobileOpen(false)}
              />
              <motion.div
                initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
                transition={{ type: 'spring', bounce: 0.1, duration: 0.35 }}
                className="fixed top-0 bottom-0 left-0 w-64 flex flex-col z-40 md:hidden"
                style={{ background: S.surface, borderRight: `1px solid ${S.border}` }}
              >
                <div className="h-14 px-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${S.border}` }}>
                  <span className="font-display font-bold text-base">Admin HQ</span>
                  <button onClick={() => setMobileOpen(false)} className="text-white/40 hover:text-white">
                    <X size={18} />
                  </button>
                </div>
                <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
                  {adminNavItems.map(item => <NavLink key={item.href} item={item} onClick={() => setMobileOpen(false)} />)}
                </nav>
                <div className="p-3 space-y-2" style={{ borderTop: `1px solid ${S.border}` }}>
                  <Link href="/dashboard" className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-white/60 hover:text-white"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
                    onClick={() => setMobileOpen(false)}>
                    <span>Student Space</span><ExternalLink size={11} />
                  </Link>
                  <button onClick={() => signOut({ callbackUrl: '/login' })}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-red-400 hover:bg-red-500/10 transition-all">
                    <LogOut size={14} /><span>Sign Out</span>
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-5 md:p-8" style={{ background: S.base }}>
          <div className="max-w-6xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
