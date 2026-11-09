import type { AuditEntry, Role, User, UserStatus } from "@contracts";

const BASE = "/api";

export interface Session {
  token: string;
  user: User;
}

export interface AdminUser extends User {
  operations: number;
  payments: number;
  notifications: number;
}

export interface Stats {
  users: number;
  admins: number;
  blocked: number;
  notifications: number;
  audit: number;
  depositVolume: number;
}

export interface AuditPage {
  items: AuditEntry[];
  total: number;
  nextCursor: string | null;
}

export interface BroadcastInput {
  title: string;
  body: string;
  audience: string;
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
  users: (token: string): Promise<AdminUser[]> => request<AdminUser[]>("/users", {}, token),
  stats: (token: string): Promise<Stats> => request<Stats>("/stats", {}, token),
  audit: (token: string, cursor: string | null): Promise<AuditPage> =>
    request<AuditPage>(`/audit?cursor=${encodeURIComponent(cursor ?? "")}`, {}, token),
  setRole: (token: string, userId: string, role: Role): Promise<AuditEntry> =>
    request<AuditEntry>(`/users/${userId}/role`, { method: "PATCH", body: JSON.stringify({ role }) }, token),
  setStatus: (token: string, userId: string, status: UserStatus): Promise<AuditEntry> =>
    request<AuditEntry>(`/users/${userId}/status`, { method: "PATCH", body: JSON.stringify({ status }) }, token),
  broadcast: (token: string, input: BroadcastInput): Promise<AuditEntry> =>
    request<AuditEntry>("/broadcast", { method: "POST", body: JSON.stringify(input) }, token),
};
