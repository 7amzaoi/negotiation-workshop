import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useCountries } from '../hooks/useCountries'
import { useAgreements } from '../hooks/useAgreements'
import { ProtectedRoute } from '../components/ProtectedRoute'
import { showToast } from '../components/Toast'
import { FlagImage } from '../components/FlagImage'
import type { CountryWithAgreements, AgreementWithCountries } from '../types/database'

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
          <img src="/logo.webp" alt="شؤون الشباب" className="h-24 mx-auto mb-3" />
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

function PointsCard({
  country,
  onUpdatePoints,
  onUpdateRating,
}: {
  country: CountryWithAgreements
  onUpdatePoints: (id: string, points: number) => Promise<void>
  onUpdateRating: (id: string, rating: string) => Promise<void>
}) {
  const [points, setPoints] = useState(country.points)
  const [rating, setRating] = useState(country.rating || '')
  const [saving, setSaving] = useState(false)
  const [savingRating, setSavingRating] = useState(false)
  const [dirtyPoints, setDirtyPoints] = useState(false)
  const [dirtyRating, setDirtyRating] = useState(false)

  // Sync from realtime only when user hasn't edited locally
  useEffect(() => {
    if (!dirtyPoints && !saving) setPoints(country.points)
  }, [country.points, dirtyPoints, saving])

  useEffect(() => {
    if (!dirtyRating && !savingRating) setRating(country.rating || '')
  }, [country.rating, dirtyRating, savingRating])

  const handleUpdatePoints = async () => {
    setSaving(true)
    try {
      await onUpdatePoints(country.id, points)
      showToast(`✅ تم تحديث نقاط ${country.name}`, 'success')
      setDirtyPoints(false)
    } catch {
      showToast(`❌ فشل تحديث نقاط ${country.name}`, 'error')
      setPoints(country.points)
      setDirtyPoints(false)
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateRating = async () => {
    setSavingRating(true)
    try {
      await onUpdateRating(country.id, rating)
      showToast(`✅ تم حفظ تقييم ${country.name}`, 'success')
      setDirtyRating(false)
    } catch {
      showToast(`❌ فشل حفظ تقييم ${country.name}`, 'error')
      setRating(country.rating || '')
      setDirtyRating(false)
    } finally {
      setSavingRating(false)
    }
  }

  return (
    <div className="bg-surface rounded-xl border border-gray-200 p-3 shadow-sm overflow-hidden">
      {/* Flag + Name */}
      <div className="flex items-center gap-2 mb-2">
        <FlagImage emoji={country.flag_emoji} size="sm" />
        <span className="font-bold text-ink text-sm truncate">{country.name}</span>
      </div>
      {/* Points: Input + Button */}
      <div className="flex items-center gap-1.5 mb-2">
        <input
          type="number"
          value={points}
          onChange={e => { setPoints(parseInt(e.target.value) || 0); setDirtyPoints(true) }}
          className="w-0 flex-1 min-w-0 bg-bg border border-gray-200 rounded-lg px-2 py-1.5 text-center font-bold text-lg focus:outline-none focus:border-royal-blue focus:ring-2 focus:ring-royal-blue/20 transition ltr-safe"
          dir="ltr"
        />
        <button
          onClick={handleUpdatePoints}
          disabled={saving || !dirtyPoints}
          className="bg-emerald hover:bg-emerald/90 text-white font-bold px-3 py-1.5 rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed text-xs whitespace-nowrap shrink-0"
        >
          {saving ? '...' : 'تحديث'}
        </button>
      </div>
      {/* Rating textarea */}
      <div className="mb-1.5">
        <textarea
          value={rating}
          onChange={e => { setRating(e.target.value); setDirtyRating(true) }}
          placeholder="اكتب تقييم الدولة..."
          rows={2}
          className="w-full bg-bg border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-royal-blue focus:ring-2 focus:ring-royal-blue/20 transition resize-y"
        />
        {dirtyRating && (
          <button
            onClick={handleUpdateRating}
            disabled={savingRating}
            className="w-full mt-1 bg-lavender hover:bg-lavender/90 text-white font-bold py-1 rounded-lg transition disabled:opacity-40 text-[11px]"
          >
            {savingRating ? '...' : '💾 حفظ التقييم'}
          </button>
        )}
      </div>
      <p className="text-[11px] text-slate-gray text-center">
        الاتفاقيات: <span className="font-bold ltr-safe">{country.agreement_count}</span>
      </p>
    </div>
  )
}

// --- Agreement archive card with inline edit ---
function AgreementArchiveCard({
  agreement,
  countries: allCountries,
  onDelete,
  onUpdate,
}: {
  agreement: AgreementWithCountries
  countries: CountryWithAgreements[]
  onDelete: (id: string) => Promise<void>
  onUpdate: (id: string, title: string, body: string, countryIds: string[], impact: string) => Promise<void>
}) {
  const [editing, setEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(agreement.title)
  const [editBody, setEditBody] = useState(agreement.body)
  const [editImpact, setEditImpact] = useState(agreement.impact || '')
  const [editCountries, setEditCountries] = useState<string[]>(agreement.countries.map(c => c.id))
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const toggleCountry = (id: string) => {
    setEditCountries(prev =>
      prev.includes(id) ? prev.filter(cId => cId !== id) : [...prev, id]
    )
  }

  const handleSave = async () => {
    if (!editTitle.trim() || !editBody.trim() || editCountries.length === 0) {
      showToast('❌ يرجى تعبئة جميع الحقول', 'error')
      return
    }
    setSaving(true)
    try {
      await onUpdate(agreement.id, editTitle.trim(), editBody.trim(), editCountries, editImpact.trim())
      showToast('✅ تم تحديث الاتفاقية', 'success')
      setEditing(false)
    } catch {
      showToast('❌ فشل تحديث الاتفاقية', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await onDelete(agreement.id)
      showToast('🗑️ تم حذف الاتفاقية', 'success')
    } catch {
      showToast('❌ فشل حذف الاتفاقية', 'error')
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('ar-SA', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    })

  if (editing) {
    return (
      <div className="bg-surface rounded-xl border-2 border-royal-blue/30 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-bold text-royal-blue">✏️ تعديل الاتفاقية</h4>
          <button onClick={() => setEditing(false)} className="text-xs text-slate-gray hover:text-ink transition">
            إلغاء ✕
          </button>
        </div>
        <input
          type="text"
          value={editTitle}
          onChange={e => setEditTitle(e.target.value)}
          className="w-full bg-bg border border-gray-200 rounded-lg px-3 py-2 text-sm mb-2 focus:outline-none focus:border-royal-blue focus:ring-2 focus:ring-royal-blue/20 transition"
          placeholder="عنوان الاتفاقية"
        />
        <textarea
          value={editBody}
          onChange={e => setEditBody(e.target.value)}
          rows={3}
          className="w-full bg-bg border border-gray-200 rounded-lg px-3 py-2 text-sm mb-2 focus:outline-none focus:border-royal-blue focus:ring-2 focus:ring-royal-blue/20 transition resize-y"
          placeholder="نص الاتفاقية"
        />
        <textarea
          value={editImpact}
          onChange={e => setEditImpact(e.target.value)}
          rows={2}
          className="w-full bg-bg border border-gray-200 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:border-royal-blue focus:ring-2 focus:ring-royal-blue/20 transition resize-y"
          placeholder="أثر الاتفاقية..."
        />
        <p className="text-xs font-semibold text-ink mb-1.5">الدول المشاركة:</p>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {allCountries.map(c => {
            const isSelected = editCountries.includes(c.id)
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => toggleCountry(c.id)}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border text-[11px] font-semibold transition-all
                  ${isSelected ? 'border-royal-blue bg-royal-blue/10 text-royal-blue' : 'border-gray-200 bg-bg text-slate-gray'}`}
              >
                <FlagImage emoji={c.flag_emoji} size="sm" />
                {c.name}
              </button>
            )
          })}
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-royal-blue hover:bg-royal-blue/90 text-white font-bold py-2 rounded-lg transition text-sm disabled:opacity-50"
        >
          {saving ? 'جاري الحفظ...' : '💾 حفظ التعديلات'}
        </button>
      </div>
    )
  }

  return (
    <div className="bg-surface rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3 mb-2">
        <h4 className="font-bold text-ink text-sm leading-snug">{agreement.title}</h4>
        <time className="text-[11px] text-slate-gray whitespace-nowrap ltr-safe shrink-0">{formatDate(agreement.created_at)}</time>
      </div>
      <p className="text-xs text-slate-gray leading-relaxed mb-2 line-clamp-2">{agreement.body}</p>
      {agreement.impact && (
        <div className="bg-gold/5 border border-gold/20 rounded-lg px-3 py-1.5 mb-2">
          <p className="text-[11px] font-bold text-gold mb-0.5">⚡ أثر الاتفاقية:</p>
          <p className="text-xs text-ink line-clamp-2">{agreement.impact}</p>
        </div>
      )}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {agreement.countries.map(c => (
          <span key={c.id} className="inline-flex items-center gap-1 bg-royal-blue/5 text-ink text-[11px] font-semibold px-2 py-0.5 rounded-full">
            <FlagImage emoji={c.flag_emoji} size="sm" />
            {c.name}
          </span>
        ))}
      </div>
      <div className="flex items-center gap-2 border-t border-gray-100 pt-2">
        <button
          onClick={() => {
            setEditTitle(agreement.title)
            setEditBody(agreement.body)
            setEditImpact(agreement.impact || '')
            setEditCountries(agreement.countries.map(c => c.id))
            setEditing(true)
          }}
          className="flex-1 text-xs font-semibold text-royal-blue hover:bg-royal-blue/5 py-1.5 rounded-lg transition"
        >
          ✏️ تعديل
        </button>
        {confirmDelete ? (
          <div className="flex-1 flex items-center gap-1">
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex-1 text-xs font-bold text-white bg-red-500 hover:bg-red-600 py-1.5 rounded-lg transition disabled:opacity-50"
            >
              {deleting ? '...' : 'تأكيد الحذف'}
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="text-xs text-slate-gray hover:text-ink py-1.5 px-2 transition"
            >
              إلغاء
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            className="flex-1 text-xs font-semibold text-red-500 hover:bg-red-50 py-1.5 rounded-lg transition"
          >
            🗑️ حذف
          </button>
        )}
      </div>
    </div>
  )
}

function DashboardContent() {
  const { signOut } = useAuth()
  const { countries, loading: countriesLoading, updatePoints, updateRating } = useCountries()
  const { agreements, loading: agreementsLoading, createAgreement, deleteAgreement, updateAgreement } = useAgreements()

  // New agreement form state
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [impact, setImpact] = useState('')
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
      await createAgreement(title.trim(), body.trim(), selectedCountries, impact.trim())
      showToast('✅ تم إنشاء الاتفاقية بنجاح!', 'success')
      setTitle('')
      setBody('')
      setImpact('')
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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="skeleton h-28 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {countries.map(country => (
              <PointsCard key={country.id} country={country} onUpdatePoints={updatePoints} onUpdateRating={updateRating} />
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

          {/* Impact */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-ink mb-1">أثر الاتفاقية</label>
            <textarea
              value={impact}
              onChange={e => setImpact(e.target.value)}
              placeholder="اكتب أثر الاتفاقية على الدول المشاركة..."
              rows={3}
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
            <div className="flex flex-wrap gap-2">
              {countries.map(c => {
                const isSelected = selectedCountries.includes(c.id)
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggleCountry(c.id)}
                    className={`
                      inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border-2 text-xs font-semibold transition-all
                      ${isSelected
                        ? 'border-royal-blue bg-royal-blue/10 text-royal-blue'
                        : 'border-gray-200 bg-bg text-slate-gray hover:border-lavender'
                      }
                    `}
                  >
                    <FlagImage emoji={c.flag_emoji} size="sm" />
                    <span>{c.name}</span>
                    {isSelected && <span className="ltr-safe">✓</span>}
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

      {/* Section C: Agreements Archive */}
      <section className="mt-10">
        <h2 className="text-xl font-bold text-ink mb-4 flex items-center gap-2">
          <span>📜</span> أرشيف الاتفاقيات
          <span className="text-sm font-normal text-slate-gray">({agreements.length})</span>
        </h2>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton h-32 rounded-xl" />
            ))}
          </div>
        ) : agreements.length === 0 ? (
          <div className="bg-surface rounded-xl border border-gray-200 p-8 text-center">
            <span className="text-4xl block mb-2">📭</span>
            <p className="text-slate-gray font-semibold">لا توجد اتفاقيات بعد</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {agreements.map(agreement => (
              <AgreementArchiveCard
                key={agreement.id}
                agreement={agreement}
                countries={countries}
                onDelete={deleteAgreement}
                onUpdate={updateAgreement}
              />
            ))}
          </div>
        )}
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
