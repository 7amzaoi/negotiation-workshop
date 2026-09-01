import { useEffect, useState, useCallback } from 'react'
import { supabase, supabaseConfigured } from '../lib/supabase'

export function useSettings() {
  const [resultsVisible, setResultsVisible] = useState(true)
  const [loading, setLoading] = useState(true)

  const fetchSettings = useCallback(async () => {
    if (!supabaseConfigured) {
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'results_visible')
        .single()

      if (error) {
        // Table or row might not exist yet — default to visible
        setResultsVisible(true)
      } else {
        setResultsVisible(data.value === 'true')
      }
    } catch {
      setResultsVisible(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSettings()

    if (!supabaseConfigured) return

    const channel = supabase
      .channel('settings-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, () => {
        fetchSettings()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchSettings])

  const toggleResultsVisible = async () => {
    const newValue = !resultsVisible
    setResultsVisible(newValue)

    const { error } = await supabase
      .from('settings')
      .upsert({ key: 'results_visible', value: String(newValue) })

    if (error) {
      // Revert on failure
      setResultsVisible(!newValue)
      throw error
    }
  }

  return { resultsVisible, loading, toggleResultsVisible }
}
