# purama-template

Template Next.js 14 + Supabase + Stripe + KARMA pour les apps Purama. Base réutilisable
pour boostraper rapidement une nouvelle app de l'écosystème (KAÏA, MIDAS, SUTRA...).

## Stack
- **Frontend** : Next.js 16 (App Router) · React 19 · Tailwind v4 · TypeScript strict
- **Backend** : Supabase self-hosted (`auth.purama.dev`) · schéma isolé par app
- **Paiement** : Stripe + Customer Portal · KARMA split auto 50/10/40
- **IA** : Anthropic Claude (Sonnet 4.6 / Haiku 4.5 / Opus 4.7) · OpenAI fallback
- **Email** : Resend · **Analytics** : PostHog · **Errors** : Sentry
- **Tests** : Playwright + LHCI · sub-agents `qa-agent` + `security-agent`

## Quick start

```bash
# 1. Cloner le template (ou utiliser comme base d'un nouveau repo)
git clone https://github.com/puramapro-oss/purama-template my-app
cd my-app

# 2. Bootstrap : remplit tous les placeholders avec le slug + couleurs choisis
./scripts/init-app.sh kaia "KAÏA" "Ta santé, simplifiée." "#10B981" "#7C3AED"

# 3. Variables d'environnement
cp .env.local.example .env.local
# → remplir Supabase, Stripe, Anthropic, Resend, etc.

# 4. Schéma SQL sur le VPS
sshpass -p '<vps_pw>' ssh root@72.62.191.111 \
  "PGPASSWORD='<pg_pw>' psql -h localhost -U postgres -d postgres -c 'CREATE SCHEMA IF NOT EXISTS kaia;'"
sshpass -p '<vps_pw>' ssh root@72.62.191.111 \
  "PGPASSWORD='<pg_pw>' psql -h localhost -U postgres -d postgres" < supabase/migrations/001_template_init.sql

# 5. Dev
npm install
npm run dev
```

## Placeholders remplacés par init-app.sh

| Placeholder              | Exemple        | Usage                                       |
|--------------------------|----------------|---------------------------------------------|
| `{{SLUG}}`               | `kaia`         | bundle, domain, db schema, email, cookies   |
| `{{APP_NAME}}`           | `KAÏA`         | titles, headers, IA persona name            |
| `{{APP_DESCRIPTION}}`    | `Ta santé...`  | tagline, OG, manifest                       |
| `{{PRIMARY_COLOR}}`      | `#10B981`      | `--primary` CSS, theme color, gradients     |
| `{{SECONDARY_COLOR}}`    | `#7C3AED`      | `--secondary` CSS, accent                   |

## Structure

```
src/
├── app/
│   ├── (auth)/{login,signup,callback,forgot-password}
│   ├── (dashboard)/{dashboard,wallet,referral,parametres}
│   ├── api/
│   │   ├── stripe/{checkout,webhook,portal}
│   │   ├── cron/{trial-will-end,wallet-confirm,account-deletion}
│   │   ├── karma/        ← lecture des pools 50/10/40
│   │   ├── referral/track ← cookie 30j + linking
│   │   ├── account/delete ← RGPD art. 17
│   │   ├── rgpd/export    ← RGPD art. 15+20
│   │   ├── og, health, push
│   ├── pricing/, onboarding/, legal/{mentions,cgv,cgu,confidentialite}/
│   └── layout.tsx, page.tsx, globals.css, error.tsx, not-found.tsx, manifest.ts, ...
├── components/{auth,layout,legal,ui,shared}/
└── lib/
    ├── supabase.ts, supabase-server.ts
    ├── stripe.ts (PLANS standard/premium + checkout + portal)
    ├── claude.ts (Anthropic wrapper main/fast/pro)
    ├── karma.ts (split 50/10/40, splitRevenue, getPoolBalances)
    ├── zernio.ts (réseau social Purama, publishToZernio, trackZernioEvent)
    ├── consents.ts, cron-auth.ts, native.ts, affirmations.ts, utils.ts
supabase/migrations/001_template_init.sql
.claude/agents/{qa-agent,security-agent}.md  ← V13
tests/auth.spec.ts                            ← Playwright skeleton
scripts/init-app.sh                           ← bootstrap
BRIEF.md, task_plan.md                        ← templates vides
```

## KARMA module (CLAUDE.md §35.1)

Chaque paiement Stripe `invoice.payment_succeeded` déclenche automatiquement le split :

- **50 %** → `users_pool` (parrainage, classement, tirages, missions)
- **10 %** → `asso_pool` (Association PURAMA, mécénat 60% IS)
- **40 %** → `sasu_pool` (SASU PURAMA opérationnel)

Lecture des soldes via `GET /api/karma`. Tables : `karma_pools`, `pool_transactions`.

## Que faire après le bootstrap ?

1. Lire `BRIEF.md` et le remplir précisément.
2. Suivre `task_plan.md` phase par phase (P1 → P8).
3. Pour chaque feature : code → test humain → commit → next.

## Repo et licence

- Template : `puramapro-oss/purama-template` (public)
- Apps générées : héritent de ce template, repo dédié par app
- Licence : MIT (template) — apps individuelles selon leur propre LICENSE
