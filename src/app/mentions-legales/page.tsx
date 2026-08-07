import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mentions légales',
  description: 'Mentions légales de {{APP_NAME}}',
}

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0F] py-12 px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-[#F5F5FA]">
            Mentions légales
          </h1>
          <p className="mt-2 text-[#F5F5FA]/60">
            {'Informations légales concernant {{APP_NAME}}'}
          </p>
        </div>

        <div className="space-y-6">
          <div className="bg-white/5 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 space-y-4">
            <h2 className="text-xl font-semibold text-[#F5F5FA]">
              Éditeur du site
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
                <strong>Directeur de la publication :</strong> Matiss Frasne
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
              Hébergement
            </h2>
            <div className="space-y-2 text-[#F5F5FA]/80">
              <p>
                <strong>Hébergeur :</strong> Vercel Inc.
              </p>
              <p>
                <strong>Adresse :</strong> 340 Pine Street, Suite 1200, San
                Francisco, CA 94104, USA
              </p>
              <p>
                <strong>Site web :</strong>{' '}
                <a
                  href="https://vercel.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#7C3AED] hover:underline"
                >
                  vercel.com
                </a>
              </p>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 space-y-4">
            <h2 className="text-xl font-semibold text-[#F5F5FA]">
              Propriété intellectuelle
            </h2>
            <p className="text-[#F5F5FA]/80">
              L&apos;ensemble de ce site relève de la législation française et
              internationale sur le droit d&apos;auteur et la propriété
              intellectuelle. Tous les droits de reproduction sont réservés, y
              compris pour les documents téléchargeables et les représentations
              iconographiques et photographiques. Toute reproduction totale ou
              partielle du site est interdite sans l&apos;autorisation expresse de
              SASU PURAMA.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 space-y-4">
            <h2 className="text-xl font-semibold text-[#F5F5FA]">Contact</h2>
            <p className="text-[#F5F5FA]/80">
              Pour toute question concernant ces mentions légales, vous pouvez
              nous contacter à l&apos;adresse :{' '}
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
