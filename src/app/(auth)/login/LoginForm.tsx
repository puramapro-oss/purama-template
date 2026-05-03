"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { getSupabaseBrowser } from "@/lib/supabase";

const schema = z.object({
  email: z.string().email("Adresse email invalide."),
  password: z.string().min(8, "Au moins 8 caractères."),
});

interface LoginFormProps {
  nextPath: string;
}

export function LoginForm({ nextPath }: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    const parsed = schema.safeParse({ email, password });
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
      const { error } = await supabase.auth.signInWithPassword({
        email: parsed.data.email,
        password: parsed.data.password,
      });
      if (error) {
        setErrors({ form: traduireErreur(error.message) });
        setLoading(false);
        return;
      }
      router.push(nextPath);
      router.refresh();
    } catch (err) {
      setErrors({ form: err instanceof Error ? err.message : "Erreur inattendue." });
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4" data-testid="login-form">
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
        data-testid="login-email"
      />
      <Input
        label="Mot de passe"
        type="password"
        autoComplete="current-password"
        name="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
        placeholder="••••••••"
        required
        data-testid="login-password"
      />
      {errors.form && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert" data-testid="login-error">
          {errors.form}
        </p>
      )}
      <Button type="submit" size="lg" fullWidth loading={loading} data-testid="login-submit">
        Se connecter
      </Button>
    </form>
  );
}

function traduireErreur(raw: string): string {
  const lower = raw.toLowerCase();
  if (lower.includes("invalid login") || lower.includes("invalid credentials")) {
    return "Email ou mot de passe incorrect. Vérifie tes identifiants.";
  }
  if (lower.includes("email not confirmed")) {
    return "Email pas encore confirmé. Vérifie ta boîte de réception.";
  }
  if (lower.includes("rate limit")) {
    return "Trop de tentatives. Réessaie dans quelques minutes.";
  }
  return "Connexion impossible. Réessaie ou utilise « Mot de passe oublié ».";
}
