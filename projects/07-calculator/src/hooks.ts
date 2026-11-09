import { useState } from "react";
import type { FormEvent } from "react";
import { useAsync } from "@ui";
import { api } from "./api.ts";
import type { Projection, ProjectionInput } from "./api.ts";

export interface CalcForm {
  initial: string;
  monthly: string;
  years: string;
  annualPct: string;
}

const INITIAL: CalcForm = { initial: "100000", monthly: "20000", years: "10", annualPct: "18" };

const toInput = (form: CalcForm): ProjectionInput => ({
  initial: Number(form.initial) || 0,
  monthly: Number(form.monthly) || 0,
  years: Math.min(Math.max(Math.round(Number(form.years) || 1), 1), 40),
  annualPct: Math.min(Math.max(Number(form.annualPct) || 0, 0), 100),
});

export const usePresets = () => useAsync(() => api.presets(), []);

export const useCalcForm = (onSubmit: (input: ProjectionInput) => void) => {
  const [form, setForm] = useState<CalcForm>(INITIAL);

  return {
    form,
    patch: (changes: Partial<CalcForm>) => setForm((previous) => ({ ...previous, ...changes })),
    submit: (event: FormEvent) => {
      event.preventDefault();
      onSubmit(toInput(form));
    },
  };
};

export const useCalcScreen = () => {
  const presets = usePresets();
  const [result, setResult] = useState<Projection | null>(null);
  const form = useCalcForm((input) => api.project(input).then(setResult));

  return { presets, result, form };
};
