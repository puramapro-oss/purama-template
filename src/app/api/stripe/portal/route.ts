/**
 * POST /api/stripe/portal
 *   Renvoie l'URL du Stripe Customer Portal pour gérer/annuler l'abonnement.
 *   En mock-mode → renvoie /app/abonnement avec un flag.
 */
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";
import { createPortalSession, isStripeMocked } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? new URL(req.url).origin;
  const returnUrl = `${baseUrl}/app/abonnement`;

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (isStripeMocked()) {
    return NextResponse.json({
      url: `${returnUrl}?mock_portal=1`,
      mocked: true,
    });
  }

  if (!sub?.stripe_customer_id) {
    return NextResponse.json(
      { error: "Aucun abonnement actif trouvé." },
      { status: 404 }
    );
  }

  try {
    const session = await createPortalSession({
      customerId: sub.stripe_customer_id,
      returnUrl,
    });
    return NextResponse.json({ url: session.url, mocked: session.mocked });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Portail indisponible.",
        debug: error instanceof Error ? error.message : "unknown",
      },
      { status: 500 }
    );
  }
}
