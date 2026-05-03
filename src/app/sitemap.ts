import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://{{SLUG}}.purama.dev";

const STATIC_PATHS = [
  "/",
  "/pricing",
  "/legal/mentions-legales",
  "/legal/confidentialite",
  "/legal/cgv",
  "/legal/cgu",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return STATIC_PATHS.map((path) => ({
    url: `${BASE}${path}`,
    lastModified,
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1.0 : path === "/pricing" ? 0.8 : 0.5,
  }));
}
