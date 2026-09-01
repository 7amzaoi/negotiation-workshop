import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useCountries } from '../hooks/useCountries'
import { useAgreements } from '../hooks/useAgreements'
import { ProtectedRoute } from '../components/ProtectedRoute'
import { showToast } from '../components/Toast'
import type { CountryWithAgreements } from '../types/database'

function LoginForm() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await signIn(email, password)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل تسجيل الدخول')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4">
      <div className="bg-surface rounded-2xl border border-gray-200 shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-black text-royal-blue mb-1">🔐 لوحة التحكم</h1>
          <p className="text-sm text-slate-gray">سجّل دخولك لإدارة الورشة</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-ink mb-1">البريد الإلكتروني</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full bg-bg border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-royal-blue focus:ring-2 focus:ring-royal-blue/20 transition ltr-safe"
              placeholder="admin@example.com"
              dir="ltr"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-ink mb-1">كلمة المرور</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full bg-bg border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-royal-blue focus:ring-2 focus:ring-royal-blue/20 transition"
              dir="ltr"
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-2 border border-red-200">
              ❌ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-royal-blue hover:bg-royal-blue/90 text-white font-bold py-3 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'جاري الدخول...' : 'تسجيل الدخول'}
          </button>
        </form>
      </div>
    </div>
  )
}

function PointsCard({ country, onUpdate }: { country: CountryWithAgreements; onUpdate: (id: string, points: number) => Promise<void> }) {
  const [points, setPoints] = useState(country.points)
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)

  // Sync from realtime only when user hasn't edited locally
  useEffect(() => {
    if (!dirty && !saving) {
      setPoints(country.points)
    }
  }, [country.points, dirty, saving])

  const handleUpdate = async () => {
    setSaving(true)
    try {
      await onUpdate(country.id, points)
      showToast(`✅ تم تحديث نقاط ${country.name}`, 'success')
      setDirty(false)
    } catch {
      showToast(`❌ فشل تحديث نقاط ${country.name}`, 'error')
      setPoints(country.points) // revert
      setDirty(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-surface rounded-xl border border-gray-200 p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-3xl ltr-safe">{country.flag_emoji}</span>
        <span className="font-bold text-ink">{country.name}</span>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={points}
          onChange={e => { setPoints(parseInt(e.target.value) || 0); setDirty(true) }}
          className="flex-1 bg-bg border border-gray-200 rounded-lg px-3 py-2 text-center font-bold text-lg focus:outline-none focus:border-royal-blue focus:ring-2 focus:ring-royal-blue/20 transition ltr-safe"
          dir="ltr"
        />
        <button
          onClick={handleUpdate}
          disabled={saving || !dirty}
          className="bg-emerald hover:bg-emerald/90 text-white font-bold px-4 py-2 rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed text-sm"
        >
          {saving ? '...' : 'تحديث'}
        </button>
      </div>
      <p className="text-xs text-slate-gray mt-2 text-center">
        الاتفاقيات: <span className="font-bold ltr-safe">{country.agreement_count}</span>
      </p>
    </div>
  )
}

function DashboardContent() {
  const { signOut } = useAuth()
  const { countries, loading: countriesLoading, updatePoints } = useCountries()
  const { agreements, loading: agreementsLoading, createAgreement } = useAgreements()

  // New agreement form state
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [selectedCountries, setSelectedCountries] = useState<string[]>([])
  const [creatingAgreement, setCreatingAgreement] = useState(false)

  const toggleCountry = (id: string) => {
    setSelectedCountries(prev =>
      prev.includes(id) ? prev.filter(cId => cId !== id) : [...prev, id]
    )
  }

  const handleCreateAgreement = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      showToast('❌ يرجى إدخال عنوان الاتفاقية', 'error')
      return
    }
    if (!body.trim()) {
      showToast('❌ يرجى إدخال نص الاتفاقية', 'error')
      return
    }
    if (selectedCountries.length === 0) {
      showToast('❌ يرجى اختيار دولة واحدة على الأقل', 'error')
      return
    }

    setCreatingAgreement(true)
    try {
      await createAgreement(title.trim(), body.trim(), selectedCountries)
      showToast('✅ تم إنشاء الاتفاقية بنجاح!', 'success')
      setTitle('')
      setBody('')
      setSelectedCountries([])
    } catch {
      showToast('❌ فشل إنشاء الاتفاقية — تحقق من الاتصال', 'error')
    } finally {
      setCreatingAgreement(false)
    }
  }

  const loading = countriesLoading || agreementsLoading

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-royal-blue">⚙️ لوحة التحكم</h1>
          <p className="text-sm text-slate-gray mt-1">إدارة النقاط والاتفاقيات</p>
        </div>
        <button
          onClick={signOut}
          className="bg-red-50 hover:bg-red-100 text-red-600 font-semibold px-4 py-2 rounded-xl transition text-sm border border-red-200"
        >
          تسجيل الخروج
        </button>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <div className="bg-royal-blue/5 rounded-xl p-3 text-center">
          <p className="text-2xl font-black text-royal-blue ltr-safe">{countries.length}</p>
          <p className="text-xs text-slate-gray font-semibold">دولة</p>
        </div>
        <div className="bg-emerald/5 rounded-xl p-3 text-center">
          <p className="text-2xl font-black text-emerald ltr-safe">{agreements.length}</p>
          <p className="text-xs text-slate-gray font-semibold">اتفاقية</p>
        </div>
        <div className="bg-lavender/5 rounded-xl p-3 text-center">
          <p className="text-2xl font-black text-lavender ltr-safe">
            {countries.reduce((sum, c) => sum + c.points, 0)}
          </p>
          <p className="text-xs text-slate-gray font-semibold">إجمالي النقاط</p>
        </div>
        <div className="bg-gold/5 rounded-xl p-3 text-center">
          <p className="text-2xl font-black text-gold ltr-safe">
            {countries.reduce((sum, c) => sum + c.agreement_count, 0)}
          </p>
          <p className="text-xs text-slate-gray font-semibold">إجمالي المشاركات</p>
        </div>
      </div>

      {/* Section A: Country Points */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-ink mb-4 flex items-center gap-2">
          <span>🏳️</span> تحديث نقاط الدول
        </h2>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="skeleton h-36 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {countries.map(country => (
              <PointsCard key={country.id} country={country} onUpdate={updatePoints} />
            ))}
          </div>
        )}
      </section>

      {/* Section B: Create Agreement */}
      <section>
        <h2 className="text-xl font-bold text-ink mb-4 flex items-center gap-2">
          <span>📝</span> إنشاء اتفاقية جديدة
        </h2>
        <form onSubmit={handleCreateAgreement} className="bg-surface rounded-2xl border border-gray-200 p-6 shadow-sm">
          {/* Title */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-ink mb-1">عنوان الاتفاقية</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="مثال: اتفاقية تجارة حرة"
              className="w-full bg-bg border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-royal-blue focus:ring-2 focus:ring-royal-blue/20 transition"
            />
          </div>

          {/* Body */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-ink mb-1">نص الاتفاقية</label>
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="اكتب نص الاتفاقية الكامل هنا..."
              rows={4}
              className="w-full bg-bg border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-royal-blue focus:ring-2 focus:ring-royal-blue/20 transition resize-y"
            />
          </div>

          {/* Country selection */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-ink mb-2">
              اختر الدول المشاركة
              {selectedCountries.length > 0 && (
                <span className="text-royal-blue ms-2 ltr-safe">({selectedCountries.length} دولة)</span>
              )}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {countries.map(c => {
                const isSelected = selectedCountries.includes(c.id)
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggleCountry(c.id)}
                    className={`
                      flex items-center gap-2 px-3 py-2 rounded-xl border-2 text-sm font-semibold transition-all
                      ${isSelected
                        ? 'border-royal-blue bg-royal-blue/10 text-royal-blue'
                        : 'border-gray-200 bg-bg text-slate-gray hover:border-lavender'
                      }
                    `}
                  >
                    <span className="ltr-safe">{c.flag_emoji}</span>
                    <span className="truncate">{c.name}</span>
                    {isSelected && <span className="ms-auto ltr-safe">✓</span>}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={creatingAgreement}
            className="w-full bg-royal-blue hover:bg-royal-blue/90 text-white font-bold py-3 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed text-lg"
          >
            {creatingAgreement ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                جاري الحفظ...
              </span>
            ) : (
              '💾 حفظ الاتفاقية'
            )}
          </button>
        </form>
      </section>
    </div>
  )
}

export function DashboardPage() {
  const { session, loading } = useAuth()

  return (
    <ProtectedRoute
      session={session}
      loading={loading}
      loginComponent={<LoginForm />}
    >
      <DashboardContent />
    </ProtectedRoute>
  )
}
