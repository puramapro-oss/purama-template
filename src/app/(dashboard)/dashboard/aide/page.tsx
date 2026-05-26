'use client'
import { useState } from 'react'
import { ChevronDown, ChevronUp, MessageCircle } from 'lucide-react'
import Link from 'next/link'

const FAQ = [
  {
    question: 'Comment fonctionne le parrainage ?',
    answer: "Invitez vos amis avec votre lien de parrainage. Dès qu'ils souscrivent, vous recevez 50% de leur premier paiement sur votre wallet.",
  },
  {
    question: 'Quand puis-je retirer mes gains ?',
    answer: 'Vous pouvez demander un retrait dès que votre wallet atteint 5€. Les virements sont traités sous 3-5 jours ouvrés.',
  },
  {
    question: 'Comment annuler mon abonnement ?',
    answer: "Rendez-vous dans Paramètres > Abonnement et cliquez sur \"Annuler l'abonnement\". Vous conservez l'accès jusqu'à la fin de la période payée.",
  },
  {
    question: 'Puis-je modifier mes informations de paiement ?',
    answer: 'Oui, allez dans Paramètres > Abonnement et cliquez sur "Gérer le paiement" pour mettre à jour votre carte bancaire.',
  },
  {
    question: 'Que faire si le paiement échoue ?',
    answer: 'Vous recevrez un email avec un lien pour mettre à jour votre moyen de paiement. Votre compte reste actif pendant 7 jours.',
  },
  {
    question: 'Comment contacter le support ?',
    answer: 'Cliquez sur le bouton "Discuter avec le support" en bas de cette page ou envoyez-nous un email à hello@{{SLUG}}.purama.dev',
  },
]

export default function AidePage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  function toggle(index: number) {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Centre d'aide</h1>
          <p className="text-white/60">Trouvez des réponses à vos questions</p>
        </div>
        <div className="space-y-3">
          {FAQ.map((item, index) => {
            const isOpen = openIndex === index
            return (
              <div key={index} className="bg-white/[0.05] backdrop-blur-xl border border-white/[0.06] rounded-2xl overflow-hidden">
                <button
                  onClick={() => toggle(index)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-white/[0.03] transition"
                >
                  <span className="font-semibold">{item.question}</span>
                  {isOpen ? <ChevronUp className="w-5 h-5 text-white/60" /> : <ChevronDown className="w-5 h-5 text-white/60" />}
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 text-sm text-white/60 border-t border-white/[0.06] pt-4">
                    {item.answer}
                  </div>
                )}
              </div>
            )
          })}
        </div>
        <div className="mt-8 p-6 bg-gradient-to-br from-[#7C3AED]/10 to-[#06B6D4]/10 border border-white/[0.06] rounded-2xl text-center">
          <MessageCircle className="w-8 h-8 mx-auto mb-3 text-[#7C3AED]" />
          <h2 className="font-bold mb-2">Besoin d'aide supplémentaire ?</h2>
          <p className="text-sm text-white/60 mb-4">Notre équipe est là pour vous aider</p>
          <Link
            href="/dashboard/chat"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] font-semibold hover:opacity-90 transition"
          >
            <MessageCircle className="w-4 h-4" />
            Discuter avec le support
          </Link>
        </div>
      </div>
    </div>
  )
}
