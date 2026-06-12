'use client'

import React, { useRef, useCallback } from 'react'

interface SpotlightCardProps {
  children: React.ReactNode
  className?: string
  spotlightColor?: string
}

export function SpotlightCard({ 
  children, 
  className = '', 
  spotlightColor = 'rgba(124, 58, 237, 0.08)' 
}: SpotlightCardProps) {
  const divRef = useRef<HTMLDivElement>(null)
  const spotRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = divRef.current
    const spot = spotRef.current
    if (!el || !spot) return
    const rect = el.getBoundingClientRect()
    spot.style.background = `radial-gradient(600px circle at ${e.clientX - rect.left}px ${e.clientY - rect.top}px, ${spotlightColor}, transparent 40%)`
  }, [spotlightColor])

  const handleMouseEnter = useCallback(() => {
    if (spotRef.current) spotRef.current.style.opacity = '1'
  }, [])

  const handleMouseLeave = useCallback(() => {
    if (spotRef.current) spotRef.current.style.opacity = '0'
  }, [])

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden rounded-3xl border border-white/[0.06] bg-[hsl(230_30%_7%)] transition-colors ${className}`}
    >
      <div
        ref={spotRef}
        className="pointer-events-none absolute -inset-px transition-opacity duration-700 ease-in-out"
        style={{ opacity: 0 }}
      />
      {children}
    </div>
  )
}
