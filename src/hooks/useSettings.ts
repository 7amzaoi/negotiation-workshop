import { useEffect, useState, useCallback } from 'react'
import { supabase, supabaseConfigured } from '../lib/supabase'

interface SettingsMap {
  results_visible: string
  geopolitics_title: string
  geopolitics_body: string
}

const DEFAULTS: SettingsMap = {
  results_visible: 'true',
  geopolitics_title: '',
  geopolitics_body: '',
}

export function useSettings() {
  const [settings, setSettings] = useState<SettingsMap>(DEFAULTS)
  const [loading, setLoading] = useState(true)

  const fetchSettings = useCallback(async () => {
    if (!supabaseConfigured) {
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('settings')
        .select('key, value')

      if (error) {
        // Table might not exist yet
        setSettings(DEFAULTS)
      } else {
        const map = { ...DEFAULTS }
        for (const row of data || []) {
          if (row.key in map) {
            (map as Record<string, string>)[row.key] = row.value
          }
        }
        setSettings(map)
      }
    } catch {
      setSettings(DEFAULTS)
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

  const updateSetting = async (key: keyof SettingsMap, value: string) => {
    const prev = settings[key]
    setSettings(s => ({ ...s, [key]: value }))

    const { error } = await supabase
      .from('settings')
      .upsert({ key, value })

    if (error) {
      setSettings(s => ({ ...s, [key]: prev }))
      throw error
    }
  }

  const toggleResultsVisible = async () => {
    const newValue = settings.results_visible === 'true' ? 'false' : 'true'
    await updateSetting('results_visible', newValue)
  }

  const updateGeopolitics = async (title: string, body: string) => {
    // Update both in parallel
    const [r1, r2] = await Promise.all([
      supabase.from('settings').upsert({ key: 'geopolitics_title', value: title }),
      supabase.from('settings').upsert({ key: 'geopolitics_body', value: body }),
    ])
    if (r1.error) throw r1.error
    if (r2.error) throw r2.error
    setSettings(s => ({ ...s, geopolitics_title: title, geopolitics_body: body }))
  }

  return {
    resultsVisible: settings.results_visible === 'true',
    geopoliticsTitle: settings.geopolitics_title,
    geopoliticsBody: settings.geopolitics_body,
    loading,
    toggleResultsVisible,
    updateGeopolitics,
  }
}
