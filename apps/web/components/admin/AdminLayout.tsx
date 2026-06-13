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
  Layers,
  Map,
  Calendar,
  GraduationCap,
  Github
} from 'lucide-react'

const adminNavItems = [
  { name: 'Overview',       href: '/admin',                icon: LayoutDashboard },
  { name: 'Semesters',      href: '/admin/semesters',      icon: Layers },
  { name: 'Subjects',       href: '/admin/subjects',       icon: BookOpen },
  { name: 'Syllabus',       href: '/admin/syllabus',       icon: BookOpen },
  { name: 'Curriculum',     href: '/admin/curriculum',     icon: FileText },
  { name: 'Papers',         href: '/admin/papers',         icon: FileText },
  { name: 'Questions',      href: '/admin/questions',      icon: HelpCircle },
  { name: 'Solutions',      href: '/admin/solutions',      icon: Video },
  { name: 'Resources',      href: '/admin/resources',      icon: Video },
  { name: 'Roadmaps',       href: '/admin/roadmaps',       icon: Map },
  { name: 'Calendar',       href: '/admin/calendar',       icon: Calendar },
  { name: 'Placement Hub',  href: '/admin/placement',      icon: GraduationCap },
  { name: 'GitHub Sync',    href: '/admin/github',         icon: Github },
  { name: 'FAQs',           href: '/admin/faqs',           icon: MessageSquare },
  { name: 'Requests',       href: '/admin/requests',       icon: Send },
  { name: 'Announcements',  href: '/admin/announcements',  icon: Bell },
  { name: 'Analytics',      href: '/admin/analytics',      icon: BarChart3 },
  { name: 'Settings',       href: '/admin/settings',       icon: Settings },
]

/** Branded loading screen for admin panel */
function AdminLoadingScreen({ message = 'Loading Admin' }: { message?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(20,8%,5%)]">
      <div className="flex flex-col items-center gap-5">
        <div className="relative">
          <div className="w-12 h-12 rounded-xl animate-spin border-2 border-transparent border-t-[hsl(340,82%,62%)]"
            style={{ background: 'hsl(340 82% 62% / 0.08)' }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <Shield size={16} className="text-[hsl(340,82%,62%)]/50" />
          </div>
        </div>
        <div className="text-center space-y-1">
          <p className="text-xs font-mono tracking-wider uppercase text-white/25">{message}</p>
          <p className="text-[10px] text-white/15">Exam<span className="text-[hsl(340,82%,62%)]/40">Edge</span> — Admin</p>
        </div>
      </div>
    </div>
  )
}

export default function AdminLayoutComponent({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router   = useRouter()
  const pathname = usePathname()
  const [collapsed,  setCollapsed]  = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)

  // Unified auth + role guard — single effect
  useEffect(() => {
    if (isRedirecting) return
    if (status === 'unauthenticated') {
      setIsRedirecting(true)
      router.replace('/login')
    } else if (status === 'authenticated' && session && !['ADMIN', 'SUPERADMIN'].includes((session.user as any)?.role)) {
      setIsRedirecting(true)
      router.replace('/unauthorized')
    }
  }, [status, session, router, isRedirecting])

  // Show branded loading while session is resolving
  if (status === 'loading') {
    return <AdminLoadingScreen />
  }

  // Show loading while redirect is in progress — prevents flash of nothing
  if (!session || !['ADMIN', 'SUPERADMIN'].includes((session.user as any)?.role)) {
    return <AdminLoadingScreen message={status === 'unauthenticated' ? 'Redirecting' : 'Verifying access'} />
  }

  const NavLink = ({ item, onClick }: { item: typeof adminNavItems[0]; onClick?: () => void }) => {
    const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
    const Icon = item.icon
    return (
      <Link href={item.href} onClick={onClick}>
        <span className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 relative ${
          isActive
            ? 'bg-[hsl(340,82%,62%)]/10 text-[hsl(340,82%,62%)]'
            : 'text-white/40 hover:bg-white/[0.03] hover:text-white/70'
        }`}>
          <Icon size={15} />
          {!collapsed && <span className="whitespace-nowrap">{item.name}</span>}
          {isActive && (
            <motion.div
              layoutId="adminActiveIndicator"
              className="absolute right-3 w-1.5 h-1.5 rounded-full bg-[hsl(340,82%,62%)]"
            />
          )}
        </span>
      </Link>
    )
  }

  return (
    <div className="min-h-screen text-[#f5ede6] flex overflow-hidden bg-[hsl(20,8%,5%)]">
      {/* Desktop Sidebar */}
      <aside
        className="hidden md:flex flex-col shrink-0 h-screen transition-all duration-300 relative z-20 bg-[hsl(20,6%,8%)] border-r border-white/[0.04]"
        style={{ width: collapsed ? 64 : 240 }}
      >
        <div className="h-14 px-4 flex items-center gap-3 border-b border-white/[0.04]">
          {collapsed ? (
            <div className="mx-auto w-7 h-7 rounded-lg bg-[hsl(340,82%,62%)]/10 border border-[hsl(340,82%,62%)]/15 flex items-center justify-center">
              <Shield size={13} className="text-[hsl(340,82%,62%)]/70" />
            </div>
          ) : (
            <Link href="/admin" className="flex items-center gap-2 flex-1 overflow-hidden">
              <div className="w-7 h-7 rounded-lg bg-[hsl(340,82%,62%)]/10 border border-[hsl(340,82%,62%)]/15 flex items-center justify-center shrink-0">
                <Shield size={13} className="text-[hsl(340,82%,62%)]/70" />
              </div>
              <div className="overflow-hidden min-w-0">
                <p className="font-bold text-sm tracking-tight whitespace-nowrap">Admin</p>
                <p className="text-[8px] text-white/20 whitespace-nowrap">ExamEdge</p>
              </div>
            </Link>
          )}
          <button onClick={() => setCollapsed(v => !v)} className="ml-auto text-white/20 hover:text-white/50 transition shrink-0"
            style={collapsed ? { margin: 'auto' } : {}}>
            {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
          </button>
        </div>

        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          {adminNavItems.map(item => <NavLink key={item.href} item={item} />)}
        </nav>

        <div className="p-3 space-y-2 border-t border-white/[0.04]">
          {!collapsed && (
            <Link href="/dashboard"
              className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-white/40 hover:text-white/70 bg-white/[0.02] border border-white/[0.04] transition-colors">
              <span>Student</span><ExternalLink size={10} />
            </Link>
          )}
          <button onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-red-400/70 hover:text-red-400 hover:bg-red-500/8 transition-all">
            <LogOut size={13} />{!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Mobile header */}
        <header className="md:hidden h-14 px-4 flex items-center justify-between shrink-0 z-10 bg-[hsl(20,6%,8%)] border-b border-white/[0.04]">
          <div className="flex items-center gap-2">
            <Shield size={14} className="text-[hsl(340,82%,62%)]/70" />
            <span className="font-bold text-sm">Admin</span>
          </div>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="w-8 h-8 rounded-lg flex items-center justify-center text-white/50 bg-white/[0.03]">
            {mobileOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </header>

        {/* Mobile drawer */}
        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black z-30 md:hidden" onClick={() => setMobileOpen(false)} />
              <motion.div
                initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
                transition={{ type: 'spring', bounce: 0.1, duration: 0.35 }}
                className="fixed top-0 bottom-0 left-0 w-60 flex flex-col z-40 md:hidden bg-[hsl(20,6%,8%)] border-r border-white/[0.04]">
                <div className="h-14 px-4 flex items-center justify-between border-b border-white/[0.04]">
                  <span className="font-bold text-sm">Admin</span>
                  <button onClick={() => setMobileOpen(false)} className="text-white/30 hover:text-white"><X size={16} /></button>
                </div>
                <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
                  {adminNavItems.map(item => <NavLink key={item.href} item={item} onClick={() => setMobileOpen(false)} />)}
                </nav>
                <div className="p-3 space-y-2 border-t border-white/[0.04]">
                  <Link href="/dashboard" className="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-white/40 bg-white/[0.02] border border-white/[0.04]"
                    onClick={() => setMobileOpen(false)}>
                    <span>Student</span><ExternalLink size={10} />
                  </Link>
                  <button onClick={() => signOut({ callbackUrl: '/login' })}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-red-400/70 hover:bg-red-500/8 transition-all">
                    <LogOut size={13} /><span>Sign Out</span>
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <main className="flex-1 overflow-y-auto p-5 md:p-8 bg-[hsl(20,8%,5%)]">
          <div className="max-w-6xl mx-auto w-full">{children}</div>
        </main>
      </div>
    </div>
  )
}
