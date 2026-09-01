import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  RadialBarChart, RadialBar, Legend,
} from 'recharts'
import { useCountries } from '../hooks/useCountries'
import { useAgreements } from '../hooks/useAgreements'
import { CountryCard } from '../components/CountryCard'
import { StatCard } from '../components/StatCard'
import { FlagImage } from '../components/FlagImage'
import { BreakingNews } from '../components/BreakingNews'
import { SkeletonCard, SkeletonStat } from '../components/SkeletonLoader'

const CHART_COLORS = ['#3B5323', '#8B7D3C', '#5E6B4E', '#A67C00', '#6B4226', '#4A5D3B', '#7A6B3A', '#556B2F', '#8B8B6E', '#704214']

const MEDAL_EMOJI: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' }

function LiveIndicator() {
  return (
    <div className="inline-flex items-center gap-2 bg-royal-blue/10 border border-royal-blue/20 rounded-full px-3 py-1">
      <span className="relative flex h-2.5 w-2.5">
        <span className="live-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
      </span>
      <span className="text-xs font-bold text-royal-blue">بث مباشر</span>
    </div>
  )
}

function TimeSince({ date }: { date: string }) {
  const [text, setText] = useState('')

  useEffect(() => {
    const update = () => {
      const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
      if (diff < 60) setText(`منذ ${diff} ثانية`)
      else if (diff < 3600) setText(`منذ ${Math.floor(diff / 60)} دقيقة`)
      else if (diff < 86400) setText(`منذ ${Math.floor(diff / 3600)} ساعة`)
      else setText(`منذ ${Math.floor(diff / 86400)} يوم`)
    }
    update()
    const id = setInterval(update, 10000)
    return () => clearInterval(id)
  }, [date])

  return <span className="text-xs text-slate-gray">{text}</span>
}

export function HomePage() {
  const { countries, loading: countriesLoading } = useCountries()
  const { agreements, loading: agreementsLoading, breakingNews, dismissBreakingNews } = useAgreements()

  const loading = countriesLoading || agreementsLoading

  // Derived stats
  const totalAgreements = agreements.length
  const totalPoints = countries.reduce((sum, c) => sum + c.points, 0)
  const leadingCountry = [...countries].sort((a, b) => b.points - a.points)[0]
  const mostActive = [...countries].sort((a, b) => b.agreement_count - a.agreement_count)[0]

  // Top 3 by points
  const top3 = [...countries].sort((a, b) => b.points - a.points).slice(0, 3)
  const maxPoints = top3[0]?.points || 1

  // Chart data
  const barChartData = [...countries]
    .sort((a, b) => b.agreement_count - a.agreement_count)
    .map(c => ({
      name: c.name,
      الاتفاقيات: c.agreement_count,
    }))

  const maxAgreements = Math.max(...countries.map(c => c.agreement_count), 1)
  const radialData = [...countries]
    .sort((a, b) => b.agreement_count - a.agreement_count)
    .map((c, i) => ({
      name: c.name,
      value: Math.round((c.agreement_count / maxAgreements) * 100),
      fill: CHART_COLORS[i % CHART_COLORS.length],
    }))

  // Recent agreements (last 3)
  const recentAgreements = agreements.slice(0, 3)

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Breaking News Ticker */}
      {breakingNews && (
        <BreakingNews
          agreement={breakingNews}
          onDismiss={dismissBreakingNews}
        />
      )}

      {/* Hero header */}
      <section className="text-center mb-8 animate-fade-in-up">
        <div className="flex justify-center mb-3">
          <LiveIndicator />
        </div>
        <h2 className="text-lg md:text-xl text-slate-gray font-semibold">
          تابع الأحداث لحظة بلحظة
        </h2>
      </section>

      {/* Stats strip */}
      <section className="mb-8">
        <div className="flex flex-wrap justify-center gap-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <SkeletonStat key={i} />)
          ) : (
            <>
              <div className="animate-fade-in-up" style={{ animationDelay: '0ms' }}>
                <StatCard icon="🌍" label="الدول" value={countries.length} sublabel="Countries" accent="primary" />
              </div>
              <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                <StatCard icon="🤝" label="إجمالي الاتفاقيات" value={totalAgreements} sublabel="Total Agreements" accent="secondary" />
              </div>
              <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                <StatCard
                  icon="🏆"
                  label="الدولة المتصدرة"
                  accent="gold"
                  value={leadingCountry ? (
                    <span className="inline-flex items-center gap-1.5">
                      <FlagImage emoji={leadingCountry.flag_emoji} size="sm" />
                      {leadingCountry.name}
                    </span>
                  ) : '—'}
                  sublabel="Leading Country"
                />
              </div>
              <div className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                <StatCard
                  icon="⭐"
                  label="إجمالي النقاط"
                  value={totalPoints}
                  sublabel="Total Points"
                  accent="accent"
                />
              </div>
            </>
          )}
        </div>
      </section>

      {/* Top 3 Podium */}
      {!loading && top3.length > 0 && top3[0].points > 0 && (
        <section className="mb-10">
          <div className="flex items-center justify-center gap-2 mb-5">
            <span className="h-px flex-1 max-w-20 bg-gold/30" />
            <h2 className="text-xl font-bold text-ink">🏅 المراكز الأولى</h2>
            <span className="h-px flex-1 max-w-20 bg-gold/30" />
          </div>

          <div className="flex justify-center items-end gap-3 md:gap-5">
            {/* Reorder: 2nd, 1st, 3rd for podium layout */}
            {[top3[1], top3[0], top3[2]].map((country, vi) => {
              if (!country) return null
              const rank = vi === 0 ? 2 : vi === 1 ? 1 : 3
              const heights = { 1: 'h-20 md:h-24', 2: 'h-14 md:h-20', 3: 'h-12 md:h-16' }
              const widths = { 1: 'w-32 md:w-40', 2: 'w-28 md:w-36', 3: 'w-28 md:w-36' }
              const barColors = {
                1: 'bg-gradient-to-t from-gold/80 to-gold/40',
                2: 'bg-gradient-to-t from-gray-400/60 to-gray-300/30',
                3: 'bg-gradient-to-t from-orange-600/50 to-orange-400/20',
              }

              return (
                <div
                  key={country.id}
                  className={`flex flex-col items-center animate-pop-in ${widths[rank as 1|2|3]}`}
                  style={{ animationDelay: `${vi * 150}ms` }}
                >
                  {/* Medal + Flag */}
                  <div className={`mb-2 ${rank === 1 ? 'animate-float' : ''}`}>
                    <div className="relative">
                      <FlagImage emoji={country.flag_emoji} size={rank === 1 ? 'xl' : 'lg'} />
                      <span className="absolute -top-2 -right-2 text-xl">
                        {MEDAL_EMOJI[rank]}
                      </span>
                    </div>
                  </div>

                  {/* Name + Points */}
                  <h3 className={`font-bold text-ink mb-1 text-center ${rank === 1 ? 'text-base md:text-lg' : 'text-sm md:text-base'}`}>
                    {country.name}
                  </h3>
                  <span className="text-gold font-black text-sm ltr-safe mb-2">
                    {country.points} نقطة
                  </span>

                  {/* Podium bar */}
                  <div className={`
                    ${heights[rank as 1|2|3]} w-full rounded-t-xl
                    ${barColors[rank as 1|2|3]}
                    border border-gold/20
                    flex items-center justify-center
                  `}>
                    <span className="text-2xl md:text-3xl font-black text-gold/60">{rank}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Recent Activity Feed */}
      {!loading && recentAgreements.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center justify-center gap-2 mb-5">
            <span className="h-px flex-1 max-w-20 bg-emerald/30" />
            <h2 className="text-xl font-bold text-ink">📋 آخر النشاطات</h2>
            <span className="h-px flex-1 max-w-20 bg-emerald/30" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-4xl mx-auto">
            {recentAgreements.map((ag, i) => (
              <div
                key={ag.id}
                className="bg-surface rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 animate-fade-in-up"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="flex items-start gap-2 mb-2">
                  <span className="text-emerald text-lg shrink-0">📜</span>
                  <div className="min-w-0">
                    <h4 className="font-bold text-ink text-sm truncate">{ag.title}</h4>
                    <TimeSince date={ag.created_at} />
                  </div>
                </div>
                <p className="text-xs text-slate-gray line-clamp-2 mb-2">{ag.body}</p>
                <div className="flex flex-wrap gap-1.5">
                  {ag.countries.map(c => (
                    <span key={c.id} className="inline-flex items-center gap-1 bg-royal-blue/5 rounded-full px-2 py-0.5">
                      <FlagImage emoji={c.flag_emoji} size="sm" />
                      <span className="text-[10px] font-semibold text-ink">{c.name}</span>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Country grid */}
      <section className="mb-10">
        <div className="flex items-center justify-center gap-2 mb-5">
          <span className="h-px flex-1 max-w-20 bg-royal-blue/30" />
          <h2 className="text-xl font-bold text-ink">🏳️ الدول المشاركة</h2>
          <span className="h-px flex-1 max-w-20 bg-royal-blue/30" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {loading
            ? Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)
            : countries.map((country, i) => (
                <div
                  key={country.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <CountryCard country={country} agreements={agreements} />
                </div>
              ))
          }
        </div>
      </section>

      {/* Chart 1: Agreements Bar Chart */}
      <section className="mb-10 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        <div className="bg-surface rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">📊</span>
            <h2 className="text-xl font-bold text-ink">الاتفاقيات حسب الدولة</h2>
          </div>
          {loading ? (
            <div className="skeleton h-72 w-full" />
          ) : (
            <div dir="ltr" style={{ width: '100%', height: 350 }}>
              <ResponsiveContainer>
                <BarChart data={barChartData} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ddd8cc" />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 13 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FEFCF7',
                      border: '1px solid #ddd8cc',
                      borderRadius: '10px',
                      fontFamily: 'Cairo',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    }}
                  />
                  <Bar dataKey="الاتفاقيات" radius={[0, 8, 8, 0]} animationDuration={1200}>
                    {barChartData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </section>

      {/* Chart 2: Participation Radial */}
      <section className="mb-10 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
        <div className="bg-surface rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">🎯</span>
            <h2 className="text-xl font-bold text-ink">مستوى مشاركة الدول</h2>
          </div>
          {loading ? (
            <div className="skeleton h-72 w-full" />
          ) : (
            <div dir="ltr" style={{ width: '100%', height: 400 }}>
              <ResponsiveContainer>
                <RadialBarChart
                  cx="50%"
                  cy="50%"
                  innerRadius="15%"
                  outerRadius="90%"
                  data={radialData}
                  startAngle={180}
                  endAngle={0}
                >
                  <RadialBar
                    background
                    dataKey="value"
                    cornerRadius={6}
                  />
                  <Legend
                    iconSize={10}
                    layout="horizontal"
                    verticalAlign="bottom"
                    wrapperStyle={{ fontFamily: 'Cairo', fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FEFCF7',
                      border: '1px solid #ddd8cc',
                      borderRadius: '10px',
                      fontFamily: 'Cairo',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    }}
                    formatter={(value) => [`${value}%`, 'نسبة المشاركة']}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </section>

      {/* CTA Button */}
      <section className="text-center py-8 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
        <Link
          to="/results"
          className="
            inline-flex items-center gap-3
            bg-gradient-to-l from-royal-blue to-royal-blue/90
            hover:from-royal-blue/95 hover:to-royal-blue/80
            text-white text-xl font-bold px-10 py-4 rounded-2xl
            shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1
            group
          "
        >
          <span className="group-hover:scale-110 transition-transform">🏆</span>
          <span>عرض النتائج النهائية</span>
          <span className="ltr-safe group-hover:-translate-x-1 transition-transform">←</span>
        </Link>
      </section>
    </div>
  )
}
