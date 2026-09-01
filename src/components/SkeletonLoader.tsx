export function SkeletonCard() {
  return (
    <div className="bg-surface rounded-xl border border-gray-200 p-4 shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        <div className="skeleton w-12 h-12 rounded-full" />
        <div className="flex-1">
          <div className="skeleton h-5 w-24 mb-2" />
          <div className="skeleton h-4 w-32" />
        </div>
      </div>
      <div className="skeleton h-3 w-full mt-2" />
    </div>
  )
}

export function SkeletonStat() {
  return (
    <div className="bg-surface rounded-xl border border-gray-200 p-4 flex flex-col items-center gap-2 min-w-[140px]">
      <div className="skeleton w-8 h-8 rounded-full" />
      <div className="skeleton h-6 w-12" />
      <div className="skeleton h-4 w-16" />
    </div>
  )
}

export function SkeletonChart() {
  return (
    <div className="bg-surface rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="skeleton h-6 w-40 mb-4" />
      <div className="skeleton h-64 w-full" />
    </div>
  )
}

export function SkeletonRow() {
  return (
    <div className="bg-surface rounded-xl border border-gray-200 p-4 flex items-center gap-4">
      <div className="skeleton w-8 h-8 rounded-full" />
      <div className="skeleton w-10 h-10 rounded-full" />
      <div className="flex-1">
        <div className="skeleton h-5 w-32 mb-2" />
        <div className="skeleton h-4 w-48" />
      </div>
      <div className="skeleton h-6 w-16" />
    </div>
  )
}
