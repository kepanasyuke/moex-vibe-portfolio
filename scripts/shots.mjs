import fs from "node:fs";
import { chromium } from "playwright";

const OUT = "docs/screenshots";
const BASE = "http://localhost:5101";

fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ channel: "msedge", headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
const errors = [];

page.on("pageerror", (error) => errors.push(String(error)));

const shot = async (name) => {
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: false });
};

const nav = (label) => page.locator("aside button", { hasText: label }).first();

const formWith = (fieldId) => page.locator("form").filter({ has: page.locator(`#${fieldId}`) });

await page.goto(BASE, { waitUntil: "networkidle" });
await page.getByText("Вход в кабинет").waitFor();
await shot("01-login");

await page.getByRole("button", { name: "Войти" }).click();
await page.getByText("Обзор портфеля").waitFor();
await shot("02-overview");

await nav("Торговля").click();
await page.getByText("Новая сделка").waitFor();
await shot("03-trading");

await page.locator("#qty").fill("10");
await formWith("qty").locator('button[type="submit"]').click();
await page.getByText("Заявка исполнена").waitFor();
await shot("04-trade-done");

await page.locator("#deposit").fill("25000");
await formWith("deposit").locator('button[type="submit"]').click();
await page.getByText("Счёт пополнен").waitFor();
await shot("05-deposit-done");

await nav("Портфель").click();
await page.getByText("Мои позиции").waitFor();
await shot("06-positions");

await nav("Операции").click();
await page.getByText("История").waitFor();
await shot("07-operations");

await nav("Уведомления").click();
await page.getByText("События по счёту и сообщения биржи").waitFor();
await shot("08-notifications");

await nav("Профиль").click();
await page.getByText("Личные данные").waitFor();
await shot("09-profile");

await page.setViewportSize({ width: 390, height: 844 });
await nav("Обзор").click();
await page.getByText("Обзор портфеля").waitFor();
await shot("10-mobile-overview");

await browser.close();

console.log("shots:", fs.readdirSync(OUT).join(", "));
console.log("page errors:", errors.length ? errors.join(" | ") : "none");
