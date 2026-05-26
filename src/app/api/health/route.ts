import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'

export async function GET() {
  try {
    const supabase = createServiceClient()
    await supabase.from('profiles').select('id').limit(1)
    return NextResponse.json({ status: 'healthy', db: 'ok', ts: new Date().toISOString() })
  } catch {
    return NextResponse.json({ status: 'degraded', db: 'error', ts: new Date().toISOString() }, { status: 503 })
  }
}
