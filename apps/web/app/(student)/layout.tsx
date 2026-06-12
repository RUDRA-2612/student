'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  BookOpen,
  Zap,
  HelpCircle,
  Send,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  User,
  ChevronLeft,
  ChevronRight,
  Compass,
} from 'lucide-react'

const navItems = [
  { name: 'Dashboard',          href: '/dashboard', icon: LayoutDashboard },
  { name: 'Curriculum Guide',   href: '/curriculum',icon: Compass },
  { name: 'Syllabus Papers',    href: '/papers',    icon: BookOpen },
  { name: 'Study Roadmaps',     href: '/roadmap',   icon: Zap },
  { name: 'FAQs & Help',        href: '/faqs',      icon: HelpCircle },
  { name: 'My Requests',        href: '/requests',  icon: Send },
]

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router   = useRouter()
  const pathname = usePathname()
  const [collapsed,   setCollapsed]   = useState(false)
  const [mobileOpen,  setMobileOpen]  = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-white/10 border-t-white/60 animate-spin" />
          <p className="text-sm text-white/40">Loading your workspace…</p>
        </div>
      </div>
    )
  }

  if (!session) return null

  const NavLink = ({ item, onClick }: { item: typeof navItems[0]; onClick?: () => void }) => {
    const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
    const Icon = item.icon
    return (
      <Link href={item.href} onClick={onClick}>
        <span
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative group ${
            isActive 
              ? 'bg-white/[0.08] text-white' 
              : 'text-white/50 hover:bg-white/[0.04] hover:text-white/80'
          }`}
        >
          <Icon size={17} className={isActive ? 'text-white' : ''} />
          {!collapsed && <span className="whitespace-nowrap">{item.name}</span>}
          {isActive && (
            <motion.div
              layoutId="studentActiveIndicator"
              className="absolute right-3 w-1.5 h-1.5 rounded-full bg-white"
            />
          )}
        </span>
      </Link>
    )
  }

  return (
    <div className="min-h-screen text-white flex overflow-hidden bg-black">
      {/* ─── Desktop Sidebar ─── */}
      <aside
        className="hidden md:flex flex-col shrink-0 h-screen relative z-20 transition-all duration-300 border-r border-white/[0.06]"
        style={{ width: collapsed ? 72 : 248, background: 'hsl(0 0% 4%)' }}
      >
        {/* Logo */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-white/[0.06]">
          {!collapsed && (
            <Link href="/dashboard" className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full flex items-center justify-center font-serif text-xs font-bold text-black bg-white shrink-0">
                EE
              </div>
              <span className="font-semibold text-base tracking-tight whitespace-nowrap">ExamEdge</span>
            </Link>
          )}
          {collapsed && (
            <Link href="/dashboard" className="mx-auto">
              <div className="w-8 h-8 rounded-full flex items-center justify-center font-serif text-xs font-bold text-black bg-white">
                EE
              </div>
            </Link>
          )}
          <button
            onClick={() => setCollapsed(v => !v)}
            className="ml-auto text-white/30 hover:text-white transition"
            style={collapsed ? { margin: 'auto' } : {}}
          >
            {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(item => <NavLink key={item.href} item={item} />)}
        </nav>

        {/* User Footer */}
        <div className="p-3 space-y-2 border-t border-white/[0.06]">
          {!collapsed && (
            <div className="flex items-center gap-2.5 px-2 py-1.5">
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-white/[0.06] border border-white/[0.08]">
                <User size={14} className="text-white/60" />
              </div>
              <div className="overflow-hidden min-w-0">
                <p className="text-xs font-semibold text-white/90 truncate">{session.user?.name || 'Student'}</p>
                <p className="text-[10px] text-white/40 truncate">{session.user?.email}</p>
              </div>
            </div>
          )}
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all text-white/50 hover:text-white hover:bg-white/[0.04]"
          >
            <LogOut size={14} />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* ─── Main Content ─── */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Mobile header */}
        <header className="md:hidden h-14 px-4 flex items-center justify-between shrink-0 z-10 bg-[hsl(0,0%,4%)] border-b border-white/[0.06]">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center font-serif text-xs font-bold text-black bg-white">
              EE
            </div>
            <span className="font-semibold text-sm">ExamEdge</span>
          </Link>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white/60 hover:text-white bg-white/[0.04]"
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
                className="fixed top-0 bottom-0 left-0 w-64 flex flex-col z-40 md:hidden bg-[hsl(0,0%,4%)] border-r border-white/[0.06]"
              >
                <div className="h-14 px-4 flex items-center justify-between border-b border-white/[0.06]">
                  <span className="font-semibold text-base">ExamEdge</span>
                  <button onClick={() => setMobileOpen(false)} className="text-white/40 hover:text-white">
                    <X size={18} />
                  </button>
                </div>
                <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
                  {navItems.map(item => <NavLink key={item.href} item={item} onClick={() => setMobileOpen(false)} />)}
                </nav>
                <div className="p-3 space-y-2 border-t border-white/[0.06]">
                  <div className="flex items-center gap-2.5 px-2 py-1.5">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-white/[0.06] border border-white/[0.08]">
                      <User size={14} className="text-white/60" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white/90">{session.user?.name || 'Student'}</p>
                      <p className="text-[10px] text-white/40">{session.user?.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-white/50 hover:text-white hover:bg-white/[0.04] transition-all"
                  >
                    <LogOut size={14} /><span>Sign Out</span>
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-5 md:p-8 bg-black">
          <div className="max-w-6xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
