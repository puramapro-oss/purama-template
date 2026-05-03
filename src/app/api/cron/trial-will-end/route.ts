/**
 * CRON — Email J-3 avant fin du trial.
 *
 * Quotidien 09:00 UTC. Lit subscriptions status='trialing' AND
 * trial_end BETWEEN now()+2.5d AND now()+3.5d (fenêtre 24h).
 * Envoie un email Resend best-effort. Idempotence : flag JSONB metadata.
 */

import { type NextRequest, NextResponse } from "next/server";
import { assertCronAuth } from "@/lib/cron-auth";
import { getSupabaseServiceClient } from "@/lib/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface TrialingRow {
  id: string;
  user_id: string;
  trial_end: string;
  plan: string | null;
  metadata: Record<string, unknown> | null;
}

interface ProfileRow {
  id: string;
  email: string | null;
  full_name: string | null;
}

export async function GET(request: NextRequest) {
  return run(request);
}
export async function POST(request: NextRequest) {
  return run(request);
}

async function run(request: NextRequest) {
  const authError = assertCronAuth(request);
  if (authError) return authError;

  const service = getSupabaseServiceClient();
  const startedAt = Date.now();

  const lower = new Date(Date.now() + 2.5 * 24 * 3600 * 1000).toISOString();
  const upper = new Date(Date.now() + 3.5 * 24 * 3600 * 1000).toISOString();

  const { data: subs, error: sErr } = await service
    .from("subscriptions")
    .select("id, user_id, trial_end, plan, metadata")
    .eq("status", "trialing")
    .gte("trial_end", lower)
    .lte("trial_end", upper)
    .limit(500);
  if (sErr) return NextResponse.json({ error: sErr.message }, { status: 500 });

  const candidates = ((subs ?? []) as TrialingRow[]).filter(
    (s) => !(s.metadata as { trial_reminder_sent?: boolean } | null)?.trial_reminder_sent,
  );
  if (candidates.length === 0) {
    return NextResponse.json({ ok: true, sent: 0, note: "no trial reminder due" });
  }

  const userIds = candidates.map((s) => s.user_id);
  const { data: profs } = await service
    .from("profiles")
    .select("id, email, full_name")
    .in("id", userIds);
  const profByUser = new Map<string, ProfileRow>();
  for (const p of (profs ?? []) as ProfileRow[]) {
    profByUser.set(p.id, p);
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL ?? "hello@{{SLUG}}.purama.dev";
  const primary = process.env.NEXT_PUBLIC_PRIMARY_COLOR ?? "{{PRIMARY_COLOR}}";
  let sent = 0;
  let skipped = 0;

  for (const sub of candidates) {
    const prof = profByUser.get(sub.user_id);
    if (!prof?.email) {
      skipped += 1;
      continue;
    }

    const firstName = prof.full_name?.split(" ")[0] ?? "";
    const trialEndDate = new Date(sub.trial_end);
    const formattedDate = trialEndDate.toLocaleDateString("fr-FR", { day: "numeric", month: "long" });

    if (process.env.RESEND_API_KEY) {
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: fromEmail,
          to: prof.email,
          subject: "Ton essai {{APP_NAME}} se termine bientôt",
          html: `
<div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#0A0A0F;color:#F5F5FA">
  <h1 style="color:${primary};font-size:28px;margin:0 0 16px">Ton essai se termine le ${formattedDate}</h1>
  <p>Bonjour ${firstName || "à toi"},</p>
  <p>Trois jours encore avant la fin de ton essai {{APP_NAME}}. Si l'expérience t'a plu, ton abonnement <strong>${sub.plan === "premium" ? "Premium" : "Standard"}</strong> prendra le relais automatiquement.</p>
  <p>Tu peux ajuster ou annuler à tout moment depuis ton espace.</p>
  <p style="text-align:center;margin:32px 0">
    <a href="https://{{SLUG}}.purama.dev/parametres" style="display:inline-block;padding:12px 28px;background:${primary};color:white;text-decoration:none;border-radius:24px">Gérer mon abonnement</a>
  </p>
  <p style="font-size:13px;opacity:0.6;margin-top:32px">SASU PURAMA · 8 Rue Chapelle · 25560 Frasne.</p>
</div>`,
        });
        sent += 1;
      } catch {
        skipped += 1;
        continue;
      }
    } else {
      skipped += 1;
    }

    await service
      .from("subscriptions")
      .update({
        metadata: {
          ...(sub.metadata ?? {}),
          trial_reminder_sent: true,
          trial_reminder_sent_at: new Date().toISOString(),
        },
      })
      .eq("id", sub.id);
  }

  return NextResponse.json({
    ok: true,
    candidates: candidates.length,
    sent,
    skipped,
    runMs: Date.now() - startedAt,
  });
}
