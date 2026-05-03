import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/auth/AuthCard";
import { ForgotPasswordForm } from "./ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Mot de passe oublié",
  description: "Reçois un lien pour réinitialiser ton mot de passe {{APP_NAME}}.",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title="Réinitialiser mon mot de passe"
      subtitle="Indique ton email, on t'envoie un lien sécurisé pour le redéfinir."
      footer={
        <>
          De retour ?{" "}
          <Link href="/auth/login" className="font-medium text-[var(--primary)] hover:underline">
            Connecte-toi
          </Link>
        </>
      }
    >
      <ForgotPasswordForm />
    </AuthCard>
  );
}
