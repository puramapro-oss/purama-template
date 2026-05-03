/**
 * POST /api/push/disable    Body: { token? }
 *   Si token fourni, désactive ce token précis. Sinon désactive TOUS les tokens
 *   du user (utile pour "ne plus recevoir de notifications").
 */
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getSupabaseServer } from "@/lib/supabase-server";

const schema = z.object({
  token: z.string().min(8).max(500).optional(),
});

export async function POST(req: NextRequest) {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });

  const json = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Format invalide." }, { status: 400 });
  }

  let query = supabase
    .from("push_tokens")
    .update({ enabled: false })
    .eq("user_id", user.id);
  if (parsed.data.token) query = query.eq("token", parsed.data.token);

  const { error } = await query;
  if (error) {
    return NextResponse.json(
      { error: "Désactivation impossible.", debug: error.message },
      { status: 500 }
    );
  }
  return NextResponse.json({ ok: true });
}
