interface StatCardProps {
  icon: string
  label: string
  value: string | number
  sublabel?: string
}

export function StatCard({ icon, label, value, sublabel }: StatCardProps) {
  return (
    <div className="bg-surface rounded-xl border border-gray-200 p-4 flex flex-col items-center gap-1 min-w-[140px] shadow-sm">
      <span className="text-2xl ltr-safe">{icon}</span>
      <span className="text-2xl font-bold text-ink animate-count ltr-safe">{value}</span>
      <span className="text-sm font-semibold text-ink">{label}</span>
      {sublabel && (
        <span className="text-xs text-slate-gray font-inter ltr-safe">{sublabel}</span>
      )}
    </div>
  )
}
