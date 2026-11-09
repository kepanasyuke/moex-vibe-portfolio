import { useState } from "react";
import type { FormEvent } from "react";
import type { Role, UserStatus } from "@contracts";
import { useAsync, useTabs } from "@ui";
import { api } from "./api.ts";
import type { AdminUser, BroadcastInput, Session } from "./api.ts";

export type Section = "overview" | "users" | "audit" | "broadcast";

const STORAGE = "moex.admin.session";

const readSession = (): Session | null => {
  const raw = window.localStorage.getItem(STORAGE);

  return raw ? (JSON.parse(raw) as Session) : null;
};

const messageOf = (error: unknown): string =>
  error instanceof Error ? error.message : "Не удалось выполнить операцию";

export const useSession = () => {
  const [session, setSession] = useState<Session | null>(readSession);
  const [error, setError] = useState<string | null>(null);

  return {
    session,
    error,
    signIn: (email: string, password: string) =>
      api.login(email, password).then(
        (next) => {
          window.localStorage.setItem(STORAGE, JSON.stringify(next));
          setSession(next);
          setError(null);
        },
        (cause: unknown) => setError(messageOf(cause)),
      ),
    signOut: () => {
      window.localStorage.removeItem(STORAGE);
      setSession(null);
    },
  };
};

export const useAdminData = (token: string) => {
  const users = useAsync(() => api.users(token), [token]);
  const stats = useAsync(() => api.stats(token), [token]);
  const audit = useAsync(() => api.audit(token, null), [token]);

  return {
    users,
    stats,
    audit,
    setRole: (userId: string, role: Role) => api.setRole(token, userId, role).then(() => users.reload()),
    setStatus: (userId: string, status: UserStatus) =>
      api.setStatus(token, userId, status).then(() => users.reload()),
    broadcast: (input: BroadcastInput) => api.broadcast(token, input).then(() => stats.reload()),
  };
};

export const useAdminScreen = (token: string) => {
  const tabs = useTabs<Section>("overview");
  const data = useAdminData(token);

  return { tabs, data };
};

export const useUsersView = (users: AdminUser[]) => {
  const [query, setQuery] = useState("");
  const filtered = users.filter((user) => `${user.name} ${user.email}`.toLowerCase().includes(query.trim().toLowerCase()));

  return { query, setQuery, filtered };
};

export const useAuditPage = (token: string) => {
  const [cursor, setCursor] = useState<string | null>(null);
  const audit = useAsync(() => api.audit(token, cursor), [token, cursor]);

  return { cursor, setCursor, audit };
};

export const useBroadcastForm = (onSend: (input: BroadcastInput) => Promise<unknown>) => {
  const [form, setForm] = useState<BroadcastInput>({ title: "", body: "", audience: "all" });
  const [notice, setNotice] = useState<string | null>(null);

  return {
    form,
    notice,
    patch: (changes: Partial<BroadcastInput>) => setForm((previous) => ({ ...previous, ...changes })),
    submit: (event: FormEvent) => {
      event.preventDefault();

      if (!form.title.trim() || !form.body.trim()) {
        setNotice("Заполните заголовок и текст");
      } else {
        onSend(form)
          .then(() => {
            setNotice("Рассылка отправлена");
            setForm((previous) => ({ ...previous, title: "", body: "" }));
          })
          .catch((error: unknown) => setNotice(messageOf(error)));
      }
    },
  };
};
