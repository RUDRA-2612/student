import React from 'react'

export function Logo({ className = '' }: { className?: string }) {
  return (
    <span className={`font-semibold tracking-[0.25em] uppercase ${className}`}>
      ExamEdge
    </span>
  )
}
