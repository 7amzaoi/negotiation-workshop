import { Link } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  RadialBarChart, RadialBar, Legend,
} from 'recharts'
import { useCountries } from '../hooks/useCountries'
import { useAgreements } from '../hooks/useAgreements'
import { CountryCard } from '../components/CountryCard'
import { StatCard } from '../components/StatCard'
import { SkeletonCard, SkeletonStat, SkeletonChart } from '../components/SkeletonLoader'

const CHART_COLORS = ['#1E33D6', '#14B26B', '#6E7CE0', '#D4AF37', '#E74C3C', '#3498DB', '#9B59B6', '#F39C12', '#1ABC9C', '#E67E22']

export function HomePage() {
  const { countries, loading: countriesLoading } = useCountries()
  const { agreements, loading: agreementsLoading } = useAgreements()

  const loading = countriesLoading || agreementsLoading

  // Derived stats
  const totalAgreements = agreements.length
  const leadingCountry = [...countries].sort((a, b) => b.points - a.points)[0]
  const mostActive = [...countries].sort((a, b) => b.agreement_count - a.agreement_count)[0]

  // Chart 1: Agreements by country (sorted descending)
  const barChartData = [...countries]
    .sort((a, b) => b.agreement_count - a.agreement_count)
    .map(c => ({
      name: `${c.flag_emoji} ${c.name}`,
      الاتفاقيات: c.agreement_count,
    }))

  // Chart 2: Participation ranking (radial)
  const maxAgreements = Math.max(...countries.map(c => c.agreement_count), 1)
  const radialData = [...countries]
    .sort((a, b) => b.agreement_count - a.agreement_count)
    .map((c, i) => ({
      name: `${c.flag_emoji} ${c.name}`,
      value: Math.round((c.agreement_count / maxAgreements) * 100),
      fill: CHART_COLORS[i % CHART_COLORS.length],
    }))

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Stats strip */}
      <section className="mb-8">
        <div className="flex flex-wrap justify-center gap-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <SkeletonStat key={i} />)
          ) : (
            <>
              <StatCard icon="🌍" label="الدول" value={countries.length} sublabel="Countries" />
              <StatCard icon="🤝" label="إجمالي الاتفاقيات" value={totalAgreements} sublabel="Total Agreements" />
              <StatCard
                icon="🏆"
                label="الدولة المتصدرة"
                value={leadingCountry ? `${leadingCountry.flag_emoji} ${leadingCountry.name}` : '—'}
                sublabel="Leading Country"
              />
              <StatCard
                icon="📈"
                label="الأكثر نشاطاً"
                value={mostActive ? `${mostActive.flag_emoji} ${mostActive.name}` : '—'}
                sublabel="Most Active"
              />
            </>
          )}
        </div>
      </section>

      {/* Country grid */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-ink mb-4">🏳️ الدول المشاركة</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {loading
            ? Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)
            : countries.map(country => (
                <CountryCard key={country.id} country={country} agreements={agreements} />
              ))
          }
        </div>
      </section>

      {/* Chart 1: Agreements Bar Chart */}
      <section className="mb-10">
        <div className="bg-surface rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-ink mb-4">📊 الاتفاقيات حسب الدولة</h2>
          {loading ? (
            <div className="skeleton h-72 w-full" />
          ) : (
            <div dir="ltr" style={{ width: '100%', height: 350 }}>
              <ResponsiveContainer>
                <BarChart data={barChartData} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 13 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      fontFamily: 'Cairo',
                    }}
                  />
                  <Bar dataKey="الاتفاقيات" radius={[0, 6, 6, 0]}>
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
      <section className="mb-10">
        <div className="bg-surface rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-ink mb-4">🎯 مستوى مشاركة الدول</h2>
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
                      backgroundColor: '#fff',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      fontFamily: 'Cairo',
                    }}
                    formatter={(value: number) => [`${value}%`, 'نسبة المشاركة']}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </section>

      {/* CTA Button */}
      <section className="text-center py-8">
        <Link
          to="/results"
          className="inline-flex items-center gap-3 bg-royal-blue hover:bg-royal-blue/90 text-white text-xl font-bold px-10 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5"
        >
          <span>🏆</span>
          <span>عرض النتائج النهائية</span>
          <span className="ltr-safe">←</span>
        </Link>
      </section>
    </div>
  )
}
