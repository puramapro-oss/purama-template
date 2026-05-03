import Link from "next/link";
import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase-server";

/**
 * Page d'accueil APP (pas landing 13 sections).
 * Auth → /dashboard. Non-auth → écran shell minimal avec CTA login/signup
 * (style ChatGPT/Claude.ai). Conforme CLAUDE.md « DESIGN=APP ».
 */
export default async function HomePage() {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="glass max-w-md w-full p-10 flex flex-col items-center gap-8 text-center">
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white"
            style={{ background: "var(--gradient-primary)" }}
            aria-hidden
          >
            {"{{APP_NAME}}".charAt(0)}
          </div>
          <h1 className="text-3xl font-semibold gradient-text">{"{{APP_NAME}}"}</h1>
          <p className="text-sm text-[color:var(--muted)] max-w-xs">
            {"{{APP_DESCRIPTION}}"}
          </p>
        </div>

        <div className="flex flex-col gap-3 w-full">
          <Link
            href="/signup"
            className="btn-primary w-full"
            data-testid="cta-signup"
          >
            Commencer
          </Link>
          <Link
            href="/login"
            className="btn-secondary w-full"
            data-testid="cta-login"
          >
            Se connecter
          </Link>
        </div>

        <div className="text-xs text-[color:var(--muted)] flex gap-3 flex-wrap justify-center">
          <Link href="/pricing" className="hover:text-foreground transition-colors">
            Tarifs
          </Link>
          <span aria-hidden>·</span>
          <Link href="/legal/mentions-legales" className="hover:text-foreground transition-colors">
            Mentions légales
          </Link>
          <span aria-hidden>·</span>
          <Link href="/legal/confidentialite" className="hover:text-foreground transition-colors">
            Confidentialité
          </Link>
        </div>
      </div>
    </main>
  );
}
