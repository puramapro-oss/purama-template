import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase-server";
import { CONSENT_DEFINITIONS, type ConsentType } from "@/lib/consents";
import { ParametresControls } from "./ParametresControls";

export const metadata: Metadata = {
  title: "Paramètres",
  robots: { index: false, follow: false },
};

interface RawConsent {
  consent_type: ConsentType;
  granted: boolean;
  granted_at: string;
  revoked_at: string | null;
}

export default async function ParametresPage() {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?next=/parametres");

  // On ramène le dernier état par consent_type pour cet user (audit trail)
  const { data: rows } = await supabase
    .from("consents")
    .select("consent_type, granted, granted_at, revoked_at")
    .eq("user_id", user.id)
    .order("granted_at", { ascending: false });

  const latestByType = new Map<ConsentType, boolean>();
  ((rows ?? []) as RawConsent[]).forEach((row) => {
    if (!latestByType.has(row.consent_type)) {
      latestByType.set(row.consent_type, row.granted && !row.revoked_at);
    }
  });

  const initial = Object.fromEntries(
    CONSENT_DEFINITIONS.map((c) => [c.type, latestByType.get(c.type) ?? false])
  ) as Record<ConsentType, boolean>;

  return (
    <main className="min-h-screen bg-[var(--background)] py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <Link href="/app" className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]">
          ← Retour
        </Link>
        <h1 className="font-semibold text-4xl text-[var(--foreground)] mt-3 mb-2">Paramètres</h1>
        <p className="text-[var(--muted)] mb-10">
          Connecté en tant que <strong className="text-[var(--foreground)]">{user.email}</strong>.
        </p>

        <ParametresControls initial={initial} />

        <section className="glass rounded-[var(--radius-lg)] p-6 mt-8">
          <h2 className="font-semibold text-2xl mb-2">Tes droits RGPD</h2>
          <p className="text-sm text-[var(--muted)] leading-relaxed mb-4">
            Tu peux à tout moment exporter une copie complète de tes données ou les supprimer
            définitivement. Suppression effective sous 30 jours, audit conservé en immuable.
          </p>
          <RgpdActions />
        </section>
      </div>
    </main>
  );
}

function RgpdActions() {
  return (
    <div className="flex flex-col gap-3">
      <form action="/api/rgpd/export" method="post">
        <button
          type="submit"
          className="text-sm font-medium text-[var(--primary)] hover:underline"
          data-testid="rgpd-export"
        >
          Demander l'export complet de mes données (ZIP)
        </button>
      </form>
      <Link
        href="/parametres/supprimer"
        className="text-sm text-red-600 dark:text-red-400 hover:underline"
        data-testid="rgpd-delete-link"
      >
        Supprimer mon compte et toutes mes données
      </Link>
    </div>
  );
}
