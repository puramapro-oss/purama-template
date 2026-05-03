/**
 * GET /api/referral/track?code=XXXX
 *   Pose un cookie HttpOnly `{{SLUG}}_ref` (30 jours) avec le code de parrainage.
 *   Utilisé via /go/{slug} ou liens d'ambassadeurs.
 *
 * POST /api/referral/track
 *   Côté client app, après inscription, lit le cookie + crée la relation referrals.
 */
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getSupabaseServer, getSupabaseServiceClient } from "@/lib/supabase-server";

const COOKIE_NAME = "{{SLUG}}_ref";
const COOKIE_MAX_AGE = 30 * 24 * 3600; // 30 jours

export async function GET(req: NextRequest) {
  const code = new URL(req.url).searchParams.get("code")?.trim();
  if (!code || !/^[A-Za-z0-9_-]{4,32}$/.test(code)) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  const res = NextResponse.redirect(new URL("/", req.url));
  res.cookies.set(COOKIE_NAME, code, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
  return res;
}

const trackSchema = z.object({
  referralCode: z.string().min(4).max(32).regex(/^[A-Za-z0-9_-]+$/).optional(),
});

export async function POST(req: NextRequest) {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  }

  const json = await req.json().catch(() => ({}));
  const parsed = trackSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Code invalide." }, { status: 400 });
  }

  const cookieCode = req.cookies.get(COOKIE_NAME)?.value;
  const referralCode = parsed.data.referralCode ?? cookieCode;
  if (!referralCode) {
    return NextResponse.json({ ok: true, linked: false, reason: "no_code" });
  }

  const service = getSupabaseServiceClient();
  const { data: referrer } = await service
    .from("profiles")
    .select("id")
    .eq("referral_code", referralCode)
    .maybeSingle();

  if (!referrer || (referrer as { id: string }).id === user.id) {
    return NextResponse.json({ ok: true, linked: false, reason: "self_or_unknown" });
  }

  const { error } = await service.from("referrals").upsert(
    {
      referrer_user_id: (referrer as { id: string }).id,
      referred_user_id: user.id,
      status: "pending",
      level: 1,
    },
    { onConflict: "referrer_user_id,referred_user_id" },
  );
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Met à jour le profile référé pour traçabilité
  await service.from("profiles").update({ referred_by_code: referralCode }).eq("id", user.id);

  // Clear cookie
  const res = NextResponse.json({ ok: true, linked: true });
  res.cookies.delete(COOKIE_NAME);
  return res;
}
