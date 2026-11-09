import { randomUUID } from "node:crypto";
import cors from "@fastify/cors";
import Fastify from "fastify";
import { amount as validateAmount, luhn, maskCard, paginate } from "@contracts";
import type { Payment, PaymentKind, PaymentMethod, Validation } from "@contracts";
import {
  asRecord,
  authed,
  createStore,
  findByEmail,
  id,
  intParam,
  signToken,
  strParam,
  verifyPassword,
} from "@kit";

const PORT = Number(process.env.PORT ?? 4103);
const HOST = process.env.HOST ?? "127.0.0.1";

const store = createStore();
const app = Fastify({ logger: false });

const balanceOf = (userId: string): number =>
  store.payments
    .filter((payment) => payment.userId === userId && payment.status === "settled")
    .reduce((acc, payment) => acc + (payment.kind === "deposit" ? payment.amount : -(payment.amount + payment.fee)), 0);

const feeOf = (kind: PaymentKind, amount: number): number =>
  kind === "withdraw" ? Math.max(30, Math.round(amount * 0.01)) : 0;

const kindOf = (value: unknown): PaymentKind => (value === "withdraw" ? "withdraw" : "deposit");

const methodOf = (value: unknown): PaymentMethod =>
  value === "card" || value === "sbp" || value === "account" ? value : "account";

interface Draft {
  amount: number;
  kind: PaymentKind;
  method: PaymentMethod;
  card: string;
  key: string;
}

interface PaymentInput {
  amount: number;
  kind: PaymentKind;
  method: PaymentMethod;
  cardMask: string | null;
  idempotencyKey: string;
}

const draftOf = (raw: string, data: Record<string, unknown>): Draft => ({
  amount: Number(raw),
  kind: kindOf(data.kind),
  method: methodOf(data.method),
  card: strParam(data.card),
  key: strParam(data.idempotencyKey),
});

const cardError = (draft: Draft): string | null =>
  draft.method === "card" && !luhn(draft.card) ? "Проверьте номер карты" : null;

const limitError = (draft: Draft, userId: string): string | null =>
  draft.kind === "withdraw" && draft.amount + feeOf(draft.kind, draft.amount) > balanceOf(userId)
    ? "Недостаточно средств с учётом комиссии"
    : null;

const toInput = (draft: Draft): PaymentInput => ({
  amount: draft.amount,
  kind: draft.kind,
  method: draft.method,
  cardMask: draft.method === "card" ? maskCard(draft.card) : null,
  idempotencyKey: draft.key || randomUUID(),
});

const validateDraft = (draft: Draft, userId: string): { ok: true; input: PaymentInput } | { ok: false; error: string } => {
  const error = cardError(draft) ?? limitError(draft, userId);

  return error ? { ok: false, error } : { ok: true, input: toInput(draft) };
};

const amountRaw = (value: unknown): string =>
  typeof value === "number" ? String(value) : strParam(value);

const parsePayment = (body: unknown, userId: string): { ok: true; input: PaymentInput } | { ok: false; error: string } => {
  const checked: Validation = validateAmount(amountRaw(asRecord(body).amount));

  return checked.ok ? validateDraft(draftOf(checked.value, asRecord(body)), userId) : checked;
};

const verdictOf = (payment: Payment) => {
  const rejected = payment.kind === "withdraw" && payment.amount + payment.fee > balanceOf(payment.userId);

  return { status: rejected ? "rejected" : "settled", reason: rejected ? "Недостаточно средств" : null };
};

const settle = (payment: Payment): Payment => Object.assign(payment, verdictOf(payment));

const newPayment = (userId: string, input: PaymentInput): Payment => ({
  id: id("pay"),
  userId,
  status: "processing",
  fee: feeOf(input.kind, input.amount),
  createdAt: new Date().toISOString(),
  reason: null,
  ...input,
});

const scheduleSettle = (payment: Payment): Payment => {
  setTimeout(() => settle(payment), 2200);

  return payment;
};

const register = (payment: Payment): Payment => {
  store.payments.push(payment);

  return scheduleSettle(payment);
};

const launchPayment = (userId: string, input: PaymentInput): Payment =>
  register(newPayment(userId, input));

const createPayment = (userId: string, input: PaymentInput): Payment =>
  store.payments.find(
    (payment) => payment.userId === userId && payment.idempotencyKey === input.idempotencyKey,
  ) ?? launchPayment(userId, input);

const matchKind = (payment: Payment, kind: string): boolean =>
  !kind || kind === "all" || payment.kind === kind;

const matchStatus = (payment: Payment, status: string): boolean =>
  !status || status === "all" || payment.status === status;

const filteredOf = (userId: string, query: Record<string, unknown>): Payment[] =>
  store.payments
    .filter(
      (payment) =>
        payment.userId === userId &&
        matchKind(payment, strParam(query.kind)) &&
        matchStatus(payment, strParam(query.status)),
    )
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt));

const loginUser = async (email: string, password: string) => {
  const user = findByEmail(store, email);

  return user && verifyPassword(password, store.passwords[user.email] ?? "")
    ? { token: await signToken(user), user }
    : null;
};

await app.register(cors, { origin: true });

app.get("/api/health", async () => ({ ok: true, service: "payments" }));

app.post("/api/auth/login", async (request, reply) => {
  const data = asRecord(request.body);

  return (await loginUser(strParam(data.email), strParam(data.password))) ?? reply.code(401).send({
    error: "Неверный e-mail или пароль",
  });
});

app.get("/api/balance", authed(async (payload) => ({ available: balanceOf(payload.sub) })));

app.get(
  "/api/payments",
  authed(async (payload, request) => {
    const query = asRecord(request.query);

    return paginate(filteredOf(payload.sub, query), intParam(query.limit, 10), strParam(query.cursor) || null);
  }),
);

app.post("/api/payments", authed(async (payload, request, reply) => {
  const parsed = parsePayment(request.body, payload.sub);

  return parsed.ok ? createPayment(payload.sub, parsed.input) : reply.code(400).send({ error: parsed.error });
}));

await app.listen({ port: PORT, host: HOST });
console.info(`[payments] API http://${HOST}:${PORT}`);
