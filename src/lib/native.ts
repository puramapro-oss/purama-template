/**
 * {{APP_NAME}} — Native bridge (stubs no-op).
 * ============================================================================
 * Le template est web-only par défaut. Pour le mobile (P7), utilise Expo
 * (cf CLAUDE.md §16 MOBILE) — pas Capacitor.
 *
 * Ces stubs permettent aux composants partagés d'importer `hapticImpact`,
 * `registerForPushNotifications` etc. sans erreur en environnement web.
 * Ils deviendront fonctionnels quand le mobile Expo sera ajouté.
 */

export type HapticIntensity = "light" | "medium" | "heavy";

export function isNativePlatform(): boolean {
  return false;
}

export async function hapticImpact(_intensity: HapticIntensity = "light"): Promise<void> {
  // no-op web
}

export async function hapticNotification(_type: "success" | "warning" | "error" = "success"): Promise<void> {
  // no-op web
}

export async function registerForPushNotifications(): Promise<{ token: string | null; error?: string }> {
  return { token: null, error: "push notifications require native runtime (Expo P7)" };
}

export async function shareContent(opts: { title?: string; text?: string; url?: string }): Promise<boolean> {
  if (typeof navigator !== "undefined" && "share" in navigator) {
    try {
      await (navigator as Navigator & { share: (data: ShareData) => Promise<void> }).share(opts);
      return true;
    } catch {
      return false;
    }
  }
  return false;
}

export async function getPreference(_key: string): Promise<string | null> {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(_key);
  } catch {
    return null;
  }
}

export async function setPreference(key: string, value: string): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // private mode / quota
  }
}
