import fs from "node:fs";
import { chromium } from "playwright";

const out = "C:/Users/Admin/Downloads/moex-ref/cab";
fs.mkdirSync(out, { recursive: true });

const browser = await chromium.launch({ channel: "msedge", headless: true });

for (const [name, width, height] of [["tablet", 900, 1100], ["mobile", 390, 900]]) {
  const page = await browser.newPage({ viewport: { width, height } });
  await page.goto("http://localhost:5101/", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Войти" }).click();
  await page.getByText("Обзор портфеля").waitFor();
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${out}/${name}.png`, fullPage: true });
  await page.close();
}

await browser.close();
console.log("ok");
