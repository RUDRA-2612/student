export default function StudentLoading() {
  return (
    <div className="w-full space-y-8 animate-pulse">
      {/* Page Header Skeleton */}
      <div className="space-y-3">
        <div className="h-8 w-48 bg-white/5 rounded-lg" />
        <div className="h-4 w-96 bg-white/5 rounded-lg" />
      </div>

      {/* Grid of Skeleton Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="h-32 bg-white/5 rounded-xl border border-white/[0.04] p-5 space-y-4">
          <div className="w-10 h-10 rounded-lg bg-white/5" />
          <div className="h-4 w-24 bg-white/5 rounded-md" />
        </div>
        <div className="h-32 bg-white/5 rounded-xl border border-white/[0.04] p-5 space-y-4">
          <div className="w-10 h-10 rounded-lg bg-white/5" />
          <div className="h-4 w-32 bg-white/5 rounded-md" />
        </div>
        <div className="h-32 bg-white/5 rounded-xl border border-white/[0.04] p-5 space-y-4">
          <div className="w-10 h-10 rounded-lg bg-white/5" />
          <div className="h-4 w-28 bg-white/5 rounded-md" />
        </div>
      </div>

      {/* Main Content Area Skeleton */}
      <div className="bg-bg-surface border border-white/[0.06] rounded-xl p-6 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
          <div className="h-6 w-36 bg-white/5 rounded-md" />
          <div className="h-8 w-24 bg-white/5 rounded-md" />
        </div>
        <div className="space-y-4">
          <div className="h-12 w-full bg-white/5 rounded-lg" />
          <div className="h-12 w-full bg-white/5 rounded-lg" />
          <div className="h-12 w-full bg-white/5 rounded-lg" />
        </div>
      </div>
    </div>
  )
}
