import { useState } from 'react'
import { useAgreements } from '../hooks/useAgreements'
import { useCountries } from '../hooks/useCountries'
import { SkeletonRow } from '../components/SkeletonLoader'
import { FlagImage } from '../components/FlagImage'

export function AgreementsPage() {
  const { agreements, loading } = useAgreements()
  const { countries } = useCountries()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCountryId, setFilterCountryId] = useState<string>('')

  const filtered = agreements.filter(a => {
    const matchesSearch = !searchQuery ||
      a.title.includes(searchQuery) ||
      a.body.includes(searchQuery)
    const matchesCountry = !filterCountryId ||
      a.countries.some(c => c.id === filterCountryId)
    return matchesSearch && matchesCountry
  })

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-black text-royal-blue mb-2">
          📜 أرشيف الاتفاقيات
        </h1>
        <p className="text-slate-gray">جميع الاتفاقيات المبرمة بين الدول</p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="🔍 بحث في الاتفاقيات..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="flex-1 bg-surface border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-royal-blue focus:ring-2 focus:ring-royal-blue/20 transition"
        />
        <select
          value={filterCountryId}
          onChange={e => setFilterCountryId(e.target.value)}
          className="bg-surface border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-royal-blue focus:ring-2 focus:ring-royal-blue/20 transition min-w-[160px]"
        >
          <option value="">كل الدول</option>
          {countries.map(c => (
            <option key={c.id} value={c.id}>
              {c.flag_emoji} {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Results count */}
      <p className="text-sm text-slate-gray mb-4">
        عدد النتائج: <span className="font-bold text-ink ltr-safe">{filtered.length}</span>
      </p>

      {/* Agreements list */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <span className="text-6xl mb-4 block">📭</span>
          <p className="text-xl text-slate-gray font-semibold">لا توجد اتفاقيات حتى الآن</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(agreement => (
            <div
              key={agreement.id}
              className="bg-surface rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Header row */}
              <div className="flex items-start justify-between gap-4 mb-3">
                <h3 className="text-lg font-bold text-ink">{agreement.title}</h3>
                <time className="text-xs text-slate-gray whitespace-nowrap ltr-safe">
                  {formatDate(agreement.created_at)}
                </time>
              </div>

              {/* Body */}
              <p className="text-sm text-slate-gray leading-relaxed mb-3 whitespace-pre-wrap">
                {agreement.body}
              </p>

              {/* Participating countries */}
              <div className="border-t border-gray-100 pt-3">
                <p className="text-xs text-slate-gray mb-2 font-semibold">الدول المشاركة:</p>
                <div className="flex flex-wrap gap-2">
                  {agreement.countries.map(c => (
                    <span
                      key={c.id}
                      className="inline-flex items-center gap-1.5 bg-royal-blue/5 text-ink text-xs font-semibold px-2.5 py-1 rounded-full"
                    >
                      <FlagImage emoji={c.flag_emoji} size="sm" />
                      {c.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
