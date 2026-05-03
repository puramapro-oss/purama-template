"use client";

import { useState } from "react";

export function CheckoutButton({
  plan,
  highlighted,
}: {
  plan: "standard" | "premium";
  highlighted: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function start() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setError(data.error ?? "Création du paiement impossible.");
        setBusy(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Connexion impossible.");
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={start}
        disabled={busy}
        className={`w-full text-center px-5 py-3 rounded-full font-medium transition-opacity disabled:opacity-60 hover:opacity-90 ${
          highlighted
            ? "bg-[var(--primary)] text-white"
            : "bg-[var(--secondary)] text-white"
        }`}
      >
        {busy ? "Redirection…" : "Démarrer mon essai"}
      </button>
      {error && <p role="alert" className="text-xs text-red-600 text-center">{error}</p>}
    </div>
  );
}
