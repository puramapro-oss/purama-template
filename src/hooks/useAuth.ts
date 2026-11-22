'use client'
import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    let authEvents = 0
    let unsubscribe: (() => void) | undefined

    async function initialize() {
      try {
        const supabase = createClient()
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
          if (!active) return
          authEvents += 1
          setUser(session?.user ?? null)
          setLoading(false)
        })
        unsubscribe = () => subscription.unsubscribe()

        const { data, error } = await supabase.auth.getUser()
        if (!active || authEvents > 0) return
        setUser(error ? null : data.user)
        setLoading(false)
      } catch {
        if (!active || authEvents > 0) return
        setUser(null)
        setLoading(false)
      }
    }

    void initialize()
    return () => {
      active = false
      unsubscribe?.()
    }
  }, [])

  return { user, loading }
}
