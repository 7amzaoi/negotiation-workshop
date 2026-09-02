import { useSettings } from '../hooks/useSettings'

export function GeopoliticsPage() {
  const { geopoliticsTitle, geopoliticsBody, loading } = useSettings()

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

  if (!geopoliticsTitle && !geopoliticsBody) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center px-4">
        <div className="text-center animate-fade-in-up">
          <span className="text-7xl block mb-5">🌍</span>
          <h2 className="text-3xl font-black text-ink mb-3">السياق الجيوسياسي</h2>
          <p className="text-lg text-slate-gray">لم يتم إضافة محتوى بعد... ترقبوا!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="text-center mb-8 animate-fade-in-up">
        <h1 className="text-3xl md:text-4xl font-black text-royal-blue mb-2">
          🌍 السياق الجيوسياسي
        </h1>
        <p className="text-slate-gray">الإطار العام للمفاوضات</p>
      </div>

      <div className="bg-surface rounded-2xl border border-gray-200 shadow-lg overflow-hidden animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        {/* Card header */}
        <div className="bg-gradient-to-l from-royal-blue/10 via-royal-blue/5 to-transparent px-6 py-5 border-b border-gray-100">
          <h2 className="text-xl md:text-2xl font-black text-ink">
            {geopoliticsTitle}
          </h2>
        </div>

        {/* Card body */}
        <div className="px-6 py-6">
          <p className="text-base text-ink leading-loose whitespace-pre-wrap">
            {geopoliticsBody}
          </p>
        </div>
      </div>
    </div>
  )
}
