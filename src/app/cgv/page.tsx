import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Conditions Générales de Vente',
  description: 'CGV de {{APP_NAME}}',
}

export default function CgvPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0F] py-12 px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-[#F5F5FA]">
            Conditions Générales de Vente
          </h1>
          <p className="mt-2 text-[#F5F5FA]/60">
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
          </p>
        </div>

        <div className="space-y-6">
          <div className="bg-white/5 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 space-y-4">
            <h2 className="text-xl font-semibold text-[#F5F5FA]">
              Article 1 — Vendeur
            </h2>
            <div className="space-y-2 text-[#F5F5FA]/80">
              <p>
                <strong>Raison sociale :</strong> SASU PURAMA
              </p>
              <p>
                <strong>Adresse :</strong> 8 Rue Chapelle, 25560 Frasne, France
              </p>
              <p>
                <strong>SIRET :</strong> {'{{SIRET}}'}
              </p>
              <p>
                <strong>Capital social :</strong> 1€
              </p>
              <p>
                <strong>Contact :</strong>{' '}
                <a
                  href="mailto:matiss.frasne@gmail.com"
                  className="text-[#7C3AED] hover:underline"
                >
                  matiss.frasne@gmail.com
                </a>
              </p>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 space-y-4">
            <h2 className="text-xl font-semibold text-[#F5F5FA]">
              Article 2 — Produits et services
            </h2>
            <p className="text-[#F5F5FA]/80">
              SASU PURAMA commercialise les abonnements suivants pour le service{' '}
              {'{{APP_NAME}}'} :
            </p>
            <ul className="list-disc list-inside space-y-1 text-[#F5F5FA]/80">
              <li>Abonnement mensuel : 9,99€/mois</li>
              <li>Abonnement annuel : 79,99€/an (économisez 2 mois)</li>
            </ul>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 space-y-4">
            <h2 className="text-xl font-semibold text-[#F5F5FA]">
              Article 3 — TVA
            </h2>
            <p className="text-[#F5F5FA]/80">
              La TVA n&apos;est pas applicable conformément à l&apos;article 293B du Code
              général des impôts (franchise de TVA pour un chiffre d&apos;affaires
              annuel inférieur à 85 800€ pour les prestations de services). Cette
              mention figure sur toutes nos factures.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 space-y-4">
            <h2 className="text-xl font-semibold text-[#F5F5FA]">
              Article 4 — Paiement
            </h2>
            <p className="text-[#F5F5FA]/80">
              Les paiements sont traités de manière sécurisée via Stripe. Nous
              acceptons les cartes bancaires (CB, VISA, Mastercard). Toutes les
              transactions sont sécurisées par 3D Secure 2.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 space-y-4">
            <h2 className="text-xl font-semibold text-[#F5F5FA]">
              Article 5 — Essai gratuit
            </h2>
            <p className="text-[#F5F5FA]/80">
              Un essai gratuit de 7 jours est proposé aux nouveaux utilisateurs.
              Si vous résiliez votre abonnement avant la fin de la période
              d&apos;essai, aucun montant ne sera facturé.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 space-y-4">
            <h2 className="text-xl font-semibold text-[#F5F5FA]">
              Article 6 — Droit de rétractation
            </h2>
            <p className="text-[#F5F5FA]/80">
              Conformément à l&apos;article L221-28 3° du Code de la consommation, le
              consommateur qui commence à utiliser le service pendant le délai de
              rétractation renonce tacitement à son droit de rétractation. Aucune
              case à cocher supplémentaire n&apos;est requise pour cette renonciation.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 space-y-4">
            <h2 className="text-xl font-semibold text-[#F5F5FA]">
              Article 7 — Résiliation
            </h2>
            <p className="text-[#F5F5FA]/80">
              Vous pouvez résilier votre abonnement à tout moment depuis vos
              paramètres de compte. La résiliation prendra effet à la fin de la
              période de facturation en cours. Aucun remboursement au prorata
              n&apos;est effectué.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 space-y-4">
            <h2 className="text-xl font-semibold text-[#F5F5FA]">
              Article 8 — Remboursements
            </h2>
            <p className="text-[#F5F5FA]/80">
              Aucun remboursement au prorata n&apos;est effectué en cas de résiliation
              anticipée, sauf obligation légale. En cas de litige, vous pouvez
              contacter notre service client à l&apos;adresse indiquée ci-dessous.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 space-y-4">
            <h2 className="text-xl font-semibold text-[#F5F5FA]">
              Article 9 — Règlement des litiges
            </h2>
            <p className="text-[#F5F5FA]/80">
              En cas de litige, vous pouvez recourir à une médiation de la
              consommation auprès de la FEVAD (Fédération du e-commerce et de la
              vente à distance). Tout litige non résolu à l&apos;amiable relève de la
              compétence exclusive des tribunaux de Besançon, France.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 space-y-4">
            <h2 className="text-xl font-semibold text-[#F5F5FA]">Contact</h2>
            <p className="text-[#F5F5FA]/80">
              Pour toute question concernant ces CGV, vous pouvez nous contacter
              à l&apos;adresse :{' '}
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
