import type { ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'

interface ProtectedRouteProps {
  session: Session | null
  loading: boolean
  children: ReactNode
  loginComponent: ReactNode
}

export function ProtectedRoute({ session, loading, children, loginComponent }: ProtectedRouteProps) {
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-royal-blue border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-gray font-semibold">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return <>{loginComponent}</>
  }

  return <>{children}</>
}
