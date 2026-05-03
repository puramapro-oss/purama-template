import Link from "next/link";

interface UserAvatarProps {
  name: string;
  email?: string | null;
}

function getInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "?";
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Avatar utilisateur avec initiales colorées (gradient primaire).
 * Lien vers /parametres au clic.
 */
export function UserAvatar({ name, email }: UserAvatarProps) {
  const initials = getInitials(name === email ? name.split("@")[0] : name);

  return (
    <Link
      href="/parametres"
      aria-label={`Paramètres de ${name}`}
      className="group flex items-center gap-2 rounded-full pl-1 pr-3 py-1 hover:bg-[var(--surface-glass)] transition-colors"
    >
      <span
        className="grid place-items-center w-8 h-8 rounded-full text-xs font-medium text-white shadow-[var(--shadow-soft)]"
        style={{ background: "var(--gradient-primary)" }}
        aria-hidden="true"
      >
        {initials}
      </span>
      <span className="hidden sm:inline text-sm text-[var(--foreground)] max-w-[10rem] truncate">
        {name}
      </span>
    </Link>
  );
}
