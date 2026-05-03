# task_plan — {{APP_NAME}}

> Réinitialisé au bootstrap par `scripts/init-app.sh`.

## P0 — Setup (fait par le template)
- [x] Structure Next.js 14 + Supabase + Stripe + KARMA
- [x] Auth Supabase (login, signup, callback, forgot-password)
- [x] Layout dark mode + glass cards (GOD MODE V3)
- [x] Pages legal (mentions, confidentialité, CGV, CGU)
- [x] Webhook Stripe + split KARMA 50/10/40
- [x] Sub-agents qa + security pré-configurés
- [x] Playwright skeleton (auth.spec.ts)
- [x] Vercel + Sentry + PostHog + Resend câblés

## P1 — DB + Auth provisionning
- [ ] `cp .env.local.example .env.local` et remplir les clés
- [ ] Créer le schéma Supabase `{{SLUG}}` sur le VPS
- [ ] Lancer `supabase/migrations/001_template_init.sql`
- [ ] Activer Email + Google OAuth dans GoTrue + restart
- [ ] Créer 2 prix Stripe (Standard 9.99, Premium 19.99) → STRIPE_PRICE_*
- [ ] Créer le webhook Stripe (events listés dans CLAUDE.md §17)
- [ ] Tester signup email + Google OAuth en réel
- [ ] Tester checkout Stripe (mode test puis live)

## P2 — Features core (BRIEF)
- [ ] Lister les features must-have du BRIEF
- [ ] Implémenter feature par feature, test humain après chaque

## P3 — Universels Purama
- [ ] Parrainage : déjà câblé via webhook + /referral
- [ ] Wallet : `/wallet` placeholder à enrichir
- [ ] Points / boutique
- [ ] `/financer` (aides françaises) si pertinent

## P4 — SAV + Aide
- [ ] FAQ statique
- [ ] Chatbot IA via `/api/ai/chat`
- [ ] Page `/aide`

## P5 — Design polish
- [ ] Personnaliser `globals.css` selon BRIEF
- [ ] Animations Framer Motion
- [ ] i18n 16 langues

## P6 — QA + Security
- [ ] Sub-agent qa-agent.md (21 SIM)
- [ ] Sub-agent security-agent.md
- [ ] Lighthouse > 90
- [ ] Test navigation privée (signup → dashboard → parrainage)

## P7 — Mobile Expo
- [ ] `mkdir mobile && cd mobile && npx create-expo-app@latest .`
- [ ] Auth `react-native-url-polyfill` + SecureStore
- [ ] Maestro flows (10+)
- [ ] EAS build + submit iOS + Android

## P8 — Watch (si santé)
- [ ] À évaluer selon BRIEF (HealthKit + Health Connect natif)
