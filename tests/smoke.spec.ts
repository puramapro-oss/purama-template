import { expect, test } from "@playwright/test";

/**
 * Smoke test minimal — vérifie que les pages publiques répondent 200
 * et que les routes critiques existent. À enrichir par app.
 */

const PUBLIC_PAGES = [
  "/",
  "/pricing",
  "/legal/mentions-legales",
  "/legal/confidentialite",
  "/legal/cgv",
  "/legal/cgu",
];

for (const path of PUBLIC_PAGES) {
  test(`GET ${path} → 200 + non-empty`, async ({ page }) => {
    const response = await page.goto(path, { waitUntil: "domcontentloaded" });
    expect(response?.status()).toBe(200);
    const body = await page.locator("body").textContent();
    expect(body?.trim().length ?? 0).toBeGreaterThan(50);
  });
}

test("Homepage CTA visibles (signup + login)", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("cta-signup")).toBeVisible();
  await expect(page.getByTestId("cta-login")).toBeVisible();
});

test("API /api/health → 200", async ({ request }) => {
  const res = await request.get("/api/health");
  expect(res.status()).toBe(200);
});

test("API /api/karma → JSON valide", async ({ request }) => {
  const res = await request.get("/api/karma");
  expect(res.status()).toBe(200);
  const json = await res.json();
  expect(json.ok).toBe(true);
  expect(json.pools).toBeDefined();
  expect(json.pools.users_pool).toBeDefined();
  expect(json.pools.asso_pool).toBeDefined();
  expect(json.pools.sasu_pool).toBeDefined();
});
