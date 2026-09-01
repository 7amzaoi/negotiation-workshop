import { useState } from 'react'
import type { CountryWithAgreements, AgreementWithCountries } from '../types/database'

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
    <div className="bg-surface rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
      {/* Flag + Name */}
      <div className="flex items-center gap-3 mb-3">
        <span className="text-4xl ltr-safe">{country.flag_emoji}</span>
        <div>
          <h3 className="text-lg font-bold text-ink">{country.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="inline-flex items-center bg-royal-blue/10 text-royal-blue text-xs font-bold px-2 py-0.5 rounded-full ltr-safe">
              🤝 {country.agreement_count} اتفاقية
            </span>
            <span className="inline-flex items-center bg-emerald/10 text-emerald text-xs font-bold px-2 py-0.5 rounded-full ltr-safe">
              ⭐ {country.points} نقطة
            </span>
          </div>
        </div>
      </div>

      {/* Agreements preview */}
      {countryAgreements.length > 0 && (
        <div className="border-t border-gray-100 pt-3 mt-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-between text-sm text-slate-gray hover:text-royal-blue transition-colors"
          >
            <span className="font-semibold">عرض الاتفاقيات</span>
            <span className={`transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>

          {expanded && (
            <div className="mt-2 space-y-2">
              {displayedAgreements.map(a => (
                <div key={a.id} className="bg-bg rounded-lg p-2 text-sm">
                  <span className="font-semibold text-ink">{a.title}</span>
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {a.countries.map(c => (
                      <span key={c.id} className="text-xs ltr-safe">{c.flag_emoji}</span>
                    ))}
                  </div>
                </div>
              ))}
              {remainingCount > 0 && (
                <p className="text-xs text-lavender font-semibold text-center">
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
