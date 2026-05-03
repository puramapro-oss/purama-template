/**
 * {{APP_NAME}} — Supabase server client.
 *
 * À utiliser dans :
 *   - Route Handlers (`src/app/api/**`)
 *   - Server Components (lecture only)
 *   - Server Actions
 *
 * Le service_role client (`getSupabaseService`) est réservé au backend
 * et bypass RLS — JAMAIS l'exporter dans un client component.
 */

import { createServerClient } from "@supabase/ssr";
import { createClient as createPgClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_SCHEMA = process.env.NEXT_PUBLIC_SUPABASE_DB_SCHEMA ?? "{{SLUG}}";

function assertEnv() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error(
      "Supabase env vars manquantes côté serveur : NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY requises."
    );
  }
}

/**
 * Client SSR avec session utilisateur (cookies). Respecte RLS.
 * Next 15+ : `cookies()` retourne une Promise — on doit l'awaiter.
 */
export async function getSupabaseServer() {
  assertEnv();
  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    db: { schema: SUPABASE_SCHEMA },
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Component context — set cookies n'est pas autorisé. C'est attendu
          // pour les composants en lecture seule, ignorer silencieusement.
        }
      },
    },
  });
}

/**
 * Client service_role (bypass RLS). Réservé aux jobs backend critiques :
 * - webhooks Stripe
 * - jobs CRON
 * - création initiale profile
 *
 * INTERDIT côté client.
 */
let serviceClient: ReturnType<typeof createPgClient> | null = null;

export function getSupabaseService() {
  if (serviceClient) return serviceClient;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY manquant — accès service_role indisponible.");
  }
  // Sans generic Database, le type de `db.schema` est restreint à `"public"`.
  // On crée le client default puis on chaîne `.schema(SUPABASE_SCHEMA)` au
  // moment des queries. Les helpers ci-dessous wrappent ça pour DX.
  serviceClient = createPgClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return serviceClient;
}

/**
 * Helper : service client déjà chaîné sur le schéma `{{SLUG}}`.
 * Utilise un cast `as never` pour contourner la contrainte typings Supabase
 * qui suppose `schema = "public"` quand aucun generic Database n'est fourni.
 */
export function getSupabaseServiceClient() {
  return getSupabaseService().schema(SUPABASE_SCHEMA as never);
}
