/**
 * {{APP_NAME}} — OAuth/Email confirmation callback.
 *
 * Pattern PKCE @supabase/ssr (ERRORS.md SUTRA 2026-04-02) :
 *   1. Le browser client a stocké le code_verifier dans un cookie côté login
 *   2. Supabase redirige ici avec ?code=xxx
 *   3. exchangeCodeForSession lit le cookie + échange contre une session
 *   4. La session est posée en cookie httpOnly via le serveur Supabase client
 *   5. On redirige vers `next` (sanitisé contre open redirects)
 */

import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");
  const rawNext = searchParams.get("next") ?? "/app";
  const next = sanitizeNext(rawNext);

  // Cas erreur OAuth (refus, provider down, etc.)
  if (error) {
    const url = new URL(`${origin}/auth/login`);
    url.searchParams.set("error", "oauth_failed");
    if (errorDescription) url.searchParams.set("description", errorDescription);
    return NextResponse.redirect(url);
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/login?error=missing_code`);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.redirect(`${origin}/auth/login?error=server_misconfigured`);
  }

  // On crée la response avec la redirection finale, et le client Supabase
  // pose les cookies de session dessus pendant l'exchange.
  let response = NextResponse.redirect(`${origin}${next}`);

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    db: { schema: process.env.NEXT_PUBLIC_SUPABASE_DB_SCHEMA ?? "{{SLUG}}" },
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.redirect(`${origin}${next}`);
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
  if (exchangeError) {
    const url = new URL(`${origin}/auth/login`);
    url.searchParams.set("error", "oauth_failed");
    return NextResponse.redirect(url);
  }

  // Vérifie si l'utilisateur a complété l'onboarding ; sinon force /onboarding.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user && next.startsWith("/app")) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("tutorial_completed")
      .eq("id", user.id)
      .maybeSingle();
    if (profile && profile.tutorial_completed === false) {
      response = NextResponse.redirect(`${origin}/onboarding`);
      // Note : on perd les cookies de session ici. Solution : recréer la response avec les cookies.
      const cookiesArr = request.cookies.getAll();
      cookiesArr.forEach(({ name, value }) => response.cookies.set(name, value));
    }
  }

  return response;
}

function sanitizeNext(value: string): string {
  if (!value.startsWith("/") || value.startsWith("//")) return "/app";
  return value;
}
