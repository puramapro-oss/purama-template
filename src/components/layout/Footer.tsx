import Link from 'next/link'

const LINKS = [
  { href: '/pricing', label: 'Tarifs' },
  { href: '/privacy', label: 'Confidentialité' },
  { href: '/mentions-legales', label: 'Mentions légales' },
  { href: '/cgu', label: 'CGU' },
  { href: '/cgv', label: 'CGV' },
  { href: '/status', label: 'Statut' },
]

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.06] py-8 px-6">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-white/40">© {new Date().getFullYear()} SASU PURAMA — {'{{APP_NAME}}'}</p>
        <nav className="flex flex-wrap items-center justify-center gap-4">
          {LINKS.map(l => (
            <Link key={l.href} href={l.href} className="text-xs text-white/40 hover:text-white/80 transition-colors">
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  )
}
