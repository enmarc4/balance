import { expect, test } from "@playwright/test";

const e2eEmail = process.env.E2E_USER_EMAIL;
const e2ePassword = process.env.E2E_USER_PASSWORD;

test.describe("authenticated flow", () => {
  test.skip(!e2eEmail || !e2ePassword, "E2E credentials not configured");

  test("login, onboarding fallback, and account creation", async ({ page }) => {
    const accountName = `E2E ${Date.now()}`;

    await page.goto("/en/login");
    await page.fill("#login-email", e2eEmail ?? "");
    await page.fill("#login-password", e2ePassword ?? "");
    await page.getByRole("button", { name: "Sign in" }).click();

    await page.waitForURL(/\/en\/(onboarding|app)/);

    if (page.url().includes("/onboarding")) {
      await page.fill("#full-name", "E2E User");
      await page.getByRole("button", { name: "Next" }).click();

      await page.fill("#first-account-name", accountName);
      await page.getByRole("button", { name: "Next" }).click();

      await page.fill("#first-account-balance", "100");
      await page.getByRole("button", { name: "Complete onboarding" }).click();
      await page.waitForURL(/\/en\/app$/);
    }

    await page.goto("/en/app/accounts");
    await page.fill("#create-name", accountName);
    await page.fill("#create-balance", "250");
    await page.getByRole("button", { name: "Create account" }).click();

    await expect(page.getByText(accountName).first()).toBeVisible();
  });
});
