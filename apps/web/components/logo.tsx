import React from 'react'

export function Logo({ className = '' }: { className?: string }) {
  return (
    <span
      className={`font-bold tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-orange-600 via-orange-500 to-orange-400 dark:from-purple-500 dark:via-indigo-400 dark:to-blue-400 ${className}`}
      style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}
    >
      The Backbenchers
    </span>
  )
}

