import type { Metadata } from "next";
import { LegalLayout } from "@/components/legal/LegalLayout";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: "Mentions légales {{APP_NAME}} · SASU PURAMA · Frasne (25)",
};

export default function MentionsLegalesPage() {
  return (
    <LegalLayout title="Mentions légales" updatedAt="3 mai 2026">
      <h2 className="text-2xl font-semibold mt-6">Éditeur du service</h2>
      <p>
        {"{{APP_NAME}}"} est édité par <strong>SASU PURAMA</strong>, société par actions simplifiée
        unipersonnelle.
      </p>
      <ul className="list-disc pl-6 space-y-1">
        <li>Siège social : 8 Rue de la Chapelle, 25560 Frasne, France</li>
        <li>RCS Besançon</li>
        <li>Président : Matiss Dornier</li>
        <li>
          Contact :{" "}
          <a className="underline" href="mailto:contact@{{SLUG}}.purama.dev">
            contact@{"{{SLUG}}"}.purama.dev
          </a>
        </li>
        <li>TVA non applicable, art. 293 B du CGI (franchise en base de TVA)</li>
        <li>Régime fiscal : ZFRR Frasne (zone France ruralités revitalisation)</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8">Hébergement</h2>
      <p>
        L&apos;application web est hébergée par <strong>Vercel Inc.</strong> (340 S Lemon Ave #4133,
        Walnut, CA 91789, USA), avec basculement EU lorsque possible.
      </p>
      <p>
        Backend Supabase auto-hébergé sur infrastructure <strong>Hostinger VPS</strong> (Allemagne, UE).
      </p>

      <h2 className="text-2xl font-semibold mt-8">Propriété intellectuelle</h2>
      <p>
        L&apos;ensemble des contenus (textes, images, logos, graphismes, code) est la propriété
        exclusive de SASU PURAMA, sauf mentions contraires. Toute reproduction sans autorisation
        écrite est interdite.
      </p>

      <h2 className="text-2xl font-semibold mt-8">Signaler un contenu</h2>
      <p>
        Pour signaler un contenu illicite ou un dysfonctionnement :
        <a className="underline ml-1" href="mailto:abuse@{{SLUG}}.purama.dev">
          abuse@{"{{SLUG}}"}.purama.dev
        </a>
        .
      </p>
    </LegalLayout>
  );
}
