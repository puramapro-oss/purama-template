import type { Metadata, Viewport } from 'next'
import { Inter, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/shared/Providers'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: '{{APP_NAME}}',
    template: `%s · {{APP_NAME}}`,
  },
  description: '{{APP_DESCRIPTION}}',
  authors: [{ name: '{{APP_NAME}}', url: 'https://{{SLUG}}.purama.dev' }],
  creator: '{{APP_NAME}} by Purama',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://{{SLUG}}.purama.dev'),
  openGraph: {
    title: '{{APP_NAME}}',
    description: '{{APP_DESCRIPTION}}',
    url: 'https://{{SLUG}}.purama.dev',
    siteName: '{{APP_NAME}}',
    locale: 'fr_FR',
    type: 'website',
    images: [
      {
        url: '/api/og',
        width: 1200,
        height: 630,
        alt: '{{APP_NAME}}',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '{{APP_NAME}}',
    description: '{{APP_DESCRIPTION}}',
    images: ['/api/og'],
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  themeColor: '#0A0A0F',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="dark">
      <body className={`${inter.variable} ${geistMono.variable} font-sans antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
