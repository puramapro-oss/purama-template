# {{APP_NAME}} — Task Plan

## P0: Setup ⬜
- [ ] Bootstrap projet (purama-new.sh ou manuel)
- [ ] Installer dépendances (`npm install`)
- [ ] Copier `.env.local.example` → `.env.local`
- [ ] Remplir secrets dans `.env.local`
- [ ] Créer schéma PostgreSQL `{{SLUG}}` sur VPS
- [ ] Créer tables initiales (`profiles`, etc.)
- [ ] Vérifier build (`npm run build`)
- [ ] Créer `ERRORS.md` + `PATTERNS.md`
- [ ] Lire BRIEF 3× → lister pages/APIs/tables
- [ ] Montrer plan → attendre "ok"

## P1: Structure + Auth ⬜
- [ ] Implémenter composants auth (Login, Signup)
- [ ] Config Supabase SSR (middleware, server/client)
- [ ] Activer Google OAuth sur VPS (`GOTRUE_EXTERNAL_GOOGLE_ENABLED=true`)
- [ ] Tester auth email (signup → verify → login)
- [ ] Tester Google OAuth (clic → redirect → callback → dashboard)
- [ ] signOut + clear storage + redirect `/login`
- [ ] Middleware protection routes dashboard/admin
- [ ] Deploy dev (`vercel --prod`)

## P2: Features Core ⬜
- [ ] (À définir selon BRIEF)

## P3: Universels ⬜
- [ ] Système parrainage (N1=50% premier paiement)
- [ ] Wallet (balance, withdraw, min 5€)
- [ ] Points/achievements
- [ ] Cross-promo Zernio

## P4: Admin + Aide ⬜
- [ ] Dashboard admin (users, payments, withdrawals)
- [ ] Page Aide/FAQ
- [ ] Chatbot SAV (Claude)

## P5: Design Polish ⬜
- [ ] Animations (Framer Motion)
- [ ] Responsive 375px+
- [ ] i18n 16 langues (next-intl)
- [ ] Dark mode (par défaut)

## P6: QA + Security ⬜
- [ ] tsc --noEmit → 0 erreurs
- [ ] npm run build → 0 erreurs
- [ ] Playwright tests → 100% pass
- [ ] Lighthouse → >90 (perf, a11y, SEO, best practices)
- [ ] Sub-agent qa (22 points)
- [ ] Sub-agent security (0 critical)

## P7: Mobile ⬜
- [ ] Expo config (`app.json`, `eas.json`)
- [ ] EAS build iOS + Android
- [ ] Submit App Store + Play Store

## P8: Watch (si santé) ⬜
- [ ] (N/A si pas app santé)

---

**Context monitoring**: >50% → `/compact` | >60% → commit+deploy+handoff
**Avant coder**: lire `ERRORS.md` + `PATTERNS.md`
**Bug fixé**: ligne immédiate dans `ERRORS.md`
