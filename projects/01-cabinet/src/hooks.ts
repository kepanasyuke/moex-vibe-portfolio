import { useState } from "react";
import type { FormEvent } from "react";
import type { User } from "@contracts";
import { useAsync } from "@ui";
import { api } from "./api.ts";
import type { OrderInput } from "./api.ts";
import type { Session } from "./types.ts";

const STORAGE = "moex.cabinet.session";

const readSession = (): Session | null => {
  const raw = window.localStorage.getItem(STORAGE);

  return raw ? (JSON.parse(raw) as Session) : null;
};

const saveSession = (session: Session): Session => {
  window.localStorage.setItem(STORAGE, JSON.stringify(session));

  return session;
};

const persistSession = (previous: Session | null, user: User): Session | null => {
  const next = previous ? { ...previous, user } : null;

  return next ? saveSession(next) : null;
};

const messageOf = (error: unknown): string =>
  error instanceof Error ? error.message : "Не удалось войти";

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
    updateUser: (user: User) => setSession((previous) => persistSession(previous, user)),
  };
};

export const useLoginForm = (onSubmit: (email: string, password: string) => void) => {
  const [email, setEmail] = useState("ivan.petrov@moex.dev");
  const [password, setPassword] = useState("Demo12345");

  return {
    email,
    password,
    setEmail,
    setPassword,
    submit: (event: FormEvent) => {
      event.preventDefault();
      onSubmit(email, password);
    },
    quick: (nextEmail: string, nextPassword: string) => {
      onSubmit(nextEmail, nextPassword);
    },
  };
};

export const useDashboard = (token: string) => useAsync(() => api.dashboard(token), [token]);

export const useOperationsView = (token: string) => {
  const [kind, setKindState] = useState("all");
  const [cursor, setCursor] = useState<string | null>(null);
  const data = useAsync(() => api.operations(token, kind, cursor), [token, kind, cursor]);

  return {
    kind,
    cursor,
    data,
    setKind: (next: string) => {
      setKindState(next);
      setCursor(null);
    },
    setCursor,
  };
};

export const useNotificationsView = (token: string) => {
  const list = useAsync(() => api.notifications(token), [token]);

  return {
    list,
    markRead: (id: string) => api.readNotification(token, id).then(() => list.reload()),
  };
};

export interface TradeFormState {
  ticker: string;
  side: "buy" | "sell";
  qty: string;
}

const failureOf = (error: unknown): string =>
  error instanceof Error ? error.message : "Не удалось выполнить операцию";

export const useTradeForm = (onSubmit: (input: OrderInput) => Promise<unknown>) => {
  const [form, setForm] = useState<TradeFormState>({ ticker: "GAZP", side: "buy", qty: "10" });
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  return {
    form,
    notice,
    error,
    patch: (changes: Partial<TradeFormState>) => setForm((previous) => ({ ...previous, ...changes })),
    submit: (event: FormEvent) => {
      event.preventDefault();

      if (Number(form.qty) > 0) {
        onSubmit({ ticker: form.ticker, side: form.side, qty: Number(form.qty) }).then(
          () => {
            setNotice("Заявка исполнена");
            setError(null);
          },
          (cause: unknown) => {
            setError(failureOf(cause));
            setNotice(null);
          },
        );
      } else {
        setError("Укажите количество");
      }
    },
  };
};

export const useDepositForm = (onSubmit: (amount: number) => Promise<unknown>) => {
  const [amount, setAmount] = useState("10000");
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  return {
    amount,
    notice,
    error,
    patch: (value: string) => setAmount(value),
    submit: (event: FormEvent) => {
      event.preventDefault();

      if (Number(amount) >= 100) {
        onSubmit(Number(amount)).then(
          () => {
            setNotice("Счёт пополнен");
            setError(null);
          },
          (cause: unknown) => {
            setError(failureOf(cause));
            setNotice(null);
          },
        );
      } else {
        setError("Минимальная сумма — 100 ₽");
      }
    },
  };
};

export const useTradingScreen = (token: string) => {
  const dashboard = useDashboard(token);
  const trade = useTradeForm((input) =>
    api.order(token, input).then((result) => {
      dashboard.reload();

      return result;
    }),
  );
  const deposit = useDepositForm((value) =>
    api.deposit(token, value).then((result) => {
      dashboard.reload();

      return result;
    }),
  );

  return { dashboard, trade, deposit };
};

export const useProfileScreen = (token: string, user: User, onSaved: (next: User) => void) => {
  const [name, setName] = useState(user.name);
  const [feedback, setFeedback] = useState<{ tone: "ok" | "error"; text: string } | null>(null);

  return {
    name,
    feedback,
    patch: (value: string) => setName(value),
    submit: (event: FormEvent) => {
      event.preventDefault();

      api.updateProfile(token, name).then(
        (next) => {
          onSaved(next);
          setFeedback({ tone: "ok", text: "Профиль обновлён" });
        },
        (cause: unknown) => setFeedback({ tone: "error", text: failureOf(cause) }),
      );
    },
  };
};
