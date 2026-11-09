import Fastify from "fastify";
import cors from "@fastify/cors";
import { futureValue, projection, round2, taxDue, taxRate } from "@contracts";
import type { ProjectionInput } from "@contracts";
import { asRecord } from "@kit";

export const PRESETS = [
  { id: "bonds", title: "Облигации", annualPct: 14, risk: "Низкий риск" },
  { id: "index", title: "Индекс Мосбиржи", annualPct: 18, risk: "Средний риск" },
  { id: "stocks", title: "Акции роста", annualPct: 24, risk: "Высокий риск" },
  { id: "deposit", title: "Депозит", annualPct: 16, risk: "Без рыночного риска" },
];

const clampNumber = (value: unknown, min: number, max: number, fallback: number): number => {
  const parsed = Number(value);

  return Number.isFinite(parsed) ? Math.min(Math.max(parsed, min), max) : fallback;
};

const parseProjection = (body: Record<string, unknown>): ProjectionInput => ({
  initial: clampNumber(body.initial, 0, 100_000_000, 100_000),
  monthly: clampNumber(body.monthly, 0, 10_000_000, 20_000),
  years: Math.round(clampNumber(body.years, 1, 40, 10)),
  annualPct: clampNumber(body.annualPct, 0, 100, 18),
});

const contributedOf = (input: ProjectionInput): number =>
  round2(input.initial + input.monthly * 12 * input.years);

const incomeOf = (input: ProjectionInput, value: number): number =>
  round2(value - contributedOf(input));

const summaryOf = (input: ProjectionInput, value: number) => ({
  input,
  value,
  contributed: contributedOf(input),
  income: incomeOf(input, value),
  tax: taxDue(incomeOf(input, value)),
  net: round2(incomeOf(input, value) - taxDue(incomeOf(input, value))),
  total: round2(value - taxDue(incomeOf(input, value))),
});

const summary = (input: ProjectionInput) => summaryOf(input, futureValue(input));

const project = (input: ProjectionInput) => ({ ...summary(input), points: projection(input) });

const taxOf = (incomeRaw: unknown) => {
  const income = clampNumber(incomeRaw, 0, 1_000_000_000, 0);

  return { income, rate: taxRate(income), tax: taxDue(income), net: round2(income - taxDue(income)) };
};

export const app = Fastify({ logger: false });

app.register(cors, { origin: true });

app.get("/api/health", async () => ({ ok: true, service: "calculator" }));

app.get("/api/presets", async () => PRESETS);

app.get("/api/tax", async (request) => taxOf(asRecord(request.query).income));

app.post("/api/projection", async (request) => project(parseProjection(asRecord(request.body))));

export default app;
