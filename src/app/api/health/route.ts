import { NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const startedAt = Date.now();
  const checks: Record<string, { ok: boolean; latencyMs?: number; error?: string }> = {};

  try {
    const supabase = getSupabaseServiceClient();
    const t0 = Date.now();
    const { error } = await supabase.from("profiles").select("id", { head: true, count: "exact" }).limit(1);
    if (error) throw error;
    checks.supabase = { ok: true, latencyMs: Date.now() - t0 };
  } catch (err) {
    checks.supabase = {
      ok: false,
      error: err instanceof Error ? err.message : "supabase unreachable",
    };
  }

  const allOk = Object.values(checks).every((c) => c.ok);
  return NextResponse.json(
    {
      status: allOk ? "ok" : "degraded",
      uptimeMs: Date.now() - startedAt,
      checks,
      version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "dev",
      timestamp: new Date().toISOString(),
    },
    {
      status: allOk ? 200 : 503,
      headers: { "Cache-Control": "no-store, max-age=0" },
    },
  );
}
