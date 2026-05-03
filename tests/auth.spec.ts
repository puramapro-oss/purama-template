import { expect, test } from "@playwright/test";

test.describe("Auth pages — surface + form validation", () => {
  test("/auth/login renders with email + password + OAuth buttons", async ({ page }) => {
    await page.goto("/auth/login");
    await expect(page.getByTestId("login-form")).toBeVisible();
    await expect(page.getByTestId("login-email")).toBeVisible();
    await expect(page.getByTestId("login-password")).toBeVisible();
    await expect(page.getByTestId("oauth-google")).toBeVisible();
    await expect(page.getByTestId("oauth-apple")).toBeVisible();
  });

  test("/auth/login form rejects invalid email with FR error", async ({ page }) => {
    await page.goto("/auth/login");
    await page.getByTestId("login-email").fill("not-an-email");
    await page.getByTestId("login-password").fill("Short1");
    await page.getByTestId("login-submit").click();
    await expect(page.getByText("Adresse email invalide.")).toBeVisible();
  });

  test("/auth/login form requires password >= 8 chars", async ({ page }) => {
    await page.goto("/auth/login");
    await page.getByTestId("login-email").fill("ok@example.com");
    await page.getByTestId("login-password").fill("short");
    await page.getByTestId("login-submit").click();
    await expect(page.getByText("Au moins 8 caractères.")).toBeVisible();
  });

  test("/auth/signup renders all fields", async ({ page }) => {
    await page.goto("/auth/signup");
    await expect(page.getByTestId("signup-name")).toBeVisible();
    await expect(page.getByTestId("signup-email")).toBeVisible();
    await expect(page.getByTestId("signup-password")).toBeVisible();
  });

  test("/auth/signup password validates uppercase + digit", async ({ page }) => {
    await page.goto("/auth/signup");
    await page.getByTestId("signup-name").fill("Test User");
    await page.getByTestId("signup-email").fill("ok@example.com");
    await page.getByTestId("signup-password").fill("alllower1");
    await page.getByTestId("signup-submit").click();
    await expect(page.getByText("Au moins une majuscule.")).toBeVisible();
  });

  test("/auth/forgot-password renders + accepts email", async ({ page }) => {
    await page.goto("/auth/forgot-password");
    await expect(page.getByTestId("forgot-form")).toBeVisible();
    await page.getByTestId("forgot-email").fill("invalid");
    await page.getByTestId("forgot-submit").click();
    await expect(page.getByText("Adresse email invalide.")).toBeVisible();
  });

  test("Apple OAuth button is disabled in mock mode", async ({ page }) => {
    await page.goto("/auth/login");
    const apple = page.getByTestId("oauth-apple");
    await expect(apple).toBeDisabled();
  });

  test("Home page links to login + signup", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: /connexion/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /créer un espace/i })).toBeVisible();
  });
});
