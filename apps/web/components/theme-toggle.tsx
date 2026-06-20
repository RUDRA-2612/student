'use client'

import * as React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="flex flex-col items-center justify-center gap-1 rounded-md p-1.5 text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
      aria-label="Toggle theme"
    >
      <div className="relative h-4 w-4">
        <Sun className="absolute h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      </div>
      <span className="text-[9px] uppercase tracking-[0.15em]">Mode</span>
    </button>
  )
}
