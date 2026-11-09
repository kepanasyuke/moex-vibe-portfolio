import { describe, expect, it } from "vitest";
import { brokerFee, dividendYield, futureValue, projection, taxDue, taxRate } from "./finance.ts";

describe("taxDue", () => {
  it("берёт 13 % с суммы до 2,4 млн", () => {
    expect(taxDue(2_000_000)).toBe(260_000);
  });

  it("считает прогрессивную шкалу на границе 2,4 млн", () => {
    expect(taxDue(3_000_000)).toBe(402_000);
    expect(taxRate(3_000_000)).toBe(0.15);
  });

  it("не берёт налог с нулевого дохода", () => {
    expect(taxDue(0)).toBe(0);
  });

  it("применяет максимальную ставку к крупным доходам", () => {
    expect(taxRate(60_000_000)).toBe(0.22);
  });
});

describe("futureValue", () => {
  it("без доходности складывает начальный взнос и пополнения", () => {
    expect(futureValue({ initial: 100_000, monthly: 10_000, annualPct: 0, years: 1 })).toBe(220_000);
  });

  it("растёт с положительной доходностью", () => {
    const base = { initial: 100_000, monthly: 10_000, years: 5 };
    expect(futureValue({ ...base, annualPct: 18 })).toBeGreaterThan(futureValue({ ...base, annualPct: 0 }));
  });

  it("масштабируется по горизонту", () => {
    const five = futureValue({ initial: 100_000, monthly: 0, annualPct: 10, years: 5 });
    const ten = futureValue({ initial: 100_000, monthly: 0, annualPct: 10, years: 10 });

    expect(ten).toBeGreaterThan(five * 1.5);
  });
});

describe("projection", () => {
  it("возвращает точку на каждый год горизонта", () => {
    const points = projection({ initial: 100_000, monthly: 10_000, annualPct: 12, years: 7 });

    expect(points).toHaveLength(8);
    expect(points.at(-1)?.year).toBe(7);
  });

  it("монотонно растёт при положительной доходности", () => {
    const points = projection({ initial: 100_000, monthly: 5_000, annualPct: 10, years: 4 });
    const values = points.map((point) => point.value);

    expect(values.every((value, index) => index === 0 || value >= (values[index - 1] ?? 0))).toBe(true);
  });
});

describe("fees and yields", () => {
  it("считает комиссию брокера с минимумом", () => {
    expect(brokerFee(100_000, 0.3)).toBe(300);
    expect(brokerFee(1_000, 0.3, 50)).toBe(50);
  });

  it("считает дивидендную доходность", () => {
    expect(dividendYield(50, 1000)).toBe(5);
  });
});
