import { Link, useLocation } from 'react-router-dom'

const navItems = [
  { path: '/', label: 'الرئيسية' },
  { path: '/results', label: 'النتائج' },
  { path: '/agreements', label: 'الاتفاقيات' },
  { path: '/geopolitics', label: 'السياق الجيوسياسي' },
]

export function Header() {
  const location = useLocation()

  return (
    <header className="bg-surface border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3">
        {/* Logo in corner + Title centered */}
        <div className="flex items-center justify-between mb-3">
          {/* Logo — right corner (first in RTL), bigger */}
          <img src="/logo.webp" alt="شؤون الشباب" className="h-24 md:h-32 w-auto object-contain" />

          {/* Title — centered */}
          <div className="text-center">
            <h1 className="text-2xl md:text-3xl font-black text-royal-blue leading-tight">
              ورشة التفاوض السياسي
            </h1>
            <p className="text-xs text-slate-gray font-inter ltr-safe">
              Political Negotiation Workshop
            </p>
          </div>

          {/* Spacer for balance */}
          <div className="w-24 md:w-32" />
        </div>

        {/* Navigation */}
        <nav className="flex justify-center gap-2">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200
                ${location.pathname === item.path
                  ? 'bg-royal-blue text-white shadow-md'
                  : 'text-slate-gray hover:bg-gray-100 hover:text-royal-blue'
                }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
