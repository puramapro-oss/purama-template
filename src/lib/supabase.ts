'use client'
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

const SCHEMA = process.env.NEXT_PUBLIC_SUPABASE_DB_SCHEMA ?? 'public'

export function createClient() {
  return createBrowserClient<Database, 'public'>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { db: { schema: SCHEMA as 'public' } }
  )
}
