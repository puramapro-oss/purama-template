#!/usr/bin/env bash
# ============================================================================
# init-app.sh — Bootstrap d'une nouvelle app Purama depuis purama-template
# ----------------------------------------------------------------------------
# Usage :
#   ./scripts/init-app.sh SLUG "APP_NAME" "APP_DESCRIPTION" "#PRIMARY" "#SECONDARY"
#
# Exemples :
#   ./scripts/init-app.sh kaia "KAÏA" "Ta santé, simplifiée." "#10B981" "#7C3AED"
#   ./scripts/init-app.sh midas "MIDAS" "Trader 24/7 augmenté par l'IA." "#F59E0B" "#7C3AED"
#
# Le script :
#   1. Valide les arguments
#   2. Find/replace {{SLUG}}, {{APP_NAME}}, {{APP_DESCRIPTION}}, couleurs
#   3. Met à jour package.json (name)
#   4. Réinitialise BRIEF.md, task_plan.md, progress.md
#   5. Affiche les next-steps (cp .env.local.example .env.local, etc.)
# ============================================================================

set -euo pipefail

if [[ $# -ne 5 ]]; then
  echo "Usage: $0 SLUG \"APP_NAME\" \"APP_DESCRIPTION\" \"#PRIMARY\" \"#SECONDARY\"" >&2
  echo "Exemple: $0 kaia \"KAÏA\" \"Ta santé, simplifiée.\" \"#10B981\" \"#7C3AED\"" >&2
  exit 1
fi

SLUG="$1"
APP_NAME="$2"
APP_DESCRIPTION="$3"
PRIMARY_COLOR="$4"
SECONDARY_COLOR="$5"

# Validation
if [[ ! "$SLUG" =~ ^[a-z][a-z0-9_]{1,30}$ ]]; then
  echo "❌ SLUG invalide: '$SLUG' — doit matcher ^[a-z][a-z0-9_]{1,30}$ (minuscules + chiffres + _, commence par lettre)" >&2
  exit 1
fi
if [[ ! "$PRIMARY_COLOR" =~ ^#[0-9A-Fa-f]{6}$ ]]; then
  echo "❌ PRIMARY_COLOR invalide: '$PRIMARY_COLOR' — format attendu #RRGGBB" >&2
  exit 1
fi
if [[ ! "$SECONDARY_COLOR" =~ ^#[0-9A-Fa-f]{6}$ ]]; then
  echo "❌ SECONDARY_COLOR invalide: '$SECONDARY_COLOR' — format attendu #RRGGBB" >&2
  exit 1
fi

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

echo "🚀 Bootstrap de l'app '$APP_NAME' (slug: $SLUG)"
echo "   Couleurs: primary=$PRIMARY_COLOR, secondary=$SECONDARY_COLOR"
echo ""

# Détection du sed cross-platform
if [[ "$(uname)" == "Darwin" ]]; then
  SED_INPLACE=(sed -i '')
else
  SED_INPLACE=(sed -i)
fi

# Find/replace dans tous les fichiers code (excluant CLAUDE.md, node_modules, .git)
FILE_PATTERNS=(
  -name "*.ts" -o -name "*.tsx" -o -name "*.json" -o -name "*.css"
  -o -name "*.mjs" -o -name "*.example" -o -name "*.md" -o -name "*.sql"
  -o -name "*.html" -o -name "*.yaml" -o -name "*.yml"
)

echo "🔍 Find/replace placeholders..."
find . -type f \( "${FILE_PATTERNS[@]}" \) \
  ! -path "./node_modules/*" ! -path "./.git/*" ! -path "./.next/*" \
  ! -name "CLAUDE.md" ! -name "init-app.sh" \
  -exec "${SED_INPLACE[@]}" \
    -e "s|{{SLUG}}|${SLUG}|g" \
    -e "s|{{APP_NAME}}|${APP_NAME}|g" \
    -e "s|{{APP_DESCRIPTION}}|${APP_DESCRIPTION}|g" \
    -e "s|{{PRIMARY_COLOR}}|${PRIMARY_COLOR}|g" \
    -e "s|{{SECONDARY_COLOR}}|${SECONDARY_COLOR}|g" \
    {} +

# Reset BRIEF.md / task_plan.md / progress.md à un état pur (les contenus
# du template peuvent contenir des exemples qu'on veut effacer).
echo "📝 Reset BRIEF.md, task_plan.md, progress.md..."
cat > BRIEF.md <<EOF
# BRIEF — ${APP_NAME}

> Décris ton app en 5 minutes. Plus tu es précis ici, mieux Claude Code construira.

## Vision
- **Domaine** : (ex: trading, santé, juridique, vidéo, créatif)
- **Pitch** : (1 phrase)
- **Pourquoi maintenant** : (besoin marché)

## Personas
- **P1** : (qui, douleur, fréquence d'usage)
- **P2** :
- **P3** :

## Features must-have (P2 du roadmap)
- [ ] Feature 1 — (description courte)
- [ ] Feature 2 —
- [ ] Feature 3 —

## Pricing
- **Standard** : 9,99 €/mois — (perks)
- **Premium** : 19,99 €/mois — (perks)
- (Le template part sur 2 plans Standard/Premium. Override en éditant src/lib/stripe.ts.)

## IA persona
- **Nom** : ${APP_NAME}
- **Rôle** : (ex: "trader avec 15 ans d'expérience")
- **Ton** : (tutoiement, emojis, FR)
- **Refus** : (sujets hors-scope)

## Domaine spécifique
- (Vocabulaire métier, edge-cases, contraintes légales...)

## Mobile (P7)
- Bundle: dev.purama.${SLUG}
- Plateformes: iOS + Android (+ Watch si santé)
EOF

cat > task_plan.md <<EOF
# task_plan — ${APP_NAME}

## P0 — Setup (fait par le template)
- [x] Structure Next.js 14 + Supabase + Stripe + KARMA
- [x] Auth (login, signup, callback, forgot-password)
- [x] Layout dark mode + glass cards
- [x] Pages legal (mentions, confidentialité, CGV, CGU)
- [x] Webhook Stripe + KARMA split 50/10/40
- [x] Sub-agents qa + security pré-configurés

## P1 — DB + Auth provisionning
- [ ] \`cp .env.local.example .env.local\` et remplir les clés
- [ ] Créer le schéma Supabase \`${SLUG}\` sur le VPS (cf supabase/migrations/001_template_init.sql)
- [ ] Activer Email + Google OAuth dans GoTrue config + restart
- [ ] Créer 2 prix Stripe (Standard 9.99, Premium 19.99) → renseigner STRIPE_PRICE_*
- [ ] Tester signup email + Google OAuth en réel
- [ ] Tester checkout Stripe (mode test puis live)

## P2 — Features core (BRIEF)
- [ ] Lister les features must-have du BRIEF
- [ ] Implémenter feature par feature avec test après chaque

## P3 — Universels Purama
- [ ] Parrainage actif (déjà câblé via webhook)
- [ ] Wallet : page /wallet (placeholder créé, à enrichir)
- [ ] Points : table déjà prête, créer la boutique
- [ ] /financer : aides françaises (si pertinent)

## P4 — SAV + Aide
- [ ] FAQ statique
- [ ] Chatbot IA via /api/ai/chat (à créer)
- [ ] Page /aide

## P5 — Design polish
- [ ] Personnaliser globals.css selon BRIEF
- [ ] Animations Framer Motion sur pages clés
- [ ] i18n (next-intl déjà installé) — 16 langues

## P6 — QA + Security
- [ ] Lancer sub-agent qa-agent.md (21 SIM)
- [ ] Lancer sub-agent security-agent.md
- [ ] Lighthouse > 90 sur toutes les pages
- [ ] Tester en navigation privée (signup → dashboard → parrainage)

## P7 — Mobile Expo
- [ ] \`mkdir mobile && cd mobile && npx create-expo-app@latest .\`
- [ ] Migrer auth → \`react-native-url-polyfill/auto\` + SecureStore
- [ ] Maestro flows (10 minimum)
- [ ] EAS build + submit iOS + Android

## P8 — Watch (si santé)
- [ ] À évaluer selon BRIEF
EOF

cat > progress.md <<EOF
# progress — ${APP_NAME}

Date de bootstrap : $(date +"%Y-%m-%d %H:%M")
Dernier état : Bootstrap terminé. Prêt pour P1.

## Dernière action
Bootstrap depuis purama-template v1 par init-app.sh.

## État technique
- tsc --noEmit : à vérifier après \`npm install\`
- npm run build : à vérifier
- Migrations SQL : à exécuter sur le VPS

## Next
\`\`\`bash
npm install
cp .env.local.example .env.local
# remplir les clés Supabase, Stripe, etc.
npm run dev
# lancer la migration SQL via SSH VPS:
# sshpass -p ... ssh root@72.62.191.111 "PGPASSWORD=... psql ..." < supabase/migrations/001_template_init.sql
\`\`\`
EOF

# Créer ERRORS.md et PATTERNS.md vides
[[ -f ERRORS.md ]] || echo "# ERRORS — ${APP_NAME}" > ERRORS.md
[[ -f PATTERNS.md ]] || echo "# PATTERNS — ${APP_NAME}" > PATTERNS.md

# Update package.json name (au cas où il reste {{SLUG}})
if command -v node >/dev/null 2>&1; then
  node -e "
    const fs = require('fs');
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    pkg.name = '${SLUG}';
    fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
  "
fi

echo ""
echo "✅ Bootstrap terminé !"
echo ""
echo "Next steps :"
echo "   1. cp .env.local.example .env.local"
echo "   2. Remplir les clés (Supabase, Stripe, Anthropic, Resend...)"
echo "   3. Créer le schéma '${SLUG}' sur le VPS Supabase :"
echo "      ssh root@72.62.191.111 \"PGPASSWORD='<pw>' psql -U postgres -d postgres -c 'CREATE SCHEMA IF NOT EXISTS ${SLUG};'\""
echo "   4. Lancer la migration : supabase/migrations/001_template_init.sql"
echo "   5. npm install && npm run dev"
echo ""
echo "Ouvre BRIEF.md et task_plan.md pour la suite."
