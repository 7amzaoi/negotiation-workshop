import { Link, useLocation } from 'react-router-dom'

const navItems = [
  { path: '/', label: 'الرئيسية' },
  { path: '/results', label: 'النتائج' },
  { path: '/agreements', label: 'الاتفاقيات' },
]

export function Header() {
  const location = useLocation()

  return (
    <header className="bg-surface border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Title */}
        <div className="text-center mb-3">
          <h1 className="text-3xl md:text-4xl font-black text-royal-blue leading-tight">
            ورشة التفاوض السياسي
          </h1>
          <p className="text-sm text-slate-gray font-inter mt-1 ltr-safe">
            Political Negotiation Workshop
          </p>
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
