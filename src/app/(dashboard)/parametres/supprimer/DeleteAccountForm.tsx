"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

const REQUIRED_PHRASE = "DELETE_MY_ACCOUNT";

export function DeleteAccountForm({ email }: { email: string }) {
  const router = useRouter();
  const [phrase, setPhrase] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (phrase !== REQUIRED_PHRASE) {
      setError(`Tape exactement « ${REQUIRED_PHRASE} » pour confirmer.`);
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/account/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          confirm: REQUIRED_PHRASE,
          reason: reason.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Action impossible.");
        setSubmitting(false);
        return;
      }
      router.refresh();
    } catch {
      setError("Connexion impossible.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="glass rounded-[var(--radius-lg)] p-5 space-y-4">
      <p className="text-sm text-[var(--foreground)]">
        Tu vas demander la suppression de <strong>{email}</strong>. La suppression
        effective aura lieu dans 30 jours, période pendant laquelle tu peux
        annuler à tout moment.
      </p>

      <div>
        <label htmlFor="reason" className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
          Pourquoi pars-tu ? (facultatif, anonyme)
        </label>
        <textarea
          id="reason"
          rows={3}
          maxLength={500}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Quelques mots libres — ça nous aide à mieux faire."
          className="w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-[var(--primary)]"
        />
      </div>

      <div>
        <label htmlFor="confirm" className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
          Pour confirmer, tape <code className="font-mono">{REQUIRED_PHRASE}</code>
        </label>
        <input
          id="confirm"
          type="text"
          autoComplete="off"
          spellCheck={false}
          value={phrase}
          onChange={(e) => setPhrase(e.target.value.toUpperCase())}
          className="w-full font-mono rounded-[var(--radius-md)] border border-red-300 bg-[var(--surface)] px-3 py-2 text-sm"
        />
      </div>

      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}

      <Button
        type="submit"
        variant="primary"
        size="md"
        loading={submitting}
        disabled={phrase !== REQUIRED_PHRASE}
        fullWidth
      >
        Programmer la suppression dans 30 jours
      </Button>
    </form>
  );
}

export function CancelDeletionButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function cancel() {
    if (!confirm("Annuler la suppression programmée ?")) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/account/delete", { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Action impossible.");
        setBusy(false);
        return;
      }
      router.refresh();
    } catch {
      setError("Connexion impossible.");
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={cancel}
        disabled={busy}
        className="px-5 py-3 rounded-full bg-[var(--secondary)] text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-60"
      >
        {busy ? "Annulation…" : "Annuler la suppression"}
      </button>
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
