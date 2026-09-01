import { useCountries } from '../hooks/useCountries'
import { SkeletonRow } from '../components/SkeletonLoader'

const MEDAL_MAP: Record<number, { emoji: string; glow: string; scale: string }> = {
  1: { emoji: '🥇', glow: 'medal-glow-gold', scale: 'scale-110' },
  2: { emoji: '🥈', glow: 'medal-glow-silver', scale: 'scale-105' },
  3: { emoji: '🥉', glow: 'medal-glow-bronze', scale: 'scale-102' },
}

export function ResultsPage() {
  const { countries, loading } = useCountries()

  // Sort by points descending, then reverse for dramatic 10 → 1 build-up
  const ranked = [...countries].sort((a, b) => b.points - a.points)
  const displayOrder = [...ranked].reverse()

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-black text-royal-blue mb-2">
          🏆 النتائج النهائية
        </h1>
        <p className="text-slate-gray">الترتيب من المركز العاشر إلى المركز الأول</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 10 }).map((_, i) => <SkeletonRow key={i} />)}
        </div>
      ) : (
        <div className="space-y-4">
          {displayOrder.map((country) => {
            const rank = ranked.findIndex(c => c.id === country.id) + 1
            const medal = MEDAL_MAP[rank]
            const isTopThree = rank <= 3

            return (
              <div
                key={country.id}
                className={`
                  bg-surface rounded-2xl border-2 transition-all duration-300
                  ${isTopThree
                    ? `${medal.glow} ${medal.scale} border-${rank === 1 ? 'gold' : rank === 2 ? 'gray-400' : 'orange-400'} p-6 my-2`
                    : 'border-gray-200 p-4'
                  }
                  ${rank === 1 ? 'bg-gradient-to-l from-gold/5 to-surface' : ''}
                `}
              >
                <div className="flex items-center gap-4">
                  {/* Rank number */}
                  <div className={`
                    flex items-center justify-center rounded-full font-black ltr-safe
                    ${isTopThree
                      ? 'w-14 h-14 text-2xl'
                      : 'w-10 h-10 text-lg'
                    }
                    ${rank === 1
                      ? 'bg-gold text-white'
                      : rank === 2
                        ? 'bg-gray-400 text-white'
                        : rank === 3
                          ? 'bg-orange-400 text-white'
                          : 'bg-gray-100 text-slate-gray'
                    }
                  `}>
                    {rank}
                  </div>

                  {/* Medal (top 3 only) */}
                  {medal && (
                    <span className={`text-${isTopThree ? '4xl' : '2xl'} ltr-safe`}>
                      {medal.emoji}
                    </span>
                  )}

                  {/* Flag */}
                  <span className={`${isTopThree ? 'text-5xl' : 'text-3xl'} ltr-safe`}>
                    {country.flag_emoji}
                  </span>

                  {/* Country name */}
                  <div className="flex-1">
                    <h3 className={`font-bold text-ink ${isTopThree ? 'text-2xl' : 'text-lg'}`}>
                      {country.name}
                    </h3>
                    {isTopThree && (
                      <p className="text-sm text-slate-gray mt-1">
                        {country.agreement_count} اتفاقية
                      </p>
                    )}
                  </div>

                  {/* Points */}
                  <div className={`
                    font-black ltr-safe
                    ${rank === 1
                      ? 'text-4xl text-gold'
                      : isTopThree
                        ? 'text-2xl text-royal-blue'
                        : 'text-xl text-slate-gray'
                    }
                  `}>
                    {country.points}
                    <span className={`${isTopThree ? 'text-sm' : 'text-xs'} font-semibold text-slate-gray ms-1`}>
                      نقطة
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
