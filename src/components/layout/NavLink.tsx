"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface NavLinkProps {
  href: string;
  children: ReactNode;
  exact?: boolean;
  className?: string;
  activeClassName?: string;
}

/**
 * Lien de navigation avec détection automatique de la route active.
 * - exact=true : la route doit être strictement égale (ex: "/dashboard")
 * - exact=false (défaut) : préfixe match
 */
export function NavLink({
  href,
  children,
  exact = false,
  className,
  activeClassName,
}: NavLinkProps) {
  const pathname = usePathname();
  const isActive = exact
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors",
        isActive
          ? cn(
              "bg-[var(--primary)] text-white font-medium",
              activeClassName,
            )
          : cn("text-[var(--foreground)] hover:bg-[var(--surface-glass)]"),
        className,
      )}
    >
      {children}
    </Link>
  );
}
