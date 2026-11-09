import type { Operation, Position, User } from "@contracts";
import type { Dashboard, NotificationItem, OperationsPage, Session } from "./types.ts";

const BASE = "/api";

export interface OrderInput {
  ticker: string;
  side: "buy" | "sell";
  qty: number;
}

export interface OrderResult {
  operation: Operation;
  position: Position | null;
  cash: number;
}

export interface DepositResult {
  ok: boolean;
  operation: Operation;
  cash: number;
}

export class ApiError extends Error {}

const readJson = async (response: Response): Promise<unknown> =>
  response.json().catch(() => ({}));

const errorMessage = (data: unknown): string =>
  typeof data === "object" && data !== null && "error" in data
    ? String((data as { error: unknown }).error)
    : "Ошибка запроса";

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
  }).then(ensureOk<T>);

export const api = {
  login: (email: string, password: string): Promise<Session> =>
    request<Session>("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  me: (token: string): Promise<User> => request<User>("/me", {}, token),
  dashboard: (token: string): Promise<Dashboard> => request<Dashboard>("/dashboard", {}, token),
  operations: (token: string, kind: string, cursor: string | null): Promise<OperationsPage> =>
    request<OperationsPage>(
      `/operations?kind=${encodeURIComponent(kind)}&cursor=${encodeURIComponent(cursor ?? "")}`,
      {},
      token,
    ),
  notifications: (token: string): Promise<NotificationItem[]> =>
    request<NotificationItem[]>("/notifications", {}, token),
  readNotification: (token: string, id: string): Promise<{ ok: boolean }> =>
    request<{ ok: boolean }>(`/notifications/${id}/read`, { method: "POST" }, token),
  order: (token: string, input: OrderInput): Promise<OrderResult> =>
    request<OrderResult>("/orders", { method: "POST", body: JSON.stringify(input) }, token),
  deposit: (token: string, amount: number): Promise<DepositResult> =>
    request<DepositResult>("/deposit", { method: "POST", body: JSON.stringify({ amount }) }, token),
  updateProfile: (token: string, name: string): Promise<User> =>
    request<User>("/profile", { method: "PATCH", body: JSON.stringify({ name }) }, token),
};
