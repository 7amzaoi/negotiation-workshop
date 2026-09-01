import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

const isConfigured =
  supabaseUrl &&
  !supabaseUrl.includes('__REPLACE') &&
  supabaseAnonKey &&
  !supabaseAnonKey.includes('__REPLACE')

if (!isConfigured) {
  console.warn('⚠️ Supabase not configured — running in demo mode. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local')
}

const safeUrl = isConfigured ? supabaseUrl : 'https://placeholder.supabase.co'
const safeKey = isConfigured ? supabaseAnonKey : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder'

export const supabase = createClient(safeUrl, safeKey)
export { isConfigured as supabaseConfigured }
