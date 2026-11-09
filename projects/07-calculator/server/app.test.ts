import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { app } from "./app.ts";

beforeAll(async () => {
  await app.ready();
});

afterAll(async () => {
  await app.close();
});

describe("GET /api/presets", () => {
  it("отдаёт стратегии с доходностью", async () => {
    const response = await app.inject({ method: "GET", url: "/api/presets" });
    const presets = response.json<Array<{ annualPct: number }>>();

    expect(response.statusCode).toBe(200);
    expect(presets.length).toBeGreaterThanOrEqual(3);
    expect(presets.every((preset) => preset.annualPct > 0)).toBe(true);
  });
});

describe("POST /api/projection", () => {
  it("считает итог и налог", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/projection",
      payload: { initial: 100_000, monthly: 20_000, years: 10, annualPct: 18 },
    });
    const result = response.json<{ value: number; contributed: number; tax: number; points: unknown[] }>();

    expect(response.statusCode).toBe(200);
    expect(result.value).toBeGreaterThan(result.contributed);
    expect(result.tax).toBeGreaterThan(0);
    expect(result.points).toHaveLength(11);
  });

  it("ограничивает горизонт и ставку", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/projection",
      payload: { initial: -5, monthly: -10, years: 100, annualPct: 500 },
    });
    const result = response.json<{ input: { years: number; annualPct: number; initial: number } }>();

    expect(result.input.years).toBe(40);
    expect(result.input.annualPct).toBe(100);
    expect(result.input.initial).toBe(0);
  });
});

describe("GET /api/tax", () => {
  it("применяет прогрессивную шкалу", async () => {
    const response = await app.inject({ method: "GET", url: "/api/tax?income=3000000" });
    const result = response.json<{ tax: number; rate: number }>();

    expect(result.tax).toBe(402_000);
    expect(result.rate).toBe(0.15);
  });
});
