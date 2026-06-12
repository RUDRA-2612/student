'use client'

export function NoiseOverlay() {
  // SVG feTurbulence causes massive GPU lag across the whole window.
  // Disabled to restore 60FPS performance.
  return null
}
