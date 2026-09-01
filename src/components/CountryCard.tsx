import { useState } from 'react'
import type { CountryWithAgreements, AgreementWithCountries } from '../types/database'
import { FlagImage } from './FlagImage'

interface CountryCardProps {
  country: CountryWithAgreements
  agreements: AgreementWithCountries[]
}

export function CountryCard({ country, agreements }: CountryCardProps) {
  const [expanded, setExpanded] = useState(false)

  const countryAgreements = agreements.filter(a =>
    a.countries.some(c => c.id === country.id)
  )
  const displayedAgreements = countryAgreements.slice(0, 3)
  const remainingCount = countryAgreements.length - 3

  return (
    <div className="bg-surface rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group">
      {/* Top color accent bar */}
      <div className="h-1.5 bg-gradient-to-l from-royal-blue to-emerald" />

      {/* Flag + Name section */}
      <div className="p-5 pb-3 text-center">
        <div className="flex justify-center mb-3">
          <div className="p-1 rounded-lg bg-gray-50 border border-gray-100 group-hover:scale-110 transition-transform duration-300">
            <FlagImage emoji={country.flag_emoji} size="lg" />
          </div>
        </div>
        <h3 className="text-lg font-bold text-ink leading-tight">{country.name}</h3>
      </div>

      {/* Stats row */}
      <div className="flex justify-center gap-3 px-4 pb-4">
        <div className="flex items-center gap-1.5 bg-emerald/10 rounded-full px-3 py-1.5">
          <span className="text-emerald text-sm">⭐</span>
          <span className="text-emerald font-black text-sm ltr-safe">{country.points}</span>
          <span className="text-emerald/70 text-xs font-semibold">نقطة</span>
        </div>
        <div className="flex items-center gap-1.5 bg-royal-blue/10 rounded-full px-3 py-1.5">
          <span className="text-royal-blue text-sm">🤝</span>
          <span className="text-royal-blue font-black text-sm ltr-safe">{country.agreement_count}</span>
          <span className="text-royal-blue/70 text-xs font-semibold">اتفاقية</span>
        </div>
      </div>

      {/* Agreements preview */}
      {countryAgreements.length > 0 && (
        <div className="border-t border-gray-100 px-4 py-3">
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-between text-sm text-slate-gray hover:text-royal-blue transition-colors py-1"
          >
            <span className="font-semibold">عرض الاتفاقيات</span>
            <span className={`transition-transform duration-200 text-xs ${expanded ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>

          {expanded && (
            <div className="mt-2 space-y-2">
              {displayedAgreements.map(a => (
                <div key={a.id} className="bg-bg rounded-lg p-2.5 text-sm border border-gray-100">
                  <span className="font-semibold text-ink block">{a.title}</span>
                  <div className="flex gap-1.5 mt-1.5 flex-wrap">
                    {a.countries.map(c => (
                      <FlagImage key={c.id} emoji={c.flag_emoji} size="sm" />
                    ))}
                  </div>
                </div>
              ))}
              {remainingCount > 0 && (
                <p className="text-xs text-lavender font-semibold text-center py-1">
                  +{remainingCount} اتفاقية أخرى
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
