'use client'

import React from 'react'

/* Shimmer component for skeleton loaders */
function Shimmer() {
  return (
    <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent,rgba(255,240,230,0.04),transparent)] bg-[length:200%_100%] animate-shimmer z-10" />
  )
}

export default function AdminLoading() {
  return (
    <div className="w-full space-y-10 animate-pulse">
      {/* Banner Skeleton */}
      <div 
        className="relative overflow-hidden rounded-2xl p-8 flex flex-col justify-center min-h-[148px] border border-white/[0.04] bg-white/[0.01]"
      >
        <Shimmer />
        <div className="space-y-3 relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-white/5" />
            <div className="h-3.5 w-48 bg-white/5 rounded" />
          </div>
          <div className="h-8 w-64 bg-white/5 rounded-lg" />
          <div className="h-4 w-96 bg-white/5 rounded" />
        </div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-5 rounded-xl border border-white/[0.04] bg-white/[0.01] flex flex-col justify-between gap-4 min-h-[108px] relative overflow-hidden">
            <Shimmer />
            <div className="flex items-center justify-between">
              <div className="h-3 w-24 bg-white/5 rounded" />
              <div className="w-4 h-4 rounded bg-white/5" />
            </div>
            <div className="h-7 w-16 bg-white/5 rounded-md" />
          </div>
        ))}
      </div>

      {/* Two-Column Panel Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Pane: Popular Papers Skeleton */}
        <div className="lg:col-span-6">
          <div className="rounded-xl p-6 space-y-6 border border-white/[0.06] bg-white/[0.01] relative overflow-hidden">
            <Shimmer />
            <div className="flex items-center gap-2 pb-4 border-b border-white/[0.06]">
              <div className="w-4 h-4 rounded bg-white/5" />
              <div className="h-4.5 w-40 bg-white/5 rounded" />
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map((j) => (
                <div key={j} className="p-4 rounded-xl flex items-center justify-between gap-4 bg-white/[0.01] border border-white/[0.03]">
                  <div className="space-y-2 flex-1">
                    <div className="h-3.5 w-3/4 bg-white/5 rounded" />
                    <div className="h-2.5 w-24 bg-white/5 rounded" />
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="h-3.5 w-10 bg-white/5 rounded" />
                    <div className="h-3.5 w-10 bg-white/5 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Pane: Audit Logs Skeleton */}
        <div className="lg:col-span-6">
          <div className="rounded-xl p-6 space-y-6 border border-white/[0.06] bg-white/[0.01] relative overflow-hidden">
            <Shimmer />
            <div className="flex items-center gap-2 pb-4 border-b border-white/[0.06]">
              <div className="w-4 h-4 rounded bg-white/5" />
              <div className="h-4.5 w-36 bg-white/5 rounded" />
            </div>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((k) => (
                <div key={k} className="p-3 rounded-xl space-y-2 bg-white/[0.01] border border-white/[0.03]">
                  <div className="flex justify-between items-center">
                    <div className="h-3 w-16 bg-white/5 rounded" />
                    <div className="h-2.5 w-12 bg-white/5 rounded" />
                  </div>
                  <div className="h-3.5 w-full bg-white/5 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
