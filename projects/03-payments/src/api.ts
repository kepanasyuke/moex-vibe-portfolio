import type { Payment, PaymentKind, PaymentMethod, User } from "@contracts";

const BASE = "/api";

export interface Session {
  token: string;
  user: User;
}

export interface Balance {
  available: number;
}

export interface PaymentsPage {
  items: Payment[];
  total: number;
  nextCursor: string | null;
}

export interface PaymentDraft {
  amount: number;
  kind: PaymentKind;
  method: PaymentMethod;
  card?: string;
  idempotencyKey: string;
}

export class ApiError extends Error {}

const errorMessage = (data: unknown): string =>
  typeof data === "object" && data !== null && "error" in data
    ? String((data as { error: unknown }).error)
    : "Ошибка запроса";

const readJson = async (response: Response): Promise<unknown> =>
  response.json().catch(() => ({}));

const ensureOk = async <T,>(response: Response): Promise<T> => {
  const data = await readJson(response);

  return response.ok ? (data as T) : Promise.reject(new ApiError(errorMessage(data)));
};

const request = <T,>(path: string, init: RequestInit = {}, token?: string): Promise<T> =>
  fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  }).then((response) => ensureOk<T>(response));

export const api = {
  login: (email: string, password: string): Promise<Session> =>
    request<Session>("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  balance: (token: string): Promise<Balance> => request<Balance>("/balance", {}, token),
  payments: (token: string, kind: string, status: string, cursor: string | null): Promise<PaymentsPage> =>
    request<PaymentsPage>(
      `/payments?kind=${encodeURIComponent(kind)}&status=${encodeURIComponent(status)}&cursor=${encodeURIComponent(cursor ?? "")}`,
      {},
      token,
    ),
  create: (token: string, draft: PaymentDraft): Promise<Payment> =>
    request<Payment>("/payments", { method: "POST", body: JSON.stringify(draft) }, token),
};
