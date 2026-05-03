import type { Metadata } from "next";
import { LegalLayout } from "@/components/legal/LegalLayout";

export const metadata: Metadata = { title: "Conditions Générales d'Utilisation" };

export default function CguPage() {
  return (
    <LegalLayout title="Conditions Générales d'Utilisation" updatedAt="3 mai 2026">
      <h2 className="text-2xl font-semibold mt-6">1. Acceptation</h2>
      <p>
        En créant un compte {"{{APP_NAME}}"}, tu acceptes les présentes CGU. Si tu refuses, tu ne
        peux pas utiliser le service.
      </p>

      <h2 className="text-2xl font-semibold mt-8">2. Compte utilisateur</h2>
      <p>
        Tu es responsable de la confidentialité de ton mot de passe. Toute activité depuis ton
        compte est réputée être la tienne.
      </p>

      <h2 className="text-2xl font-semibold mt-8">3. Comportements prohibés</h2>
      <ul className="list-disc pl-6 space-y-1">
        <li>Usurpation d&apos;identité, comptes multiples</li>
        <li>Contenus illicites, haineux, harcelants ou contrefaisants</li>
        <li>Tentative de contourner la modération ou la sécurité</li>
        <li>Spam, scrapping massif, automatisation non autorisée</li>
      </ul>
      <p>
        Toute violation peut entraîner la suspension immédiate du compte sans préavis.
      </p>

      <h2 className="text-2xl font-semibold mt-8">4. Contenu utilisateur</h2>
      <p>
        Tu conserves la propriété de tes contenus. Tu accordes à {"{{APP_NAME}}"} une licence
        limitée pour les afficher dans le service, uniquement si tu y as consenti.
      </p>

      <h2 className="text-2xl font-semibold mt-8">5. Mineurs</h2>
      <p>Service interdit aux moins de 16 ans.</p>

      <h2 className="text-2xl font-semibold mt-8">6. Disponibilité</h2>
      <p>
        {"{{APP_NAME}}"} s&apos;efforce d&apos;assurer une disponibilité 24/7 mais ne garantit pas
        l&apos;absence d&apos;interruption (maintenance, incident infrastructure).
      </p>
    </LegalLayout>
  );
}
