/**
 * POST /api/push/register
 *   Body: { token, platform: 'ios'|'android'|'web', appVersion?, osVersion?, deviceModel? }
 *   Enregistre/réactive un device token pour les push notifications.
 *   UNIQUE (user_id, token) → upsert idempotent.
 */
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getSupabaseServer } from "@/lib/supabase-server";

const schema = z.object({
  token: z.string().min(8).max(500),
  platform: z.enum(["ios", "android", "web"]),
  appVersion: z.string().max(40).optional(),
  osVersion: z.string().max(40).optional(),
  deviceModel: z.string().max(80).optional(),
});

export async function POST(req: NextRequest) {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });

  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Format invalide." }, { status: 400 });
  }

  const { error } = await supabase.from("push_tokens").upsert(
    {
      user_id: user.id,
      platform: parsed.data.platform,
      token: parsed.data.token,
      app_version: parsed.data.appVersion ?? null,
      os_version: parsed.data.osVersion ?? null,
      device_model: parsed.data.deviceModel ?? null,
      enabled: true,
      last_seen_at: new Date().toISOString(),
    },
    { onConflict: "user_id,token" }
  );

  if (error) {
    return NextResponse.json(
      { error: "Enregistrement impossible.", debug: error.message },
      { status: 500 }
    );
  }

  // Telemetry install
  await supabase.from("app_install_metrics").insert({
    user_id: user.id,
    platform: parsed.data.platform,
    event_type: "install",
    app_version: parsed.data.appVersion ?? null,
    os_version: parsed.data.osVersion ?? null,
  });

  return NextResponse.json({ ok: true });
}
