import type { MetadataRoute } from "next";

/**
 * PWA manifest générique. Couleurs/icônes overridables via env.
 * Personnalise `categories` et `shortcuts` après bootstrap selon le domaine de l'app.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "{{APP_NAME}} — {{APP_DESCRIPTION}}",
    short_name: "{{APP_NAME}}",
    description: "{{APP_DESCRIPTION}}",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: process.env.NEXT_PUBLIC_BG_COLOR ?? "#0A0A0F",
    theme_color: process.env.NEXT_PUBLIC_THEME_COLOR ?? "{{PRIMARY_COLOR}}",
    lang: "fr",
    scope: "/",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    categories: ["productivity", "lifestyle"],
  };
}
