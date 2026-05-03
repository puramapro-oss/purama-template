"use client";

import { useState, type FormEvent } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { getSupabaseBrowser } from "@/lib/supabase";

const schema = z.object({ email: z.string().email("Adresse email invalide.") });

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setEmailError(undefined);
    setFormError(undefined);

    const parsed = schema.safeParse({ email });
    if (!parsed.success) {
      setEmailError(parsed.error.issues[0]?.message ?? "Email invalide.");
      return;
    }

    setLoading(true);
    try {
      const supabase = getSupabaseBrowser();
      const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password`,
      });
      if (error) {
        setFormError("Impossible d'envoyer le lien. Réessaie dans un instant.");
        setLoading(false);
        return;
      }
      // Note : Supabase répond 200 même si l'email n'existe pas (anti-énumération).
      setSent(true);
      setLoading(false);
    } catch {
      setFormError("Erreur réseau. Vérifie ta connexion.");
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div
        className="rounded-[var(--radius-md)] border border-[var(--secondary-soft)] bg-emerald-50 dark:bg-emerald-900/20 px-4 py-5 text-sm"
        role="status"
        data-testid="forgot-confirmation"
      >
        <p className="font-medium mb-1 text-[var(--foreground)]">Lien envoyé</p>
        <p className="text-[var(--muted)]">
          Si un compte existe avec cet email, tu recevras un lien dans quelques minutes.
          Pense à vérifier les spams.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4" data-testid="forgot-form">
      <Input
        label="Email"
        type="email"
        autoComplete="email"
        name="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={emailError}
        placeholder="ton@email.fr"
        required
        data-testid="forgot-email"
      />
      {formError && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {formError}
        </p>
      )}
      <Button type="submit" size="lg" fullWidth loading={loading} data-testid="forgot-submit">
        Recevoir le lien
      </Button>
    </form>
  );
}
