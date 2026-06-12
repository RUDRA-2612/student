'use client'

import React, { useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform, useMotionTemplate, HTMLMotionProps } from 'framer-motion'

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

  // Track absolute pixel coordinates for the glare
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  // Smooth springs for tilt rotation
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [maxTilt, -maxTilt]), {
    stiffness: 250,
    damping: 25,
  })
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-maxTilt, maxTilt]), {
    stiffness: 250,
    damping: 25,
  })

  // Offload glare to GPU entirely
  const opacity = useSpring(0, { stiffness: 300, damping: 30 })
  const background = useMotionTemplate`radial-gradient(circle 240px at ${mouseX}px ${mouseY}px, hsl(327 100% 62% / ${glareOpacity * 1.5}), transparent 80%)`

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    
    // Normalized mouse values (-0.5 to 0.5)
    x.set((e.clientX - rect.left) / rect.width - 0.5)
    y.set((e.clientY - rect.top) / rect.height - 0.5)

    // Set pixel coordinates for glare source
    mouseX.set(e.clientX - rect.left)
    mouseY.set(e.clientY - rect.top)
  }

  const handleMouseEnter = () => {
    opacity.set(1)
  }

  const handleMouseLeave = () => {
    opacity.set(0)
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
      {/* Dynamic light reflection (glare overlay) offloaded to motion template */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-30"
        style={{
          background,
          opacity,
        }}
      />
      
      {/* Wrapper to allow children to use preserve-3d context */}
      <div className="w-full h-full" style={{ transformStyle: 'preserve-3d' }}>
        {children}
      </div>
    </motion.div>
  )
}
