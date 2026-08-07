import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Conditions Générales d&apos;Utilisation',
}

export default function TermsPage() {
  return (
    <div className="min-h-dvh py-16 px-6">
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <Link href="/" className="text-sm text-[rgba(245,245,250,0.4)] hover:text-[var(--foreground)] transition">
            ← Retour
          </Link>
          <h1 className="text-3xl font-bold text-[var(--foreground)] mt-4">Conditions Générales d&apos;Utilisation</h1>
          <p className="text-sm text-[rgba(245,245,250,0.4)] mt-2">Dernière mise à jour : janvier 2025</p>
        </div>

        <div className="space-y-8 text-[rgba(245,245,250,0.8)] leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">1. Objet</h2>
            <p>
              Les présentes Conditions Générales d&apos;Utilisation (CGU) régissent l&apos;accès et l&apos;utilisation du service{' '}
              {'{{APP_NAME}}'} (ci-après &quot;le Service&quot;) édité par SASU PURAMA, 8 Rue Chapelle, 25560 Frasne, France.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">2. Acceptation des CGU</h2>
            <p>
              En créant un compte, vous acceptez sans réserve les présentes CGU. Si vous n&apos;acceptez pas ces conditions,
              vous ne devez pas utiliser le Service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">3. Description du service</h2>
            <p>
              {'{{APP_NAME}}'} est un service d&apos;assistance par intelligence artificielle. Le Service est fourni en l&apos;état
              et peut évoluer sans préavis.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">4. Création de compte</h2>
            <p>
              Pour accéder au Service, vous devez créer un compte en fournissant une adresse email valide.
              Vous êtes responsable de la confidentialité de vos identifiants.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">5. Essai gratuit</h2>
            <p>
              Un essai gratuit de 7 jours est proposé. Aucun paiement n&apos;est requis pendant cette période.
              L&apos;essai se transforme automatiquement en abonnement payant sauf résiliation avant la fin de la période d&apos;essai.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">6. Abonnement et paiement</h2>
            <p>
              L&apos;accès au Service est soumis à un abonnement mensuel ou annuel. Les paiements sont traités par Stripe.
              Le renouvellement est automatique sauf résiliation. Les tarifs sont indiqués TTC et peuvent être modifiés
              avec un préavis d&apos;un mois.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">7. Résiliation</h2>
            <p>
              Vous pouvez résilier votre abonnement à tout moment depuis votre espace client. La résiliation prend effet
              à la fin de la période déjà payée. Aucun remboursement n&apos;est effectué pour la période en cours.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">8. Droit de rétractation</h2>
            <p>
              Conformément à l&apos;article L221-28 3° du Code de la consommation, le droit de rétractation de 14 jours
              ne s&apos;applique pas aux services pleinement exécutés avant la fin du délai avec accord exprès du consommateur.
              En utilisant le Service pendant l&apos;essai gratuit, vous renoncez à votre droit de rétractation.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">9. Propriété intellectuelle</h2>
            <p>
              Tous les éléments du Service (textes, graphismes, logiciels) sont la propriété exclusive de SASU PURAMA
              ou de ses partenaires. Toute reproduction est interdite sans autorisation préalable.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">10. Responsabilité</h2>
            <p>
              Le Service est fourni &quot;en l&apos;état&quot;. SASU PURAMA ne garantit pas que le Service sera exempt d&apos;erreurs
              ou de bugs. SASU PURAMA ne peut être tenu responsable des dommages indirects résultant de l&apos;utilisation
              ou de l&apos;impossibilité d&apos;utiliser le Service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">11. Données personnelles</h2>
            <p>
              Le traitement de vos données personnelles est décrit dans notre{' '}
              <Link href="/privacy" className="text-[var(--primary)] hover:underline">
                Politique de confidentialité
              </Link>.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">12. Loi applicable</h2>
            <p>
              Les présentes CGU sont régies par le droit français. Tout litige sera soumis aux tribunaux compétents
              de Besançon, France.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">13. Contact</h2>
            <p>Pour toute question : matiss.frasne@gmail.com</p>
          </section>
        </div>
      </div>
    </div>
  )
}
