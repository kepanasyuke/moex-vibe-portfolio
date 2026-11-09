import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import type { PaymentKind, PaymentMethod } from "@contracts";
import { useAsync } from "@ui";
import { api } from "./api.ts";
import type { PaymentDraft, Session } from "./api.ts";

interface Draft {
  kind: PaymentKind;
  amount: string;
  method: PaymentMethod;
  card: string;
}

const STORAGE = "moex.payments.session";

const readSession = (): Session | null => {
  const raw = window.localStorage.getItem(STORAGE);

  return raw ? (JSON.parse(raw) as Session) : null;
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
  };
};

export const usePaymentFilters = () => {
  const [kind, setKindState] = useState("all");
  const [status, setStatusState] = useState("all");
  const [cursor, setCursor] = useState<string | null>(null);

  return {
    kind,
    status,
    cursor,
    setKind: (value: string) => {
      setKindState(value);
      setCursor(null);
    },
    setStatus: (value: string) => {
      setStatusState(value);
      setCursor(null);
    },
    setCursor,
  };
};

export const usePaymentsFeed = (token: string, filters: ReturnType<typeof usePaymentFilters>) => {
  const balance = useAsync(() => api.balance(token), [token]);
  const page = useAsync(
    () => api.payments(token, filters.kind, filters.status, filters.cursor),
    [token, filters.kind, filters.status, filters.cursor],
  );

  useEffect(() => {
    const timer = window.setInterval(() => {
      balance.reload();
      page.reload();
    }, 3000);

    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { balance, page };
};

export const useWalletPage = (token: string) => {
  const filters = usePaymentFilters();
  const feed = usePaymentsFeed(token, filters);
  const submit = (draft: Omit<PaymentDraft, "idempotencyKey">) =>
    api.create(token, { ...draft, idempotencyKey: crypto.randomUUID() }).then(() => feed.page.reload());

  return { filters, feed, submit };
};

export const usePaymentForm = (onSubmit: (draft: Omit<PaymentDraft, "idempotencyKey">) => Promise<unknown>) => {
  const [draft, setDraft] = useState<Draft>({ kind: "deposit", amount: "10000", method: "sbp", card: "" });
  const [notice, setNotice] = useState<string | null>(null);

  return {
    draft,
    notice,
    setNotice,
    patch: (changes: Partial<Draft>) => setDraft((previous) => ({ ...previous, ...changes })),
    submit: (event: FormEvent) => {
      event.preventDefault();

      if (Number(draft.amount) < 100) {
        setNotice("Минимальная сумма — 100 ₽");
      } else {
        onSubmit({ amount: Number(draft.amount), kind: draft.kind, method: draft.method, card: draft.card })
          .then(() => setNotice(null))
          .catch((error: unknown) => setNotice(messageOf(error)));
      }
    },
  };
};

export const useWalletScreen = (token: string) => {
  const view = useWalletPage(token);
  const form = usePaymentForm(view.submit);

  return { view, form };
};
