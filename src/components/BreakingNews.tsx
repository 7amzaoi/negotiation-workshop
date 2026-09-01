import { useState, useEffect, useCallback } from 'react'
import type { AgreementWithCountries } from '../types/database'
import { FlagImage } from './FlagImage'

interface BreakingNewsProps {
  agreement: AgreementWithCountries
  onDismiss: () => void
}

export function BreakingNews({ agreement, onDismiss }: BreakingNewsProps) {
  const [phase, setPhase] = useState<'enter' | 'scroll' | 'exit'>('enter')

  const handleDismiss = useCallback(() => {
    setPhase('exit')
    setTimeout(onDismiss, 600)
  }, [onDismiss])

  useEffect(() => {
    // Flash entrance, then start scrolling
    const enterTimer = setTimeout(() => setPhase('scroll'), 800)
    // Auto-dismiss after full scroll animation (entrance + scroll time)
    const dismissTimer = setTimeout(handleDismiss, 28000)
    return () => {
      clearTimeout(enterTimer)
      clearTimeout(dismissTimer)
    }
  }, [handleDismiss])

  // Build ticker content
  const bodyPreview = agreement.body.length > 120
    ? agreement.body.slice(0, 120) + '...'
    : agreement.body

  return (
    <div
      className={`
        fixed top-0 left-0 right-0 z-[100] transition-all duration-500
        ${phase === 'exit' ? 'opacity-0 -translate-y-full' : 'opacity-100 translate-y-0'}
      `}
    >
      {/* Main bar */}
      <div className="bg-gradient-to-l from-red-700 via-red-600 to-red-700 text-white shadow-2xl border-b-2 border-red-400">
        <div className="flex items-stretch h-12 md:h-14">
          {/* Label — stays fixed */}
          <div className="bg-red-800 flex items-center gap-2 px-3 md:px-5 shrink-0 z-10 border-l-2 border-red-400">
            <span className={`inline-block w-3 h-3 rounded-full bg-red-400 ${phase !== 'exit' ? 'breaking-pulse' : ''}`} />
            <span className="font-black text-sm md:text-base whitespace-nowrap tracking-wide">
              خبر عاجل
            </span>
          </div>

          {/* Ticker area */}
          <div className="flex-1 overflow-hidden relative">
            <div
              className={`
                absolute top-0 right-0 h-full flex items-center whitespace-nowrap
                ${phase === 'scroll' ? 'ticker-scroll' : ''}
                ${phase === 'enter' ? 'ticker-enter' : ''}
              `}
            >
              <span className="flex items-center gap-3 pe-4 ps-8 text-sm md:text-base font-semibold">
                {/* Title */}
                <span className="text-yellow-300 font-black">📜 {agreement.title}</span>

                <span className="text-red-300">|</span>

                {/* Body preview */}
                <span className="text-white/90">{bodyPreview}</span>

                <span className="text-red-300">|</span>

                {/* Countries with flags */}
                <span className="flex items-center gap-4">
                  <span className="text-yellow-300 font-bold">الدول:</span>
                  {agreement.countries.map(c => (
                    <span key={c.id} className="inline-flex items-center gap-1.5 mx-1">
                      <FlagImage emoji={c.flag_emoji} size="sm" />
                      <span>{c.name}</span>
                    </span>
                  ))}
                </span>

                {/* Repeated for continuous feel */}
                <span className="text-red-300 mx-6">★ ★ ★</span>
                <span className="text-yellow-300 font-black">📜 {agreement.title}</span>
                <span className="text-red-300 mx-2">|</span>
                <span className="text-white/90">{bodyPreview}</span>
              </span>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="flex items-center justify-center w-10 md:w-12 shrink-0 hover:bg-red-800 transition-colors"
            aria-label="إغلاق"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Bottom glow effect */}
      <div className="h-1 bg-gradient-to-l from-yellow-400 via-red-400 to-yellow-400 opacity-80" />
    </div>
  )
}
