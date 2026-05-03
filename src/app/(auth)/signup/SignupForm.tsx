"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { getSupabaseBrowser } from "@/lib/supabase";

const schema = z
  .object({
    fullName: z.string().min(2, "Au moins 2 caractères.").max(80),
    email: z.string().email("Adresse email invalide."),
    password: z
      .string()
      .min(8, "Au moins 8 caractères.")
      .regex(/[A-Z]/, "Au moins une majuscule.")
      .regex(/[0-9]/, "Au moins un chiffre."),
  })
  .strict();

interface SignupFormProps {
  nextPath: string;
  referralCode?: string;
}

export function SignupForm({ nextPath, referralCode }: SignupFormProps) {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{
    fullName?: string;
    email?: string;
    password?: string;
    form?: string;
  }>({});
  const [loading, setLoading] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    const parsed = schema.safeParse({ fullName, email, password });
    if (!parsed.success) {
      const fieldErrors: typeof errors = {};
      for (const issue of parsed.error.issues) {
        const path = issue.path[0] as keyof typeof errors;
        if (path) fieldErrors[path] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      const supabase = getSupabaseBrowser();
      const { data, error } = await supabase.auth.signUp({
        email: parsed.data.email,
        password: parsed.data.password,
        options: {
          data: {
            full_name: parsed.data.fullName,
            referred_by_code: referralCode ?? null,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
        },
      });
      if (error) {
        setErrors({ form: traduireErreur(error.message) });
        setLoading(false);
        return;
      }
      // Si la confirmation email est désactivée côté GOTRUE (autoconfirm),
      // on a déjà une session — on peut router direct.
      if (data.session) {
        router.push(nextPath);
        router.refresh();
      } else {
        setConfirmationSent(true);
        setLoading(false);
      }
    } catch (err) {
      setErrors({ form: err instanceof Error ? err.message : "Erreur inattendue." });
      setLoading(false);
    }
  };

  if (confirmationSent) {
    return (
      <div
        className="rounded-[var(--radius-md)] border border-[var(--secondary-soft)] bg-emerald-50 dark:bg-emerald-900/20 px-4 py-5 text-sm text-[var(--foreground)]"
        role="status"
        data-testid="signup-confirmation"
      >
        <p className="font-medium mb-1">Vérifie ta boîte mail</p>
        <p className="text-[var(--muted)]">
          On t'a envoyé un lien à <strong className="text-[var(--foreground)]">{email}</strong>.
          Clique dessus pour activer ton compte (pense à regarder les spams).
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4" data-testid="signup-form">
      <Input
        label="Comment veux-tu qu'on t'appelle ?"
        type="text"
        autoComplete="name"
        name="fullName"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        error={errors.fullName}
        placeholder="Prénom"
        required
        data-testid="signup-name"
      />
      <Input
        label="Email"
        type="email"
        autoComplete="email"
        name="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
        placeholder="ton@email.fr"
        required
        data-testid="signup-email"
      />
      <Input
        label="Mot de passe"
        type="password"
        autoComplete="new-password"
        name="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
        placeholder="8 caractères, 1 majuscule, 1 chiffre"
        hint="Au moins 8 caractères, dont une majuscule et un chiffre."
        required
        data-testid="signup-password"
      />
      {errors.form && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert" data-testid="signup-error">
          {errors.form}
        </p>
      )}
      <Button type="submit" size="lg" fullWidth loading={loading} data-testid="signup-submit">
        Créer mon espace
      </Button>
    </form>
  );
}

function traduireErreur(raw: string): string {
  const lower = raw.toLowerCase();
  if (lower.includes("already registered") || lower.includes("already exists")) {
    return "Un compte existe déjà avec cet email. Connecte-toi.";
  }
  if (lower.includes("password") && lower.includes("weak")) {
    return "Mot de passe trop simple. Choisis un mot de passe plus robuste.";
  }
  if (lower.includes("rate limit")) {
    return "Trop de tentatives. Patiente quelques minutes.";
  }
  return "Inscription impossible. Réessaie ou contacte le support.";
}
