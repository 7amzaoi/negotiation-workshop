import { useEffect, useState, useCallback } from 'react'
import { supabase, supabaseConfigured } from '../lib/supabase'
import type { AgreementWithCountries, Country } from '../types/database'

export function useAgreements() {
  const [agreements, setAgreements] = useState<AgreementWithCountries[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAgreements = useCallback(async () => {
    if (!supabaseConfigured) {
      setAgreements([])
      setLoading(false)
      return
    }

    try {
      const { data: agreementsData, error: agError } = await supabase
        .from('agreements')
        .select('*')
        .order('created_at', { ascending: false })

      if (agError) throw agError

      const { data: joinData, error: joinError } = await supabase
        .from('agreement_countries')
        .select('agreement_id, country_id')

      if (joinError) throw joinError

      const { data: countriesData, error: cError } = await supabase
        .from('countries')
        .select('*')

      if (cError) throw cError

      const countriesMap = new Map<string, Country>()
      countriesData?.forEach(c => countriesMap.set(c.id, c))

      const agreementCountriesMap = new Map<string, Country[]>()
      joinData?.forEach(row => {
        const country = countriesMap.get(row.country_id)
        if (country) {
          const list = agreementCountriesMap.get(row.agreement_id) || []
          list.push(country)
          agreementCountriesMap.set(row.agreement_id, list)
        }
      })

      const enriched: AgreementWithCountries[] = (agreementsData || []).map(a => ({
        ...a,
        countries: agreementCountriesMap.get(a.id) || [],
      }))

      setAgreements(enriched)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل في تحميل الاتفاقيات')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAgreements()

    if (!supabaseConfigured) return

    const channel = supabase
      .channel('agreements-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'agreements' }, () => {
        fetchAgreements()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'agreement_countries' }, () => {
        fetchAgreements()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchAgreements])

  const createAgreement = async (
    title: string,
    body: string,
    countryIds: string[]
  ) => {
    const { data: agreement, error: agError } = await supabase
      .from('agreements')
      .insert({ title, body })
      .select()
      .single()

    if (agError) throw agError

    if (countryIds.length > 0) {
      const joinRows = countryIds.map(country_id => ({
        agreement_id: agreement.id,
        country_id,
      }))

      const { error: joinError } = await supabase
        .from('agreement_countries')
        .insert(joinRows)

      if (joinError) throw joinError
    }

    return agreement
  }

  return { agreements, loading, error, createAgreement, refetch: fetchAgreements }
}
