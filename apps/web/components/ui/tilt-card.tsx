'use client'

import React, { useRef, useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform, HTMLMotionProps } from 'framer-motion'

interface TiltCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode
  maxTilt?: number
  glareOpacity?: number
}

export function TiltCard({
  children,
  className = '',
  maxTilt = 15,
  glareOpacity = 0.12,
  style = {},
  ...props
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  
  // Track relative mouse position inside the card (-0.5 to 0.5)
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  // Smooth springs for tilt rotation
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [maxTilt, -maxTilt]), {
    stiffness: 250,
    damping: 25,
  })
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-maxTilt, maxTilt]), {
    stiffness: 250,
    damping: 25,
  })

  // Glare position coordinates
  const [glarePos, setGlarePos] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const width = rect.width
    const height = rect.height
    
    // Normalized mouse values (-0.5 to 0.5)
    const relativeX = (e.clientX - rect.left) / width - 0.5
    const relativeY = (e.clientY - rect.top) / height - 0.5
    
    x.set(relativeX)
    y.set(relativeY)

    // Set pixel coordinates for glare source
    setGlarePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  const handleMouseEnter = () => {
    setIsHovered(true)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        ...style,
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
      }}
      className={`relative overflow-hidden transition-all duration-200 ${className}`}
      {...props}
    >
      {/* Dynamic light reflection (glare overlay) */}
      {isHovered && (
        <div
          className="pointer-events-none absolute inset-0 z-30 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle 240px at ${glarePos.x}px ${glarePos.y}px, hsl(327 100% 62% / ${glareOpacity * 1.5}), transparent 80%)`,
          }}
        />
      )}
      
      {/* Wrapper to allow children to use preserve-3d context */}
      <div className="w-full h-full" style={{ transformStyle: 'preserve-3d' }}>
        {children}
      </div>
    </motion.div>
  )
}
