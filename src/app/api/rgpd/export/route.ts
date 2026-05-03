/**
 * {{APP_NAME}} — Export RGPD complet (art. 15 droit d'accès + art. 20 portabilité).
 *
 * Assemble les données Supabase de l'utilisateur (profile, consents, conversations)
 * et retourne un JSON unique.
 *
 * Étend si l'app stocke d'autres tables sensibles (ex: santé → ajouter ici).
 */

import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  return handle(request);
}

export async function GET(request: NextRequest) {
  return handle(request);
}

async function handle(_request: NextRequest) {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { error: "Authentification requise pour exporter tes données." },
      { status: 401 }
    );
  }

  try {
    const [{ data: profile }, { data: consents }, { data: payments }, { data: wallet }] =
      await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
        supabase.from("consents").select("*").eq("user_id", user.id),
        supabase.from("payments").select("*").eq("user_id", user.id),
        supabase.from("wallets").select("*").eq("user_id", user.id).maybeSingle(),
      ]);

    const payload = {
      generated_at: new Date().toISOString(),
      legal_basis: "RGPD art. 15 (droit d'accès) + art. 20 (portabilité)",
      app: "{{SLUG}}",
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
      },
      data: {
        profile,
        consents: consents ?? [],
        payments: payments ?? [],
        wallet,
      },
    };

    return NextResponse.json(payload, {
      headers: {
        "Content-Disposition": `attachment; filename="{{SLUG}}-export-${user.id}-${Date.now()}.json"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: "Export impossible. Réessaie dans un instant ou contacte le support si le problème persiste.",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
