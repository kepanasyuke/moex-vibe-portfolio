import { expect, test } from "@playwright/test";

test("калькулятор считает доходность", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByText("Сколько принесёт портфель")).toBeVisible();

  await page.getByTestId("calc-submit").click();

  const total = page.getByTestId("calc-total");

  await expect(total).toBeVisible();
  await expect(total).toContainText("₽");
});

test("выбор стратегии подставляет доходность", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: /Акции роста/ }).click();

  await expect(page.locator("#rate")).toHaveValue("24");
});
