'use client'

import { useEffect, useRef, useState } from 'react'

/** One pending auth action per mounted form, including OAuth and password flows. */
export function useAuthSubmission() {
  const mounted = useRef(true)
  const pending = useRef(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    mounted.current = true
    return () => { mounted.current = false }
  }, [])

  function begin() {
    if (!mounted.current || pending.current) return false
    pending.current = true
    setLoading(true)
    return true
  }

  function isActive() {
    return mounted.current
  }

  function finish() {
    if (!mounted.current) return
    pending.current = false
    setLoading(false)
  }

  return { loading, begin, isActive, finish }
}
