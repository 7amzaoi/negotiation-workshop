import { useState } from 'react'
import { useCountries } from '../hooks/useCountries'
import { FlagImage } from '../components/FlagImage'

const MEDAL_MAP: Record<number, { emoji: string; glow: string; bg: string }> = {
  1: { emoji: '🥇', glow: 'medal-glow-gold', bg: 'from-gold/15 to-gold/5' },
  2: { emoji: '🥈', glow: 'medal-glow-silver', bg: 'from-gray-300/20 to-gray-200/5' },
  3: { emoji: '🥉', glow: 'medal-glow-bronze', bg: 'from-orange-400/15 to-orange-300/5' },
}

export function ResultsPage() {
  const { countries, loading } = useCountries()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)

  // Sort by points descending, then reverse for display (10th → 1st)
  const ranked = [...countries].sort((a, b) => b.points - a.points)
  const displayOrder = [...ranked].reverse()

  const total = displayOrder.length
  const currentCountry = displayOrder[currentIndex]
  const currentRank = total - currentIndex
  const medal = MEDAL_MAP[currentRank]
  const isTopThree = currentRank <= 3
  const isFirst = currentRank === 1
  const isLast = currentIndex === total - 1

  const handleNext = () => {
    if (currentIndex < total - 1) {
      setRevealed(false)
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1)
        setRevealed(true)
      }, 300)
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      setRevealed(false)
      setTimeout(() => {
        setCurrentIndex(prev => prev - 1)
        setRevealed(true)
      }, 300)
    }
  }

  const handleReset = () => {
    setRevealed(false)
    setTimeout(() => {
      setCurrentIndex(0)
      setRevealed(true)
    }, 300)
  }

  // Trigger initial reveal
  useState(() => {
    setTimeout(() => setRevealed(true), 200)
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-royal-blue border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-gray font-semibold">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  if (!currentCountry) return null

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center px-4 py-8">
      {/* Progress indicator */}
      <div className="flex items-center gap-2 mb-6">
        {displayOrder.map((_, i) => (
          <div
            key={i}
            className={`rounded-full transition-all duration-300 ${
              i < currentIndex
                ? 'w-2 h-2 bg-royal-blue'
                : i === currentIndex
                ? 'w-3 h-3 bg-gold'
                : 'w-2 h-2 bg-gray-300'
            }`}
          />
        ))}
      </div>

      {/* Rank label */}
      <div className="mb-4 text-center">
        <span className="text-sm text-slate-gray font-semibold">
          {currentIndex + 1} / {total}
        </span>
      </div>

      {/* Country Card */}
      <div
        className={`
          w-full max-w-lg transition-all duration-500
          ${revealed ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}
        `}
      >
        <div className={`
          bg-surface rounded-3xl border-2 shadow-xl overflow-hidden
          ${isFirst ? `${medal.glow} border-gold` : isTopThree ? `${medal!.glow} border-gray-300` : 'border-gray-200'}
        `}>
          {/* Rank header */}
          <div className={`
            py-4 px-6 text-center
            ${isFirst
              ? 'bg-gradient-to-b from-gold/20 to-transparent'
              : isTopThree
              ? `bg-gradient-to-b ${medal!.bg}`
              : 'bg-gradient-to-b from-royal-blue/10 to-transparent'
            }
          `}>
            <div className="flex items-center justify-center gap-3">
              {medal && <span className="text-4xl">{medal.emoji}</span>}
              <span className={`
                font-black ltr-safe
                ${isFirst ? 'text-6xl text-gold' : isTopThree ? 'text-5xl text-royal-blue' : 'text-4xl text-slate-gray'}
              `}>
                {currentRank}
              </span>
              {medal && <span className="text-4xl">{medal.emoji}</span>}
            </div>
            <p className="text-sm text-slate-gray mt-1 font-semibold">
              {isFirst ? 'المركز الأول 👑' : `المركز ${currentRank}`}
            </p>
          </div>

          {/* Flag + Info */}
          <div className="p-8 text-center">
            {/* Flag */}
            <div className={`flex justify-center mb-5 ${isFirst ? 'animate-float' : ''}`}>
              <div className={`
                p-2 rounded-xl border shadow-md
                ${isFirst ? 'border-gold/30 bg-gold/5' : 'border-gray-200 bg-gray-50'}
              `}>
                <FlagImage emoji={currentCountry.flag_emoji} size="xl" />
              </div>
            </div>

            {/* Country name */}
            <h2 className={`
              font-black text-ink mb-3
              ${isFirst ? 'text-4xl' : isTopThree ? 'text-3xl' : 'text-2xl'}
            `}>
              {currentCountry.name}
            </h2>

            {/* Points */}
            <div className={`
              inline-flex items-center gap-2 rounded-full px-6 py-2 mb-4
              ${isFirst ? 'bg-gold/15' : 'bg-royal-blue/10'}
            `}>
              <span className="text-lg">⭐</span>
              <span className={`
                font-black ltr-safe
                ${isFirst ? 'text-3xl text-gold' : 'text-2xl text-royal-blue'}
              `}>
                {currentCountry.points}
              </span>
              <span className="text-sm text-slate-gray font-semibold">نقطة</span>
            </div>

            {/* Agreements count */}
            <div className="flex justify-center gap-4 mb-4">
              <div className="flex items-center gap-1.5 bg-emerald/10 rounded-full px-4 py-1.5">
                <span className="text-emerald">🤝</span>
                <span className="text-emerald font-bold ltr-safe">{currentCountry.agreement_count}</span>
                <span className="text-emerald/70 text-sm">اتفاقية</span>
              </div>
            </div>

            {/* Rating (if exists) */}
            {currentCountry.rating && (
              <div className="mt-4 bg-bg rounded-xl p-4 border border-gray-200 text-right">
                <p className="text-xs font-bold text-slate-gray mb-1">📝 تقييم الأداء:</p>
                <p className="text-sm text-ink leading-relaxed whitespace-pre-wrap">{currentCountry.rating}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center gap-4 mt-8">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="flex items-center gap-2 bg-surface border border-gray-200 hover:border-royal-blue text-slate-gray hover:text-royal-blue font-bold px-6 py-3 rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:text-slate-gray"
        >
          <span className="ltr-safe">→</span>
          <span>السابق</span>
        </button>

        {isLast ? (
          <button
            onClick={handleReset}
            className="flex items-center gap-2 bg-gold hover:bg-gold/90 text-white font-bold px-8 py-3 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            <span>🔄</span>
            <span>إعادة العرض</span>
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="flex items-center gap-2 bg-royal-blue hover:bg-royal-blue/90 text-white font-bold px-8 py-3 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            <span>التالي</span>
            <span className="ltr-safe">←</span>
          </button>
        )}
      </div>

      {/* Keyboard hint */}
      <p className="text-xs text-slate-gray/50 mt-4">
        استخدم الأزرار للتنقل بين الدول
      </p>
    </div>
  )
}
