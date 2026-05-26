import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.RESEND_FROM_EMAIL ?? 'hello@{{SLUG}}.purama.dev'
const APP = '{{APP_NAME}}'

export async function sendWelcomeEmail(to: string, name: string) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: `Bienvenue sur ${APP} !`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:40px 20px">
        <h1 style="color:#7C3AED">Bienvenue, ${name} 👋</h1>
        <p>Votre compte ${APP} est prêt. Connectez-vous dès maintenant pour commencer.</p>
        <a href="https://{{SLUG}}.purama.dev/dashboard" style="display:inline-block;margin-top:20px;padding:12px 24px;background:linear-gradient(135deg,#7C3AED,#06B6D4);color:#fff;border-radius:12px;text-decoration:none;font-weight:600">
          Accéder à mon compte
        </a>
        <p style="margin-top:40px;color:#888;font-size:12px">SASU PURAMA — 8 Rue Chapelle, 25560 Frasne</p>
      </div>
    `,
  })
}

export async function sendCommissionEmail(to: string, name: string, amountEur: number) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: `💰 Vous avez gagné ${amountEur}€ de commission`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:40px 20px">
        <h1 style="color:#7C3AED">Nouvelle commission !</h1>
        <p>Bonjour ${name},</p>
        <p>Un de vos filleuls vient de souscrire. Vous recevez <strong>${amountEur}€</strong> sur votre wallet.</p>
        <a href="https://{{SLUG}}.purama.dev/dashboard/wallet" style="display:inline-block;margin-top:20px;padding:12px 24px;background:linear-gradient(135deg,#7C3AED,#06B6D4);color:#fff;border-radius:12px;text-decoration:none;font-weight:600">
          Voir mon wallet
        </a>
      </div>
    `,
  })
}

export async function sendPaymentFailedEmail(to: string, name: string) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: `⚠️ Échec de paiement — ${APP}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:40px 20px">
        <h1 style="color:#ef4444">Problème de paiement</h1>
        <p>Bonjour ${name},</p>
        <p>Nous n'avons pas pu traiter votre paiement pour ${APP}. Mettez à jour votre moyen de paiement pour continuer à profiter du service.</p>
        <a href="https://{{SLUG}}.purama.dev/dashboard/settings/abonnement" style="display:inline-block;margin-top:20px;padding:12px 24px;background:#ef4444;color:#fff;border-radius:12px;text-decoration:none;font-weight:600">
          Mettre à jour le paiement
        </a>
      </div>
    `,
  })
}

export async function sendWithdrawalEmail(to: string, name: string, amountEur: number) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: `Retrait de ${amountEur}€ en cours`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:40px 20px">
        <h1 style="color:#7C3AED">Retrait en cours</h1>
        <p>Bonjour ${name},</p>
        <p>Votre demande de retrait de <strong>${amountEur}€</strong> a bien été reçue. Le virement sera traité sous 3-5 jours ouvrés.</p>
      </div>
    `,
  })
}

export async function sendWeeklyRecap(to: string, name: string, stats: { referrals: number; commission: number }) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: `📊 Votre récap hebdomadaire ${APP}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:40px 20px">
        <h1 style="color:#7C3AED">Récap de la semaine</h1>
        <p>Bonjour ${name}, voici votre activité cette semaine :</p>
        <ul>
          <li>Nouveaux filleuls : <strong>${stats.referrals}</strong></li>
          <li>Commission gagnée : <strong>${stats.commission}€</strong></li>
        </ul>
        <a href="https://{{SLUG}}.purama.dev/dashboard" style="display:inline-block;margin-top:20px;padding:12px 24px;background:linear-gradient(135deg,#7C3AED,#06B6D4);color:#fff;border-radius:12px;text-decoration:none;font-weight:600">
          Voir mon tableau de bord
        </a>
      </div>
    `,
  })
}
