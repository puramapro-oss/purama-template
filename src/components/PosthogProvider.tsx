"use client";

import { useEffect } from "react";
import posthog from "posthog-js";

/**
 * PostHog provider — n'init que SI :
 *   - NEXT_PUBLIC_POSTHOG_KEY est set
 *   - L'utilisateur a consenti aux cookies analytics (vérification cookie 'analytics_ok=1')
 *
 * Sans consentement, aucun event ne part. Aucun cookie déposé.
 */
export function PosthogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!key) return;

    const consented = typeof document !== "undefined" && document.cookie.includes("analytics_ok=1");
    if (!consented) return;

    if (!posthog.__loaded) {
      posthog.init(key, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://eu.i.posthog.com",
        capture_pageview: "history_change",
        autocapture: false,
        persistence: "localStorage+cookie",
        person_profiles: "identified_only",
      });
    }
  }, []);

  return <>{children}</>;
}
