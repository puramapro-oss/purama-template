import type { Metadata } from "next";
import { LegalLayout } from "@/components/legal/LegalLayout";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description: "Comment {{APP_NAME}} traite tes données personnelles.",
};

export default function ConfidentialitePage() {
  return (
    <LegalLayout title="Politique de confidentialité" updatedAt="3 mai 2026">
      <p>
        Cette politique explique <strong>quelles données nous collectons, pourquoi, où elles
        sont stockées et comment exercer tes droits</strong>. Si tu as un doute, écris-nous.
      </p>

      <h2 className="text-2xl font-semibold mt-8">Responsable de traitement</h2>
      <p>
        SASU PURAMA, 8 Rue de la Chapelle, 25560 Frasne. DPO :{" "}
        <a className="underline" href="mailto:dpo@{{SLUG}}.purama.dev">
          dpo@{"{{SLUG}}"}.purama.dev
        </a>
        .
      </p>

      <h2 className="text-2xl font-semibold mt-8">Données collectées</h2>
      <ul className="list-disc pl-6 space-y-1">
        <li>
          <strong>Compte</strong> : email, prénom, mot de passe haché.
        </li>
        <li>
          <strong>Préférences</strong> : choix d&apos;onboarding, paramètres app.
        </li>
        <li>
          <strong>Mesures techniques</strong> : adresse IP (anti-fraude), cookies de session,
          analytics anonymisées (PostHog) si tu y consens.
        </li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8">Bases légales</h2>
      <ul className="list-disc pl-6 space-y-1">
        <li>
          <strong>Compte + abonnement</strong> : exécution du contrat (RGPD art. 6 §1 b).
        </li>
        <li>
          <strong>Marketing</strong> : consentement spécifique opt-in (art. 6 §1 a).
        </li>
        <li>
          <strong>Sécurité / lutte anti-fraude</strong> : intérêt légitime (art. 6 §1 f).
        </li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8">Durées de conservation</h2>
      <ul className="list-disc pl-6 space-y-1">
        <li>Compte actif : tant que tu utilises {"{{APP_NAME}}"}.</li>
        <li>Compte inactif : suppression automatique après 24 mois sans connexion.</li>
        <li>Logs techniques : 12 mois.</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8">Tes droits</h2>
      <p>
        Conformément au RGPD, tu peux exercer les droits suivants directement depuis tes{" "}
        <a className="underline" href="/parametres">
          Paramètres
        </a>{" "}
        ou par email :
      </p>
      <ul className="list-disc pl-6 space-y-1">
        <li>Accès (art. 15)</li>
        <li>Rectification (art. 16)</li>
        <li>Effacement (art. 17)</li>
        <li>Portabilité (art. 20)</li>
        <li>Opposition / retrait du consentement (art. 7 et 21)</li>
        <li>Limitation (art. 18)</li>
      </ul>
      <p>
        Réponse sous <strong>30 jours maximum</strong>. Recours possible auprès de la{" "}
        <strong>CNIL</strong> (cnil.fr).
      </p>

      <h2 className="text-2xl font-semibold mt-8">Sous-traitants</h2>
      <ul className="list-disc pl-6 space-y-1">
        <li>Vercel (hébergement frontend, USA — clauses contractuelles types)</li>
        <li>Hostinger (backend Supabase, Allemagne, UE)</li>
        <li>Anthropic (USA — clauses contractuelles types) pour Claude</li>
        <li>Resend (UE) pour les emails transactionnels</li>
        <li>Stripe (Irlande) pour la facturation</li>
        <li>Sentry (UE) pour le suivi d&apos;erreurs</li>
        <li>PostHog (UE) pour les analytics opt-in</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8">Mineurs</h2>
      <p>
        {"{{APP_NAME}}"} est interdit aux <strong>moins de 16 ans</strong>. De 16 à 18 ans, un
        accord parental est recommandé.
      </p>
    </LegalLayout>
  );
}
