import Link from "next/link";
import { NavLink } from "./NavLink";
import { UserAvatar } from "./UserAvatar";

interface AppHeaderProps {
  displayName: string;
  email?: string | null;
}

/**
 * Header /dashboard — onglets primaires + avatar.
 * Personnalise les NavLink selon les sections de l'app.
 */
export function AppHeader({ displayName, email }: AppHeaderProps) {
  return (
    <header className="border-b border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        <Link href="/dashboard" className="flex items-center gap-2 shrink-0">
          <span
            className="inline-block w-7 h-7 rounded-full"
            style={{ background: "var(--gradient-primary)" }}
            aria-hidden="true"
          />
          <span className="font-semibold text-xl">{"{{APP_NAME}}"}</span>
        </Link>

        <nav
          aria-label="Navigation principale"
          className="flex items-center gap-1 overflow-x-auto"
        >
          <NavLink href="/dashboard" exact>
            Accueil
          </NavLink>
          <NavLink href="/wallet">Wallet</NavLink>
          <NavLink href="/referral">Parrainage</NavLink>
          <NavLink href="/parametres">Paramètres</NavLink>
        </nav>

        <UserAvatar name={displayName} email={email} />
      </div>
    </header>
  );
}
