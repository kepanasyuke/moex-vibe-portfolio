export interface Preset {
  id: string;
  title: string;
  annualPct: number;
  risk: string;
}

export interface ProjectionPoint {
  year: number;
  contributed: number;
  value: number;
}

export interface Projection {
  input: { initial: number; monthly: number; years: number; annualPct: number };
  value: number;
  contributed: number;
  income: number;
  tax: number;
  net: number;
  total: number;
  points: ProjectionPoint[];
}

export interface ProjectionInput {
  initial: number;
  monthly: number;
  years: number;
  annualPct: number;
}

const BASE = "/api";

const post = async <T,>(path: string, body: unknown): Promise<T> => {
  const response = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

  return response.ok ? (response.json() as Promise<T>) : Promise.reject(new Error("Не удалось рассчитать"));
};

export const api = {
  presets: (): Promise<Preset[]> => fetch(`${BASE}/presets`).then((response) => response.json()),
  project: (input: ProjectionInput): Promise<Projection> => post<Projection>("/projection", input),
};
