#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────
#  purama-new.sh — Bootstrap a new Purama app in ~30 seconds
#  Usage: ./purama-new.sh <slug> <nom> <description> [couleur]
#  Ex:    ./purama-new.sh kash "KASH" "Conseil financier IA" "#10B981"
# ──────────────────────────────────────────────────────────────
set -euo pipefail

# ── 0. Args + secrets ─────────────────────────────────────────
SLUG="${1:?Usage: $0 <slug> <nom> <description> [couleur]}"
NOM="${2:?Usage: $0 <slug> <nom> <description> [couleur]}"
DESCRIPTION="${3:?Usage: $0 <slug> <nom> <description> [couleur]}"
COLOR="${4:-#7C3AED}"

PURAMA_ROOT="$(cd "$(dirname "$0")" && pwd)"
APP_DIR="$PURAMA_ROOT/$SLUG"
TEMPLATE_DIR="$PURAMA_ROOT/purama-template"

# Source secrets (non-fatal if missing)
# shellcheck disable=SC1091
[[ -f "$PURAMA_ROOT/.env.secrets" ]] && source "$PURAMA_ROOT/.env.secrets"

# Required secrets
VERCEL_TOKEN="${VERCEL_TOKEN:?VERCEL_TOKEN missing in .env.secrets}"
SUPABASE_SERVICE_ROLE_KEY="${SUPABASE_SERVICE_ROLE_KEY:?SUPABASE_SERVICE_ROLE_KEY missing}"
POSTGRES_PASSWORD="${POSTGRES_PASSWORD:?POSTGRES_PASSWORD missing}"
GH_TOKEN="${GH_TOKEN:-}"

VERCEL_TEAM="team_dGuJ4PqnSU1uaAHa26kkmKKk"
POSTGRES_HOST="${POSTGRES_HOST:-72.62.191.111}"
TEMPLATE_REPO="puramapro-oss/purama-template"

GREEN="\033[32m"; BLUE="\033[34m"; RED="\033[31m"; YELLOW="\033[33m"; RESET="\033[0m"
log()  { echo -e "${BLUE}▶ $*${RESET}"; }
ok()   { echo -e "${GREEN}✓ $*${RESET}"; }
warn() { echo -e "${YELLOW}⚠ $*${RESET}"; }
fail() { echo -e "${RED}✗ $*${RESET}"; exit 1; }

# ── 1. Preflight ───────────────────────────────────────────────
log "Preflight checks…"
command -v node   >/dev/null || fail "node non trouvé"
command -v npm    >/dev/null || fail "npm non trouvé"
command -v git    >/dev/null || fail "git non trouvé"
command -v vercel >/dev/null || npm install -g vercel --silent

[[ -d "$APP_DIR" ]] && fail "Dossier $APP_DIR existe déjà"

NODE_MAJOR=$(node -e "console.log(process.version.slice(1).split('.')[0])")
(( NODE_MAJOR >= 18 )) || fail "Node >= 18 requis (actuel: $NODE_MAJOR)"
ok "Preflight OK"

# ── 2. Create Next.js app ──────────────────────────────────────
log "Création de l'app Next.js ($SLUG)…"
cd "$PURAMA_ROOT"
npx create-next-app@latest "$SLUG" \
  --typescript \
  --tailwind \
  --app \
  --no-git \
  --no-src-dir \
  --import-alias "@/*" \
  --yes \
  2>&1 | tail -5

ok "Next.js créé"

# ── 3. Install Purama deps ─────────────────────────────────────
log "Installation des dépendances Purama…"
cd "$APP_DIR"
npm install --save \
  @supabase/ssr \
  @supabase/supabase-js \
  @anthropic-ai/sdk \
  framer-motion \
  lucide-react \
  class-variance-authority \
  clsx \
  tailwind-merge \
  sonner \
  zod \
  next-intl \
  2>&1 | tail -3

npm install --save-dev \
  @types/node \
  2>&1 | tail -2

ok "Dépendances installées"

# ── 4. Scaffold structure ──────────────────────────────────────
log "Scaffold src/…"

mkdir -p \
  src/app \
  src/app/"(auth)"/login \
  src/app/"(auth)"/signup \
  src/app/"(auth)"/callback \
  src/app/"(auth)"/forgot-password \
  src/app/"(dashboard)"/dashboard \
  src/app/api/status \
  src/app/api/health \
  src/components/ui \
  src/components/layout \
  src/components/shared \
  src/lib \
  src/hooks \
  src/types

# ── 4a. globals.css with design tokens ────────────────────────
cat > src/app/globals.css << 'ENDCSS'
@import "tailwindcss";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  --color-secondary: var(--secondary);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-card: var(--card);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-destructive: var(--destructive);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
}

:root {
  --radius: 1rem;
  --background: #0A0A0F;
  --foreground: #F5F5FA;
  --primary: APP_COLOR_PLACEHOLDER;
  --primary-foreground: #F5F5FA;
  --secondary: #06B6D4;
  --secondary-foreground: #0A0A0F;
  --muted: #14141C;
  --muted-foreground: rgba(245, 245, 250, 0.6);
  --card: rgba(255, 255, 255, 0.05);
  --card-foreground: #F5F5FA;
  --border: rgba(255, 255, 255, 0.06);
  --input: rgba(255, 255, 255, 0.08);
  --ring: APP_COLOR_PLACEHOLDER;
  --destructive: #EF4444;
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: var(--font-sans, system-ui), sans-serif;
  background-image:
    radial-gradient(ellipse 80% 40% at 50% -10%, color-mix(in srgb, var(--primary) 8%, transparent) 0%, transparent 70%),
    radial-gradient(ellipse 60% 30% at 100% 110%, color-mix(in srgb, var(--secondary) 6%, transparent) 0%, transparent 60%);
}

.glass {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px) saturate(150%);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 1.5rem;
}

.glow {
  box-shadow: 0 0 60px color-mix(in srgb, var(--primary) 30%, transparent);
}
ENDCSS

# Replace color placeholder
sed -i '' "s|APP_COLOR_PLACEHOLDER|${COLOR}|g" src/app/globals.css

# ── 4b. Root layout ───────────────────────────────────────────
cat > src/app/layout.tsx << ENDLAYOUT
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "${NOM} — ${DESCRIPTION}",
  description: "${DESCRIPTION}",
  metadataBase: new URL("https://${SLUG}.purama.dev"),
  openGraph: {
    title: "${NOM}",
    description: "${DESCRIPTION}",
    url: "https://${SLUG}.purama.dev",
    siteName: "${NOM}",
    locale: "fr_FR",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="dark">
      <body className={\`\${inter.variable} antialiased\`}>
        {children}
      </body>
    </html>
  );
}
ENDLAYOUT

# ── 4c. Home page (app-style, NOT landing) ────────────────────
cat > src/app/page.tsx << ENDPAGE
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-8 p-4">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-bold tracking-tight">${NOM}</h1>
        <p className="text-muted-foreground text-lg max-w-md mx-auto">${DESCRIPTION}</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/signup"
          className="px-8 py-3 rounded-full font-semibold text-white text-center transition-all hover:scale-105"
          style={{ background: "var(--primary)" }}
        >
          Commencer
        </Link>
        <Link
          href="/login"
          className="px-8 py-3 rounded-full font-semibold text-center glass hover:scale-105 transition-all"
        >
          Se connecter
        </Link>
      </div>
    </main>
  );
}
ENDPAGE

# ── 4d. API status endpoint ───────────────────────────────────
cat > src/app/api/status/route.ts << 'ENDSTATUS'
import { NextResponse } from "next/server";

export const runtime = "edge";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
  });
}
ENDSTATUS

# ── 4e. lib/utils.ts ─────────────────────────────────────────
cat > src/lib/utils.ts << 'ENDUTILS'
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(cents: number): string {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(cents / 100);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(new Date(date));
}

export const SUPER_ADMIN_EMAIL = "matiss.frasne@gmail.com";
export const WALLET_MIN = 5;
export const COMPANY_INFO = {
  name: "SASU PURAMA",
  address: "8 Rue Chapelle, 25560 Frasne",
  vatNote: "TVA non applicable — art. 293B du CGI",
};
ENDUTILS

# ── 4f. lib/supabase.ts ───────────────────────────────────────
cat > src/lib/supabase.ts << 'ENDSUPA'
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { db: { schema: process.env.NEXT_PUBLIC_SUPABASE_DB_SCHEMA! } }
  );
}
ENDSUPA

cat > src/lib/supabase-server.ts << 'ENDSUPASERVER'
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      db: { schema: process.env.NEXT_PUBLIC_SUPABASE_DB_SCHEMA! },
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(pairs) {
          try { pairs.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); }
          catch {}
        },
      },
    }
  );
}
ENDSUPASERVER

# ── 4g. middleware.ts ─────────────────────────────────────────
cat > src/middleware.ts << 'ENDMW'
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = [
  "/", "/pricing", "/how-it-works", "/ecosystem", "/status", "/changelog",
  "/privacy", "/terms", "/offline", "/login", "/signup", "/register",
  "/mentions-legales", "/politique-confidentialite", "/cgv", "/cgu",
];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const { pathname } = req.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/go/") ||
    pathname.match(/\.(ico|png|jpg|svg|webp|woff2?)$/)
  ) return res;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      db: { schema: process.env.NEXT_PUBLIC_SUPABASE_DB_SCHEMA! },
      cookies: {
        getAll() { return req.cookies.getAll(); },
        setAll(pairs) { pairs.forEach(({ name, value, options }) => res.cookies.set(name, value, options)); },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const isPublic = PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith("/legal/"));

  if (!user && !isPublic) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  if (user && (pathname === "/login" || pathname === "/signup")) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }
  return res;
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
ENDMW

# ── 4h. types/database.ts placeholder ────────────────────────
cat > src/types/database.ts << 'ENDTYPES'
// Generated via: supabase gen types typescript --schema SLUG > src/types/database.ts
// Replace with actual generated types after schema creation
export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: Record<string, unknown>;
    Views: Record<string, unknown>;
    Functions: Record<string, unknown>;
    Enums: Record<string, unknown>;
  };
}
ENDTYPES

ok "Structure créée"

# ── 5. .env.local ──────────────────────────────────────────────
log "Génération .env.local…"
cat > .env.local << ENDENV
# Auto-généré par purama-new.sh le $(date +%Y-%m-%d)
# ── Supabase ──
NEXT_PUBLIC_SUPABASE_URL=https://auth.purama.dev
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzQwNTI0ODAwLCJleHAiOjE4OTgyOTEyMDB9.GkiVoEuCykK7vIpNzY_Zmc6XPNnJF3BUPvijXXZy2aU
SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
NEXT_PUBLIC_SUPABASE_DB_SCHEMA=${SLUG}
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
POSTGRES_HOST=${POSTGRES_HOST}

# ── IA ──
ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY:-}
ANTHROPIC_MODEL_MAIN=claude-sonnet-4-6
ANTHROPIC_MODEL_FAST=claude-haiku-4-5-20251001
ANTHROPIC_MODEL_PRO=claude-opus-4-7
OPENAI_API_KEY=${OPENAI_API_KEY:-}

# ── Stripe ──
STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY:-}
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=${NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:-}
STRIPE_WEBHOOK_SECRET=

# ── Resend ──
RESEND_API_KEY=${RESEND_API_KEY:-}
RESEND_FROM_EMAIL=hello@${SLUG}.purama.dev

# ── Monitoring ──
SENTRY_AUTH_TOKEN=${SENTRY_AUTH_TOKEN:-}
SENTRY_ORG=purama
NEXT_PUBLIC_POSTHOG_KEY=phc_H3oYKeaaJrx801AZsZmZCzUZEpMH048ysKOqg9Mig1H
NEXT_PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com
BETTERSTACK_API_KEY=${BETTERSTACK_API_KEY:-}

# ── OAuth ──
GOOGLE_CLIENT_ID=897200950419-dh86vocgp1ii0csj4eer6jjkqrh00oe7.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET:-}

# ── App ──
NEXT_PUBLIC_APP_NAME=${NOM}
NEXT_PUBLIC_APP_SLUG=${SLUG}
NEXT_PUBLIC_APP_COLOR=${COLOR}
NEXTAUTH_URL=https://${SLUG}.purama.dev
NEXTAUTH_SECRET=$(openssl rand -base64 32)

# ── CRON ──
CRON_SECRET=$(openssl rand -hex 16)
ENDENV

ok ".env.local généré"

# ── 6. Supabase schema ─────────────────────────────────────────
log "Création schéma Supabase '${SLUG}'…"

PGPASS="${POSTGRES_PASSWORD}" psql \
  "host=${POSTGRES_HOST} port=5432 dbname=postgres user=supabase_admin sslmode=require" \
  -c "CREATE SCHEMA IF NOT EXISTS \"${SLUG}\";" \
  2>/dev/null && ok "Schéma '${SLUG}' créé" || warn "Schéma déjà existant ou connexion échouée (normal en CI)"

# ── 7. Git init ────────────────────────────────────────────────
log "Git init…"
git init
cat > .gitignore << 'ENDGIT'
.env*.local
.env.secrets
node_modules/
.next/
out/
dist/
.DS_Store
*.log
.vercel
ENDGIT
git add .
git commit -m "feat(${SLUG}): P0 — init Purama app '${NOM}' via purama-new.sh"
ok "Git init"

# ── 8. GitHub repo ─────────────────────────────────────────────
if command -v gh >/dev/null && [[ -n "$GH_TOKEN" ]]; then
  log "Création repo GitHub puramapro-oss/${SLUG}…"
  GH_TOKEN="$GH_TOKEN" gh repo create "puramapro-oss/${SLUG}" \
    --private \
    --description "${DESCRIPTION}" \
    --source=. \
    --remote=origin \
    --push \
    2>&1 && ok "GitHub repo créé + push" || warn "GitHub repo: échec (continuer sans)"
else
  warn "GH_TOKEN absent — skipping GitHub (ajouter dans .env.secrets)"
fi

# ── 9. Vercel deploy ──────────────────────────────────────────
log "Deploy Vercel…"
vercel link \
  --token "$VERCEL_TOKEN" \
  --scope "$VERCEL_TEAM" \
  --project "${SLUG}" \
  --yes \
  2>&1 | tail -3 || true

# Push env vars to Vercel
log "Push env vars Vercel…"
while IFS= read -r line; do
  [[ "$line" =~ ^#|^$ ]] && continue
  key="${line%%=*}"
  val="${line#*=}"
  [[ -z "$key" || -z "$val" ]] && continue
  vercel env add "$key" production \
    --token "$VERCEL_TOKEN" \
    --scope "$VERCEL_TEAM" \
    <<< "$val" 2>/dev/null || true
done < .env.local

vercel --prod \
  --token "$VERCEL_TOKEN" \
  --scope "$VERCEL_TEAM" \
  --yes \
  2>&1 | tail -5 && ok "Deploy Vercel OK" || warn "Deploy Vercel: vérifier manuellement"

# ── 10. Summary ────────────────────────────────────────────────
echo ""
echo -e "${GREEN}════════════════════════════════════════${RESET}"
echo -e "${GREEN}✅ ${NOM} (${SLUG}) créé en $(date)${RESET}"
echo -e "${GREEN}════════════════════════════════════════${RESET}"
echo ""
echo "  📁 Dossier   : $APP_DIR"
echo "  🌐 URL prod  : https://${SLUG}.purama.dev"
echo "  🐙 GitHub    : https://github.com/puramapro-oss/${SLUG}"
echo "  🗄️  Schéma DB : ${SLUG}"
echo "  🎨 Couleur   : ${COLOR}"
echo ""
echo "  Prochaines étapes:"
echo "  1. cd $SLUG"
echo "  2. npm run dev  → http://localhost:3000"
echo "  3. Lance Claude Code avec le BRIEF de l'app"
echo "  4. Commande: 'P1 — Auth + DB'"
echo ""
