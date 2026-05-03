/**
 * {{APP_NAME}} — Consentements RGPD granulaires.
 *
 * Chaque toggle est OPT-IN strict, jamais pré-coché.
 *
 * Source légale :
 *   - RGPD art. 6 §1 a) — consentement classique
 *   - RGPD art. 9 §2 a) — consentement explicite pour données sensibles
 *     (uniquement si l'app traite santé, religion, opinions politiques, etc.)
 *
 * Personnalise CONSENT_DEFINITIONS selon les données collectées par l'app.
 * Pour une app sans données sensibles : 3 consentements suffisent
 * (marketing_email, analytics_cookies, ai_personalization).
 */

export type ConsentType =
  | "ai_personalization"
  | "community_visibility"
  | "marketing_email"
  | "analytics_cookies";

export interface ConsentDefinition {
  type: ConsentType;
  label: string;
  description: string;
  /** true si donnée sensible RGPD art. 9 (santé, religion, opinions, etc.) */
  art9: boolean;
  required: false;
  defaultValue: false;
  legal_basis: string;
}

export const CONSENT_DEFINITIONS: ConsentDefinition[] = [
  {
    type: "ai_personalization",
    label: "Laisser {{APP_NAME}} apprendre de mon usage pour mieux m'aider",
    description:
      "L'IA utilise ton historique d'usage pour personnaliser ses réponses. Tu peux désactiver à tout moment dans /parametres.",
    art9: false,
    required: false,
    defaultValue: false,
    legal_basis: "RGPD art. 6 §1 a) — consentement",
  },
  {
    type: "community_visibility",
    label: "Apparaître dans les classements communautaires",
    description:
      "Ton prénom seul est affiché — jamais de données personnelles. Tu peux passer en mode anonyme.",
    art9: false,
    required: false,
    defaultValue: false,
    legal_basis: "RGPD art. 6 §1 a)",
  },
  {
    type: "marketing_email",
    label: "Recevoir les emails (1/semaine maximum)",
    description: "Astuces, nouveautés, témoignages. Tu peux te désinscrire en 1 clic.",
    art9: false,
    required: false,
    defaultValue: false,
    legal_basis: "RGPD art. 6 §1 a) — consentement marketing",
  },
  {
    type: "analytics_cookies",
    label: "Cookies d'amélioration produit (PostHog, anonymisés)",
    description:
      "Aide-nous à améliorer {{APP_NAME}} via des stats anonymisées (clics, parcours). Aucune donnée perso ne quitte nos serveurs.",
    art9: false,
    required: false,
    defaultValue: false,
    legal_basis: "RGPD art. 6 §1 a) + ePrivacy",
  },
];

export function isSensitiveDataConsent(type: ConsentType): boolean {
  return CONSENT_DEFINITIONS.find((c) => c.type === type)?.art9 === true;
}
