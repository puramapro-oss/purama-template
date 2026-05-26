# {{APP_NAME}} — Purama Template

> **{{APP_DESCRIPTION}}**

Template Next.js 15 pour applications Purama. Scaffold complet avec auth Supabase, Stripe, IA Claude, design tokens God Mode V3.

## Bootstrap rapide

```bash
# Via purama-new.sh (recommandé)
cd ~/purama && ./purama-new.sh

# Manuel
git clone [ce repo] {{SLUG}}
cd {{SLUG}}
cp .env.local.example .env.local
# Remplir [SECRET] dans .env.local
npm install
npm run dev
```

## Structure

```
src/
├── app/             # Pages Next.js 15
├── components/      # Composants React
├── lib/             # Utils, Supabase, Claude, Stripe
├── hooks/           # Custom hooks
└── types/           # TypeScript types
```

## Stack

- **Framework**: Next.js 15 (React 19, App Router)
- **Auth**: Supabase (auth.purama.dev, schéma {{SLUG}})
- **IA**: Claude Sonnet 4.6 (Anthropic SDK)
- **Paiements**: Stripe
- **Email**: Resend
- **Styling**: Tailwind CSS + Design Tokens God Mode V3
- **Monitoring**: PostHog, Sentry, Better Stack

## Règles CLAUDE.md

Ce projet suit **CLAUDE.md V13 CORE**. Lire `/Users/matissdornier/purama/CLAUDE.md` avant toute modification.

### Principes

1. **Plan → montrer → "ok" → exécuter** feature par feature
2. **0 placeholder** (TODO/Lorem/console.log/any)
3. **Test avant avancer** (tsc, build, Playwright)
4. **Progressive disclosure** → charger SKILLS uniquement si pertinents
5. **Terminé = prouvé** (tests passent + humain vérifie)

## Scripts

```bash
npm run dev         # Dev server :3000
npm run build       # Build production
npm run typecheck   # tsc --noEmit
npm run lint        # ESLint
```

## Deploy

```bash
# Vercel (SKILL DEPLOY)
vercel --prod --token $VERCEL_TOKEN --scope puramapro-oss --yes

# DNS auto + monitoring configurés
```

## SKILLS pertinents

Selon BRIEF, charger depuis `~/purama/SKILLS/`:

- `SUPABASE.md` → auth, DB, RLS, migrations
- `PAYMENTS.md` → Stripe, wallet, parrainage
- `AI-INTEGRATION.md` → Claude, prompts, RAG
- `DESIGN.md` → UI/UX, glassmorphism, animations
- `TESTING.md` → Playwright, Lighthouse, sub-agents
- `DEPLOY.md` → Vercel, DNS, monitoring

## Support

- **Écosystème**: [purama.dev](https://purama.dev)
- **Docs CLAUDE.md**: `/Users/matissdornier/purama/CLAUDE.md`
- **SKILLS**: `/Users/matissdornier/purama/SKILLS/*.md`
- **Email**: matiss.frasne@gmail.com

---

**SASU PURAMA** • 8 Rue de la Chapelle, 25560 Frasne • TVA non applicable art. 293B CGI
