import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Conditions Générales d\'Utilisation',
  description: 'CGU de {{APP_NAME}}',
}

export default function CguPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0F] py-12 px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-[#F5F5FA]">
            Conditions Générales d'Utilisation
          </h1>
          <p className="mt-2 text-[#F5F5FA]/60">
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
          </p>
        </div>

        <div className="space-y-6">
          <div className="bg-white/5 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 space-y-4">
            <h2 className="text-xl font-semibold text-[#F5F5FA]">
              Article 1 — Objet
            </h2>
            <p className="text-[#F5F5FA]/80">
              Les présentes conditions générales d'utilisation (CGU) définissent
              les règles d'accès et d'utilisation du service {'{{APP_NAME}}'}{' '}
              proposé par SASU PURAMA.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 space-y-4">
            <h2 className="text-xl font-semibold text-[#F5F5FA]">
              Article 2 — Acceptation
            </h2>
            <p className="text-[#F5F5FA]/80">
              L'utilisation du service implique l'acceptation pleine et entière
              des présentes CGU. Si vous n'acceptez pas ces conditions, veuillez
              ne pas utiliser le service.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 space-y-4">
            <h2 className="text-xl font-semibold text-[#F5F5FA]">
              Article 3 — Création de compte
            </h2>
            <p className="text-[#F5F5FA]/80">
              L'accès à certaines fonctionnalités du service nécessite la
              création d'un compte utilisateur. Vous êtes responsable de la
              confidentialité de vos identifiants de connexion et de toutes les
              activités effectuées depuis votre compte.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 space-y-4">
            <h2 className="text-xl font-semibold text-[#F5F5FA]">
              Article 4 — Description du service
            </h2>
            <p className="text-[#F5F5FA]/80">
              {'{{APP_NAME}}'} est un service d'intelligence artificielle qui
              fournit des recommandations et des réponses personnalisées. Le
              service est accessible via une interface web et mobile.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 space-y-4">
            <h2 className="text-xl font-semibold text-[#F5F5FA]">
              Article 5 — Essai gratuit
            </h2>
            <p className="text-[#F5F5FA]/80">
              Un essai gratuit de 7 jours est proposé aux nouveaux utilisateurs.
              Aucun paiement n'est requis pendant la période d'essai. Si vous ne
              résiliez pas avant la fin de l'essai, votre abonnement sera
              automatiquement activé.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 space-y-4">
            <h2 className="text-xl font-semibold text-[#F5F5FA]">
              Article 6 — Abonnement et paiement
            </h2>
            <p className="text-[#F5F5FA]/80">
              Les paiements sont traités de manière sécurisée via Stripe.
              L'abonnement se renouvelle automatiquement à la fin de chaque
              période de facturation (mensuelle ou annuelle) jusqu'à résiliation.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 space-y-4">
            <h2 className="text-xl font-semibold text-[#F5F5FA]">
              Article 7 — Résiliation
            </h2>
            <p className="text-[#F5F5FA]/80">
              Vous pouvez résilier votre abonnement à tout moment depuis vos
              paramètres de compte. La résiliation prendra effet à la fin de la
              période de facturation en cours.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 space-y-4">
            <h2 className="text-xl font-semibold text-[#F5F5FA]">
              Article 8 — Droit de rétractation
            </h2>
            <p className="text-[#F5F5FA]/80">
              Conformément à l'article L221-28 3° du Code de la consommation,
              vous reconnaissez et acceptez que l'utilisation du service pendant
              le délai de rétractation constitue une renonciation tacite à votre
              droit de rétractation. Aucune case à cocher supplémentaire n'est
              requise.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 space-y-4">
            <h2 className="text-xl font-semibold text-[#F5F5FA]">
              Article 9 — Responsabilité
            </h2>
            <p className="text-[#F5F5FA]/80">
              Le service est fourni "en l'état". L'intelligence artificielle peut
              commettre des erreurs. SASU PURAMA ne garantit pas l'exactitude,
              l'exhaustivité ou la pertinence des réponses fournies. L'utilisateur
              reste seul responsable de l'utilisation qu'il fait des informations
              fournies par le service.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 space-y-4">
            <h2 className="text-xl font-semibold text-[#F5F5FA]">
              Article 10 — Propriété intellectuelle
            </h2>
            <p className="text-[#F5F5FA]/80">
              Tous les éléments du service (textes, images, logos, code source)
              sont la propriété exclusive de SASU PURAMA et sont protégés par le
              droit d'auteur et les lois sur la propriété intellectuelle.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 space-y-4">
            <h2 className="text-xl font-semibold text-[#F5F5FA]">
              Article 11 — Données personnelles
            </h2>
            <p className="text-[#F5F5FA]/80">
              Le traitement de vos données personnelles est décrit dans notre{' '}
              <a href="/privacy" className="text-[#7C3AED] hover:underline">
                Politique de confidentialité
              </a>
              .
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 space-y-4">
            <h2 className="text-xl font-semibold text-[#F5F5FA]">
              Article 12 — Loi applicable et juridiction
            </h2>
            <p className="text-[#F5F5FA]/80">
              Les présentes CGU sont régies par le droit français. Tout litige
              relatif à leur interprétation ou leur exécution relève de la
              compétence exclusive des tribunaux de Besançon, France.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 space-y-4">
            <h2 className="text-xl font-semibold text-[#F5F5FA]">
              Article 13 — Contact
            </h2>
            <p className="text-[#F5F5FA]/80">
              Pour toute question concernant ces CGU, vous pouvez nous contacter
              à l'adresse :{' '}
              <a
                href="mailto:matiss.frasne@gmail.com"
                className="text-[#7C3AED] hover:underline"
              >
                matiss.frasne@gmail.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
