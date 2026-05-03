/**
 * {{APP_NAME}} — Supabase browser client.
 *
 * IMPORTANT (cf ERRORS.md SUTRA 2026-04-02) :
 * - Utiliser `createBrowserClient` de `@supabase/ssr`, JAMAIS `createClient`
 *   de `@supabase/supabase-js`. Sinon le PKCE code verifier est stocké dans
 *   localStorage (invisible côté serveur) et l'échange de code OAuth échoue.
 * - Le schéma `{{SLUG}}` est explicite via { db: { schema } } pour éviter
 *   l'erreur PostgREST "Could not find the table 'public.profiles'".
 *
 * Ce client est sûr à instancier au module level — il ne contacte rien tant
 * qu'on ne l'utilise pas.
 */

import { createBrowserClient } from "@supabase/ssr";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_SCHEMA = process.env.NEXT_PUBLIC_SUPABASE_DB_SCHEMA ?? "{{SLUG}}";

let browserClient: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabaseBrowser() {
  if (browserClient) return browserClient;
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error(
      "Supabase env vars manquantes : NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY sont requises."
    );
  }
  browserClient = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    db: { schema: SUPABASE_SCHEMA },
    auth: {
      flowType: "pkce",
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  });
  return browserClient;
}

export const SUPABASE_PUBLIC_SCHEMA = SUPABASE_SCHEMA;
