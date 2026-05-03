import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AuthCard } from "@/components/auth/AuthCard";
import { OAuthButtons } from "@/components/auth/OAuthButtons";
import { SignupForm } from "./SignupForm";

export const metadata: Metadata = {
  title: "Créer un compte",
  description: "Crée ton compte {{APP_NAME}} en 30 secondes.",
  robots: { index: false, follow: false },
};

interface SignupPageProps {
  searchParams: Promise<{ next?: string; ref?: string }>;
}

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const { next, ref } = await searchParams;
  const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : "/onboarding";
  const appleMocked = process.env.MOCK_APPLE_AUTH === "true";

  return (
    <AuthCard
      title="Bienvenue chez {{APP_NAME}}"
      subtitle="Crée ton espace en 30 secondes. Tes données sont chiffrées et hébergées en France."
      footer={
        <>
          Tu as déjà un compte ?{" "}
          <Link
            href={`/auth/login${safeNext ? `?next=${encodeURIComponent(safeNext)}` : ""}`}
            className="font-medium text-[var(--primary)] hover:underline"
          >
            Connecte-toi
          </Link>
        </>
      }
    >
      <Suspense fallback={null}>
        <SignupForm nextPath={safeNext} referralCode={ref} />
      </Suspense>

      <div className="my-5 flex items-center gap-3 text-xs text-[var(--muted)]">
        <span className="flex-1 h-px bg-[var(--border)]" />
        ou
        <span className="flex-1 h-px bg-[var(--border)]" />
      </div>

      <OAuthButtons next={safeNext} appleMocked={appleMocked} />

      <p className="mt-6 text-center text-xs text-[var(--muted)]">
        En créant un compte, tu acceptes nos{" "}
        <Link href="/legal/cgu" className="underline hover:text-[var(--foreground)]">
          Conditions Générales
        </Link>{" "}
        et notre{" "}
        <Link href="/legal/confidentialite" className="underline hover:text-[var(--foreground)]">
          Politique de confidentialité
        </Link>
        .
      </p>
    </AuthCard>
  );
}
