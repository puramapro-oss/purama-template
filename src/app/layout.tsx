import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { CookieBanner } from "@/components/CookieBanner";
import { PosthogProvider } from "@/components/PosthogProvider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://{{SLUG}}.purama.dev";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "{{APP_NAME}} — {{APP_DESCRIPTION}}",
    template: "%s · {{APP_NAME}}",
  },
  description: "{{APP_DESCRIPTION}}",
  applicationName: "{{APP_NAME}}",
  authors: [{ name: "SASU PURAMA" }],
  alternates: { canonical: "/" },
  openGraph: {
    title: "{{APP_NAME}} — {{APP_DESCRIPTION}}",
    description: "{{APP_DESCRIPTION}}",
    type: "website",
    locale: "fr_FR",
    siteName: "{{APP_NAME}}",
    url: SITE_URL,
    images: [{ url: "/api/og", width: 1200, height: 630, alt: "{{APP_NAME}}" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "{{APP_NAME}}",
    description: "{{APP_DESCRIPTION}}",
    images: ["/api/og"],
  },
  robots: { index: true, follow: true },
  formatDetection: { email: false, telephone: false, address: false },
};

export const viewport: Viewport = {
  themeColor: "{{PRIMARY_COLOR}}",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <PosthogProvider>{children}</PosthogProvider>
        <CookieBanner />
      </body>
    </html>
  );
}
