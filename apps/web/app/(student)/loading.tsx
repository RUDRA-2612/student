'use client'

import React from 'react'

/* Shimmer component for skeleton loaders */
function Shimmer() {
  return (
    <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent,rgba(255,240,230,0.04),transparent)] bg-[length:200%_100%] animate-shimmer z-10" />
  )
}

export default function StudentLoading() {
  return (
    <div className="w-full space-y-4">
      {/* ─── BENTO GRID LOADING SKELETON ─── */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-12 gap-4 auto-rows-min animate-pulse">

        {/* Hero Block Skeleton */}
        <div className="md:col-span-4 lg:col-span-8">
          <div className="relative p-8 rounded-2xl border border-white/[0.04] bg-white/[0.01] overflow-hidden min-h-[148px] flex flex-col justify-center">
            <Shimmer />
            <div className="space-y-3">
              <div className="h-3.5 w-24 bg-white/5 rounded-md" />
              <div className="h-10 w-48 bg-white/5 rounded-lg" />
              <div className="h-4 w-64 bg-white/5 rounded-md" />
            </div>
          </div>
        </div>

        {/* Activity Stat Skeleton */}
        <div className="md:col-span-2 lg:col-span-4">
          <div className="h-full min-h-[148px] rounded-2xl border border-white/[0.04] bg-white/[0.01] p-6 flex flex-col justify-between relative overflow-hidden">
            <Shimmer />
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-lg bg-white/5" />
              <div className="w-4 h-4 rounded bg-white/5" />
            </div>
            <div className="space-y-2 mt-4">
              <div className="h-3 w-16 bg-white/5 rounded" />
              <div className="h-8 w-24 bg-white/5 rounded-md" />
            </div>
          </div>
        </div>

        {/* Small stats (Bookmarks & Requests) */}
        {[1, 2].map((i) => (
          <div key={i} className="md:col-span-2 lg:col-span-2">
            <div className="h-36 rounded-2xl border border-white/[0.04] bg-white/[0.01] p-5 flex flex-col justify-between relative overflow-hidden">
              <Shimmer />
              <div className="w-7 h-7 rounded-lg bg-white/5" />
              <div className="space-y-2">
                <div className="h-6 w-12 bg-white/5 rounded" />
                <div className="h-3 w-20 bg-white/5 rounded" />
              </div>
            </div>
          </div>
        ))}

        {/* Quick Launch Skeleton */}
        <div className="md:col-span-4 lg:col-span-4">
          <div className="rounded-2xl border border-white/[0.04] bg-white/[0.01] p-5 relative overflow-hidden">
            <Shimmer />
            <div className="h-3.5 w-28 bg-white/5 rounded mb-4" />
            <div className="grid grid-cols-2 gap-2.5">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="h-16 rounded-xl bg-white/[0.02] border border-white/[0.02] p-3 flex flex-col justify-center space-y-2">
                  <div className="w-5 h-5 rounded-md bg-white/5" />
                  <div className="h-3 w-16 bg-white/5 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Syllabus / Subjects Skeleton */}
        <div className="md:col-span-4 lg:col-span-4">
          <div className="rounded-2xl border border-white/[0.04] bg-white/[0.01] p-5 flex flex-col relative overflow-hidden">
            <Shimmer />
            <div className="flex items-center justify-between mb-5">
              <div className="h-4.5 w-20 bg-white/5 rounded" />
              <div className="h-3 w-8 bg-white/5 rounded" />
            </div>
            <div className="space-y-2.5">
              {[1, 2, 3, 4, 5].map((k) => (
                <div key={k} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.01]">
                  <div className="space-y-2">
                    <div className="h-3 w-28 bg-white/5 rounded" />
                    <div className="h-2 w-12 bg-white/5 rounded" />
                  </div>
                  <div className="w-3.5 h-3.5 rounded bg-white/5" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bulletins / Announcements Skeleton */}
        <div className="md:col-span-4 lg:col-span-8">
          <div className="rounded-2xl border border-white/[0.04] bg-white/[0.01] p-5 relative overflow-hidden">
            <Shimmer />
            <div className="h-3.5 w-24 bg-white/5 rounded mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[1, 2].map((l) => (
                <div key={l} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.02] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="h-4 w-12 bg-white/5 rounded" />
                    <div className="h-3 w-16 bg-white/5 rounded" />
                  </div>
                  <div className="h-4.5 w-3/4 bg-white/5 rounded" />
                  <div className="space-y-1.5">
                    <div className="h-3 w-full bg-white/5 rounded" />
                    <div className="h-3 w-5/6 bg-white/5 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
