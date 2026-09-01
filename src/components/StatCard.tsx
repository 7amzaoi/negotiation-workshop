import type { ReactNode } from 'react'

interface StatCardProps {
  icon: string
  label: string
  value: ReactNode
  sublabel?: string
  accent?: 'primary' | 'secondary' | 'gold' | 'accent'
}

const accentStyles = {
  primary: 'from-royal-blue/10 to-royal-blue/5 border-royal-blue/20',
  secondary: 'from-emerald/10 to-emerald/5 border-emerald/20',
  gold: 'from-gold/10 to-gold/5 border-gold/20',
  accent: 'from-lavender/10 to-lavender/5 border-lavender/20',
}

export function StatCard({ icon, label, value, sublabel, accent = 'primary' }: StatCardProps) {
  return (
    <div className={`
      bg-gradient-to-b ${accentStyles[accent]}
      rounded-xl border p-4 flex flex-col items-center gap-1.5 min-w-[140px]
      shadow-sm hover:shadow-md hover:-translate-y-1
      transition-all duration-300 cursor-default group
    `}>
      <span className="text-2xl ltr-safe group-hover:scale-110 transition-transform duration-300">{icon}</span>
      <span className="text-2xl font-bold text-ink animate-count ltr-safe">{value}</span>
      <span className="text-sm font-semibold text-ink">{label}</span>
      {sublabel && (
        <span className="text-xs text-slate-gray font-inter ltr-safe">{sublabel}</span>
      )}
    </div>
  )
}
