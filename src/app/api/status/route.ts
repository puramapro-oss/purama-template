import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    app: '{{APP_NAME}}',
    slug: '{{SLUG}}',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version ?? '1.0.0',
  })
}
