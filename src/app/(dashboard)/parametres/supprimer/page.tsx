import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase-server";
import { DeleteAccountForm, CancelDeletionButton } from "./DeleteAccountForm";

export const metadata: Metadata = {
  title: "Supprimer mon compte",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function DeleteAccountPage() {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/parametres/supprimer");

  const { data: existing } = await supabase
    .from("account_deletion_requests")
    .select("scheduled_for, status, requested_at")
    .eq("user_id", user.id)
    .eq("status", "scheduled")
    .maybeSingle();

  return (
    <main className="min-h-screen bg-[var(--background)] py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <Link
          href="/parametres"
          className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
        >
          ← Paramètres
        </Link>
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.18em] text-red-500">Action sensible</p>
          <h1 className="text-3xl font-semibold text-[var(--foreground)]">
            Supprimer mon compte
          </h1>
          <p className="text-[var(--muted)]">
            RGPD article 17 — droit à l&apos;effacement. Suppression effective dans
            30 jours, période pendant laquelle tu peux annuler.
          </p>
        </header>

        <section className="glass p-5 space-y-2 text-sm">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            Ce qui va être supprimé
          </h2>
          <ul className="text-[var(--muted)] space-y-1.5 list-disc list-inside">
            <li>Ton profil, tes consentements, tes préférences.</li>
            <li>Tes conversations avec l&apos;IA, ton historique d&apos;usage.</li>
            <li>Tes invitations, tes commissions de parrainage.</li>
            <li>Tes tokens push, tes notifications.</li>
          </ul>
          <p className="text-[var(--foreground)] pt-2 border-t border-[var(--border)]">
            <strong>Ce qui est conservé :</strong> les factures (obligation comptable
            10 ans, anonymisées).
          </p>
        </section>

        {existing ? (
          <ScheduledNotice
            scheduledFor={existing.scheduled_for as string}
            requestedAt={existing.requested_at as string}
          />
        ) : (
          <DeleteAccountForm email={user.email ?? ""} />
        )}
      </div>
    </main>
  );
}

function ScheduledNotice({
  scheduledFor,
  requestedAt,
}: {
  scheduledFor: string;
  requestedAt: string;
}) {
  return (
    <section className="rounded-[var(--radius-lg)] border border-red-500/40 bg-red-500/5 p-5 space-y-3">
      <p className="text-xl font-semibold text-red-500">Suppression programmée</p>
      <p className="text-sm text-[var(--foreground)]">
        Tu as demandé la suppression le{" "}
        {new Date(requestedAt).toLocaleDateString("fr-FR", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })}
        . Effective le{" "}
        <strong>
          {new Date(scheduledFor).toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}
        </strong>
        .
      </p>
      <CancelDeletionButton />
    </section>
  );
}
