export default function AdminLoading() {
  return (
    <div className="w-full space-y-8 animate-pulse">
      {/* Page Header Skeleton */}
      <div className="space-y-3">
        <div className="h-8 w-48 bg-white/5 rounded-lg" />
        <div className="h-4 w-96 bg-white/5 rounded-lg" />
      </div>

      {/* Overview stats cards skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-white/5 rounded-xl border border-white/[0.04] p-5 space-y-3">
            <div className="h-3 w-16 bg-white/5 rounded-md" />
            <div className="h-7 w-12 bg-white/5 rounded-md" />
          </div>
        ))}
      </div>

      {/* Main admin panels skeleton */}
      <div className="bg-bg-surface border border-white/[0.06] rounded-xl p-6 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
          <div className="h-6 w-36 bg-white/5 rounded-md" />
          <div className="h-8 w-24 bg-white/5 rounded-md" />
        </div>
        <div className="space-y-4">
          <div className="h-10 w-full bg-white/5 rounded-lg" />
          <div className="h-10 w-full bg-white/5 rounded-lg" />
          <div className="h-10 w-full bg-white/5 rounded-lg" />
        </div>
      </div>
    </div>
  )
}
