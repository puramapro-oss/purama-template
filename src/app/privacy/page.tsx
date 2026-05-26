import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Politique de confidentialité',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-dvh py-16 px-6">
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <Link href="/" className="text-sm text-[rgba(245,245,250,0.4)] hover:text-[var(--foreground)] transition">
            ← Retour
          </Link>
          <h1 className="text-3xl font-bold text-[var(--foreground)] mt-4">Politique de confidentialité</h1>
          <p className="text-sm text-[rgba(245,245,250,0.4)] mt-2">Dernière mise à jour : janvier 2025</p>
        </div>

        <div className="space-y-8 text-[rgba(245,245,250,0.8)] leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">1. Responsable du traitement</h2>
            <p>SASU PURAMA, 8 Rue Chapelle, 25560 Frasne, France. Contact : matiss.frasne@gmail.com</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">2. Données collectées</h2>
            <p>Nous collectons les données suivantes :</p>
            <ul className="list-disc list-inside space-y-1 text-[rgba(245,245,250,0.7)] ml-4">
              <li>Identité : nom, prénom, adresse email</li>
              <li>Données de connexion : logs d'accès, adresse IP</li>
              <li>Données de paiement : gérées exclusivement par Stripe (nous ne stockons aucune donnée bancaire)</li>
              <li>Données d'utilisation : interactions avec le service, historique des sessions</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">3. Finalités et bases légales</h2>
            <ul className="list-disc list-inside space-y-1 text-[rgba(245,245,250,0.7)] ml-4">
              <li>Fourniture du service : exécution du contrat (Art. 6.1.b RGPD)</li>
              <li>Communication transactionnelle : intérêt légitime (Art. 6.1.f RGPD)</li>
              <li>Obligations légales : conformité légale (Art. 6.1.c RGPD)</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">4. Conservation</h2>
            <p>
              Les données sont conservées pendant la durée de votre compte + 3 ans après résiliation pour obligations légales.
              Les données de paiement sont conservées 5 ans (obligation fiscale).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">5. Vos droits (RGPD)</h2>
            <p>
              Vous disposez des droits d'accès, rectification, effacement, limitation, portabilité et opposition.
              Pour les exercer : matiss.frasne@gmail.com. Vous pouvez également contacter la CNIL (cnil.fr).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">6. Cookies</h2>
            <p>
              Nous utilisons uniquement des cookies essentiels au fonctionnement du service (session d'authentification).
              Aucun cookie publicitaire ou de tracking tiers.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">7. Sous-traitants</h2>
            <ul className="list-disc list-inside space-y-1 text-[rgba(245,245,250,0.7)] ml-4">
              <li>Supabase Inc. — hébergement des données (UE)</li>
              <li>Vercel Inc. — hébergement applicatif</li>
              <li>Stripe Inc. — traitement des paiements</li>
              <li>Resend Inc. — envoi d'emails transactionnels</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">8. Transferts internationaux</h2>
            <p>
              Certains sous-traitants peuvent être situés hors UE. Les transferts sont encadrés par les clauses contractuelles types
              de la Commission européenne.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">9. Contact</h2>
            <p>Pour toute question relative à vos données personnelles : matiss.frasne@gmail.com</p>
          </section>
        </div>
      </div>
    </div>
  )
}
