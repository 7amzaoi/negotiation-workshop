import { useEffect, useState, useCallback, useRef } from 'react'
import { supabase, supabaseConfigured } from '../lib/supabase'
import type { AgreementWithCountries, Agreement, Country, AgreementCountry } from '../types/database'

export function useAgreements() {
  const [agreements, setAgreements] = useState<AgreementWithCountries[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [breakingNews, setBreakingNews] = useState<AgreementWithCountries | null>(null)

  // Track known agreement IDs to detect new ones
  const knownIdsRef = useRef<Set<string>>(new Set())
  const isInitialLoadRef = useRef(true)

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

      const allAgreements = (agreementsData || []) as Agreement[]
      const allJoins = (joinData || []) as AgreementCountry[]
      const allCountries = (countriesData || []) as Country[]

      const countriesMap = new Map<string, Country>()
      allCountries.forEach(c => countriesMap.set(c.id, c))

      const agreementCountriesMap = new Map<string, Country[]>()
      allJoins.forEach(row => {
        const country = countriesMap.get(row.country_id)
        if (country) {
          const list = agreementCountriesMap.get(row.agreement_id) || []
          list.push(country)
          agreementCountriesMap.set(row.agreement_id, list)
        }
      })

      const enriched: AgreementWithCountries[] = allAgreements.map(a => ({
        ...a,
        countries: agreementCountriesMap.get(a.id) || [],
      }))

      // Detect new agreements (skip initial load)
      // Only consider agreements that have countries attached
      if (!isInitialLoadRef.current && knownIdsRef.current.size > 0) {
        const newAgreement = enriched.find(a =>
          !knownIdsRef.current.has(a.id) && a.countries.length > 0
        )
        if (newAgreement) {
          setBreakingNews(newAgreement)
        }
      }

      // Only mark agreements as "known" once they have countries,
      // so we can re-detect them on the next fetch when countries arrive
      const idsWithCountries = enriched.filter(a => a.countries.length > 0).map(a => a.id)
      const idsWithoutCountries = enriched.filter(a => a.countries.length === 0).map(a => a.id)
      const nextKnown = new Set(idsWithCountries)
      // Keep IDs without countries from previous set so we don't re-trigger on old data
      idsWithoutCountries.forEach(id => {
        if (knownIdsRef.current.has(id)) nextKnown.add(id)
      })
      knownIdsRef.current = nextKnown
      isInitialLoadRef.current = false

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
        // Small delay to let both the agreement and join rows settle
        setTimeout(fetchAgreements, 500)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchAgreements])

  const dismissBreakingNews = useCallback(() => {
    setBreakingNews(null)
  }, [])

  const createAgreement = async (
    title: string,
    body: string,
    countryIds: string[],
    impact: string = ''
  ) => {
    const { data, error: agError } = await supabase
      .from('agreements')
      .insert({ title, body, impact })
      .select()
      .single()

    if (agError) throw agError

    const agreement = data as Agreement

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

  const deleteAgreement = async (id: string) => {
    // Delete join rows first (foreign key constraint)
    const { error: joinError } = await supabase
      .from('agreement_countries')
      .delete()
      .eq('agreement_id', id)

    if (joinError) throw joinError

    const { error: agError } = await supabase
      .from('agreements')
      .delete()
      .eq('id', id)

    if (agError) throw agError
  }

  const updateAgreement = async (
    id: string,
    title: string,
    body: string,
    countryIds: string[],
    impact: string = ''
  ) => {
    // Update the agreement row
    const { error: agError } = await supabase
      .from('agreements')
      .update({ title, body, impact })
      .eq('id', id)

    if (agError) throw agError

    // Replace join rows: delete old, insert new
    const { error: delError } = await supabase
      .from('agreement_countries')
      .delete()
      .eq('agreement_id', id)

    if (delError) throw delError

    if (countryIds.length > 0) {
      const joinRows = countryIds.map(country_id => ({
        agreement_id: id,
        country_id,
      }))

      const { error: joinError } = await supabase
        .from('agreement_countries')
        .insert(joinRows)

      if (joinError) throw joinError
    }
  }

  return {
    agreements, loading, error,
    createAgreement, deleteAgreement, updateAgreement,
    refetch: fetchAgreements, breakingNews, dismissBreakingNews,
  }
}
