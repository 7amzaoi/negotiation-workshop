import { useEffect, useState, useCallback } from 'react'
import { supabase, supabaseConfigured } from '../lib/supabase'
import type { CountryWithAgreements, Country, AgreementCountry } from '../types/database'

const DEMO_COUNTRIES: CountryWithAgreements[] = [
  { id: '1', name: 'أميركا', flag_emoji: '🇺🇸', points: 0, rating: '', created_at: '', agreement_count: 0 },
  { id: '2', name: 'روسيا', flag_emoji: '🇷🇺', points: 0, rating: '', created_at: '', agreement_count: 0 },
  { id: '3', name: 'سوريا', flag_emoji: '🇸🇾', points: 0, rating: '', created_at: '', agreement_count: 0 },
  { id: '4', name: 'العراق', flag_emoji: '🇮🇶', points: 0, rating: '', created_at: '', agreement_count: 0 },
  { id: '5', name: 'قسد', flag_emoji: '⚔️', points: 0, rating: '', created_at: '', agreement_count: 0 },
  { id: '6', name: 'اسرائيل', flag_emoji: '🇮🇱', points: 0, rating: '', created_at: '', agreement_count: 0 },
  { id: '7', name: 'ايران', flag_emoji: '🇮🇷', points: 0, rating: '', created_at: '', agreement_count: 0 },
  { id: '8', name: 'تركيا', flag_emoji: '🇹🇷', points: 0, rating: '', created_at: '', agreement_count: 0 },
  { id: '9', name: 'السعودية', flag_emoji: '🇸🇦', points: 0, rating: '', created_at: '', agreement_count: 0 },
  { id: '10', name: 'لبنان', flag_emoji: '🇱🇧', points: 0, rating: '', created_at: '', agreement_count: 0 },
]

export function useCountries() {
  const [countries, setCountries] = useState<CountryWithAgreements[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCountries = useCallback(async () => {
    if (!supabaseConfigured) {
      setCountries(DEMO_COUNTRIES)
      setLoading(false)
      setError('⚠️ وضع العرض — Supabase غير مُعدّ')
      return
    }

    try {
      const { data: countriesData, error: countriesError } = await supabase
        .from('countries')
        .select('*')
        .order('name')

      if (countriesError) throw countriesError

      const { data: joinData, error: joinError } = await supabase
        .from('agreement_countries')
        .select('country_id')

      if (joinError) throw joinError

      const allCountries = (countriesData || []) as Country[]
      const allJoins = (joinData || []) as Pick<AgreementCountry, 'country_id'>[]

      const countMap = new Map<string, number>()
      allJoins.forEach(row => {
        countMap.set(row.country_id, (countMap.get(row.country_id) || 0) + 1)
      })

      const enriched: CountryWithAgreements[] = allCountries.map(c => ({
        ...c,
        rating: c.rating || '',
        agreement_count: countMap.get(c.id) || 0,
      }))

      setCountries(enriched)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل في تحميل البيانات')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCountries()

    if (!supabaseConfigured) return

    const countriesChannel = supabase
      .channel('countries-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'countries' }, () => {
        fetchCountries()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'agreement_countries' }, () => {
        fetchCountries()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(countriesChannel)
    }
  }, [fetchCountries])

  const updatePoints = async (countryId: string, points: number) => {
    const { error } = await supabase
      .from('countries')
      .update({ points })
      .eq('id', countryId)

    if (error) throw error
  }

  const updateRating = async (countryId: string, rating: string) => {
    const { error } = await supabase
      .from('countries')
      .update({ rating })
      .eq('id', countryId)

    if (error) throw error
  }

  return { countries, loading, error, updatePoints, updateRating, refetch: fetchCountries }
}
