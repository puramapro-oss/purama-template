# PATTERNS.md — Code Patterns & Best Practices

## Auth
- Toujours `'use client'` pour composants avec hooks Supabase
- Middleware → check user → redirect `/login?next=`
- signOut → `supabase.auth.signOut()` + `localStorage.clear()` + `window.location.href='/login'`

## Components
- Export default (Next.js convention)
- `'use client'` si interactif (useState, useEffect, onClick, etc.)
- Optional chaining `?.` partout
- Glass morphism: `glass` ou `glass-card` classes
- Loading states: Skeleton UI
- Error states: ErrorBoundary + fallback UI
- Empty states: message + CTA

## API Routes
- Try/catch autour de TOUT
- Auth check: `createClient()` → `getUser()` → 401 si null
- Zod validation inputs
- Rate limit (TODO: add middleware)
- Return JSON: `NextResponse.json({ data, error })`

## DB
- 1 source vérité: `types/database.ts`
- RLS enabled sur TOUTES tables
- Foreign keys + `ON DELETE CASCADE`
- Timestamps: `created_at`, `updated_at`

## Styling
- Tailwind only (0 CSS modules)
- Design tokens CSS vars (globals.css)
- Responsive: mobile-first (375px+)
- Dark mode par défaut (`dark` class sur `<html>`)

## Testing
- Playwright pour E2E
- Test auth flow: signup → login → dashboard
- Test chaque bouton CTA
- Test responsive 375px, 768px, 1280px

---

**RÈGLE**: Patterns récurrents → ajouter ici pour référence future.
