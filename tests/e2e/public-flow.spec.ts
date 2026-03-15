import { expect, test } from "@playwright/test";

test("redirects protected route to login when unauthenticated", async ({
  page,
}) => {
  await page.goto("/ca/app");
  await expect(page).toHaveURL(/\/ca\/login$/);
});

test("supports locale switch from auth screen", async ({ page }) => {
  await page.goto("/ca/login");
  await page.getByTestId("auth-locale-select").selectOption("es");
  await expect(page).toHaveURL(/\/es\/login$/);
});

test("keeps horizontal overflow disabled on auth screens", async ({ page }) => {
  await page.goto("/en/login");

  const hasHorizontalOverflow = await page.evaluate(() => {
    return (
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth
    );
  });

  expect(hasHorizontalOverflow).toBe(false);
});
