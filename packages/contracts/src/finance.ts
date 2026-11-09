import { round2 } from "./format.ts";

const BRACKETS = [
  { limit: 2_400_000, rate: 0.13 },
  { limit: 5_000_000, rate: 0.15 },
  { limit: 20_000_000, rate: 0.18 },
  { limit: 50_000_000, rate: 0.2 },
  { limit: Number.POSITIVE_INFINITY, rate: 0.22 },
];

export const taxRate = (income: number): number =>
  BRACKETS.find((bracket) => income <= bracket.limit)?.rate ?? 0.22;

const sliceOf = (income: number, bracket: { limit: number }, from: number): number =>
  Math.max(0, Math.min(income, bracket.limit) - from);

export const taxDue = (income: number): number =>
  round2(
    BRACKETS.reduce(
      (acc, bracket) => ({
        from: Math.min(income, bracket.limit),
        total: acc.total + sliceOf(income, bracket, acc.from) * bracket.rate,
      }),
      { from: 0, total: 0 },
    ).total,
  );

export const netIncome = (income: number): number => round2(income - taxDue(income));

export interface ProjectionPoint {
  year: number;
  contributed: number;
  value: number;
}

export interface ProjectionInput {
  initial: number;
  monthly: number;
  annualPct: number;
  years: number;
}

const monthlyRate = (annualPct: number): number =>
  Math.pow(1 + annualPct / 100, 1 / 12) - 1;

const growthOf = (rate: number, months: number): number =>
  rate === 0 ? months : (Math.pow(1 + rate, months) - 1) / rate;

const grown = (input: ProjectionInput, rate: number, months: number): number =>
  input.initial * Math.pow(1 + rate, months) + input.monthly * growthOf(rate, months);

export const futureValue = (input: ProjectionInput): number => {
  const rate = monthlyRate(input.annualPct);

  return round2(grown(input, rate, input.years * 12));
};

export const projection = (input: ProjectionInput): ProjectionPoint[] =>
  Array.from({ length: input.years + 1 }, (_, year) => ({
    year,
    contributed: round2(input.initial + input.monthly * 12 * year),
    value: futureValue({ ...input, years: year }),
  }));

export const brokerFee = (amount: number, ratePct: number, min = 0): number =>
  round2(Math.max(amount * (ratePct / 100), min));

export const dividendYield = (dividend: number, price: number): number =>
  price === 0 ? 0 : round2((dividend / price) * 100);
