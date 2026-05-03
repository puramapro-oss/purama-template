/**
 * {{APP_NAME}} — Zernio social client.
 *
 * Zernio = réseau social interne Purama (n8n + Pollinations + cross-promo).
 * Endpoint : ZERNIO_BASE_URL (default https://zernio.com/api/v1)
 * Auth     : Bearer ZERNIO_API_KEY
 *
 * Usage typique :
 *   await publishToZernio({ userId, kind: "achievement", payload: {...} })
 *   await trackZernioEvent({ userId, event: "level_up", value: 12 })
 */

const ZERNIO_BASE_URL = process.env.ZERNIO_BASE_URL ?? "https://zernio.com/api/v1";
const ZERNIO_API_KEY = process.env.ZERNIO_API_KEY;

export type ZernioPostKind =
  | "achievement"
  | "milestone"
  | "streak"
  | "level_up"
  | "referral_success"
  | "custom";

export interface ZernioPostPayload {
  title: string;
  body?: string;
  imageUrl?: string;
  cta?: { label: string; url: string };
  metadata?: Record<string, unknown>;
}

function assertConfigured(): string {
  if (!ZERNIO_API_KEY) {
    throw new Error(
      "[zernio] ZERNIO_API_KEY manquante. Renseigne la clé dans .env.local ou stub la fonction côté caller.",
    );
  }
  return ZERNIO_API_KEY;
}

async function zernioFetch<T>(path: string, init: RequestInit): Promise<T> {
  const apiKey = assertConfigured();
  const url = `${ZERNIO_BASE_URL}${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "X-App-Slug": "{{SLUG}}",
      ...(init.headers ?? {}),
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`[zernio] ${res.status} ${res.statusText}: ${text.slice(0, 200)}`);
  }
  return (await res.json()) as T;
}

/**
 * Publie un post sur le feed Zernio de l'utilisateur (cross-promo Purama).
 * No-op silencieux si ZERNIO_API_KEY absent (utile en dev).
 */
export async function publishToZernio(opts: {
  userId: string;
  kind: ZernioPostKind;
  payload: ZernioPostPayload;
}): Promise<{ ok: boolean; postId?: string; skipped?: boolean }> {
  if (!ZERNIO_API_KEY) {
    return { ok: true, skipped: true };
  }
  const data = await zernioFetch<{ post_id: string }>("/posts", {
    method: "POST",
    body: JSON.stringify({
      user_id: opts.userId,
      app_slug: "{{SLUG}}",
      kind: opts.kind,
      payload: opts.payload,
    }),
  });
  return { ok: true, postId: data.post_id };
}

/**
 * Track un événement utilisateur (XP, achievement, level up, etc.).
 */
export async function trackZernioEvent(opts: {
  userId: string;
  event: string;
  value?: number;
  metadata?: Record<string, unknown>;
}): Promise<{ ok: boolean; skipped?: boolean }> {
  if (!ZERNIO_API_KEY) {
    return { ok: true, skipped: true };
  }
  await zernioFetch("/events", {
    method: "POST",
    body: JSON.stringify({
      user_id: opts.userId,
      app_slug: "{{SLUG}}",
      event: opts.event,
      value: opts.value ?? 1,
      metadata: opts.metadata ?? {},
    }),
  });
  return { ok: true };
}

/**
 * Vérifie la signature d'un webhook entrant Zernio (HMAC SHA-256).
 * Header: x-zernio-signature: sha256=<hex>
 */
export async function verifyZernioWebhook(
  rawBody: string,
  signatureHeader: string | null,
  secret: string,
): Promise<boolean> {
  if (!signatureHeader) return false;
  const expected = signatureHeader.replace(/^sha256=/, "");
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(rawBody));
  const hex = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return timingSafeEqual(expected, hex);
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}
