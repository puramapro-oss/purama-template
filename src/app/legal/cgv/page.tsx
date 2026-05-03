import type { Metadata } from "next";
import { LegalLayout } from "@/components/legal/LegalLayout";

export const metadata: Metadata = { title: "Conditions Générales de Vente" };

export default function CgvPage() {
  return (
    <LegalLayout title="Conditions Générales de Vente" updatedAt="3 mai 2026">
      <h2 className="text-2xl font-semibold mt-6">Article 1 — Objet</h2>
      <p>
        Les présentes CGV régissent l&apos;abonnement aux services {"{{APP_NAME}}"} édités par SASU
        PURAMA. L&apos;accès aux fonctionnalités payantes est subordonné à un abonnement actif au
        plan choisi.
      </p>

      <h2 className="text-2xl font-semibold mt-8">Article 2 — Plans tarifaires</h2>
      <ul className="list-disc pl-6 space-y-1">
        <li>
          <strong>Standard</strong> : 9,99 €/mois.
        </li>
        <li>
          <strong>Premium</strong> : 19,99 €/mois.
        </li>
      </ul>
      <p>TVA non applicable, art. 293 B du CGI (franchise en base de TVA).</p>

      <h2 className="text-2xl font-semibold mt-8">Article 3 — Période d&apos;essai</h2>
      <p>
        14 jours d&apos;essai gratuit lors de la première souscription, conditionnés à la saisie
        d&apos;un moyen de paiement valide. Aucun prélèvement avant la fin de l&apos;essai. Tu peux
        annuler à tout moment depuis tes Paramètres.
      </p>

      <h2 className="text-2xl font-semibold mt-8">Article 4 — Droit de rétractation</h2>
      <p>
        Conformément à l&apos;article L221-28, 3° du Code de la consommation, en activant ton
        abonnement et en accédant immédiatement aux contenus numériques, tu renonces
        expressément à ton droit de rétractation pour la période ainsi consommée. Tu peux
        néanmoins résilier l&apos;abonnement à tout moment sans frais.
      </p>

      <h2 className="text-2xl font-semibold mt-8">Article 5 — Paiement</h2>
      <p>
        Les paiements sont traités par <strong>Stripe</strong>. Aucune donnée bancaire ne
        transite ni n&apos;est stockée sur les serveurs {"{{APP_NAME}}"}.
      </p>

      <h2 className="text-2xl font-semibold mt-8">Article 6 — Résiliation</h2>
      <p>
        Tu peux résilier à tout moment. La résiliation prend effet à la fin de la période
        facturée en cours, sans remboursement prorata.
      </p>

      <h2 className="text-2xl font-semibold mt-8">Article 7 — Litiges</h2>
      <p>
        En cas de litige, tu peux saisir le médiateur de la consommation :
        <a className="underline ml-1" href="https://www.economie.gouv.fr/mediation-conso">
          economie.gouv.fr/mediation-conso
        </a>
        . À défaut, les tribunaux de Besançon sont seuls compétents.
      </p>
    </LegalLayout>
  );
}
