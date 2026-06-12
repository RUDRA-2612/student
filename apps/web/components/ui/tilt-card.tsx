'use client'

import React, { useRef, useCallback } from 'react'

interface TiltCardProps {
  children: React.ReactNode
  maxTilt?: number
  glareOpacity?: number
  className?: string
  style?: React.CSSProperties
}

export function TiltCard({
  children,
  className = '',
  maxTilt = 12,
  glareOpacity = 0.1,
  style = {},
}: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const glareRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current
    const glare = glareRef.current
    if (!card || !glare) return

    const rect = card.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5

    card.style.transform = `perspective(800px) rotateX(${-y * maxTilt}deg) rotateY(${x * maxTilt}deg) scale3d(1.02, 1.02, 1.02)`
    glare.style.opacity = String(glareOpacity)
    glare.style.background = `radial-gradient(circle 200px at ${e.clientX - rect.left}px ${e.clientY - rect.top}px, hsl(263 70% 58% / ${glareOpacity * 1.5}), transparent 80%)`
  }, [maxTilt, glareOpacity])

  const handleMouseLeave = useCallback(() => {
    const card = cardRef.current
    const glare = glareRef.current
    if (!card || !glare) return

    card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)'
    glare.style.opacity = '0'
  }, [])

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden transition-transform duration-300 ease-out ${className}`}
      style={{ ...style, willChange: 'transform' }}
    >
      {/* Glare overlay — GPU-composited, no React re-renders */}
      <div
        ref={glareRef}
        className="pointer-events-none absolute inset-0 z-30 transition-opacity duration-500"
        style={{ opacity: 0 }}
      />
      {children}
    </div>
  )
}
