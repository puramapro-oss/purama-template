import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const title = searchParams.get('title') ?? '{{APP_NAME}}'
  const subtitle = searchParams.get('subtitle') ?? 'Écosystème Purama'

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0A0A0F',
          backgroundImage: 'radial-gradient(circle at 50% 20%, #7C3AED 0%, transparent 50%), radial-gradient(circle at 80% 80%, #06B6D4 0%, transparent 50%)',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '80px',
            borderRadius: '32px',
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <h1
            style={{
              fontSize: 80,
              fontWeight: 'bold',
              color: '#F5F5FA',
              margin: 0,
              textAlign: 'center',
            }}
          >
            {title}
          </h1>
          <p
            style={{
              fontSize: 32,
              color: 'rgba(245,245,250,0.6)',
              margin: '20px 0 0 0',
              textAlign: 'center',
            }}
          >
            {subtitle}
          </p>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
