import React from 'react'

export function Logo({ className = '' }: { className?: string }) {
  return (
    <span
      className={`font-bold tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-orange-800 via-orange-700 to-orange-600 dark:from-pink-400 dark:via-purple-400 dark:to-indigo-400 ${className}`}
      style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}
    >
      The Backbenchers
    </span>
  )
}

