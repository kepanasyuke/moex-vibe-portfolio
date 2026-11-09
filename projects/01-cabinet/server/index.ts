import cors from "@fastify/cors";
import Fastify from "fastify";
import {
  allocation,
  amount as validateAmount,
  name as validateName,
  paginate,
  pctChange,
  portfolioTotals,
  positionPnl,
  positionValue,
  round2,
} from "@contracts";
import type { Notification, Operation, Position, Quote, User, Validation } from "@contracts";
import {
  asRecord,
  authed,
  createStore,
  findByEmail,
  id,
  intParam,
  mulberry32,
  signToken,
  strParam,
  verifyPassword,
} from "@kit";

const PORT = Number(process.env.PORT ?? 4101);
const HOST = process.env.HOST ?? "127.0.0.1";
const FEE_RATE = 0.003;

const store = createStore();
const app = Fastify({ logger: false });

interface OrderDraft {
  quote: Quote;
  side: "buy" | "sell";
  qty: number;
  amount: number;
  fee: number;
}

const daysAgo = (days: number): string =>
  new Date(Date.now() - days * 86_400_000).toISOString();

const credentialsOf = (body: unknown): readonly [string, string] => {
  const parsed = (body ?? {}) as { email?: string; password?: string };

  return [parsed.email ?? "", parsed.password ?? ""];
};

const loginUser = async (email: string, password: string): Promise<{ token: string; user: User } | null> => {
  const user = findByEmail(store, email);

  return user && verifyPassword(password, store.passwords[user.email] ?? "")
    ? { token: await signToken(user), user }
    : null;
};

const seedOf = (value: string): number =>
  [...value].reduce((acc, char) => acc + char.charCodeAt(0), 0);

const historyOf = (value: number, userId: string): Array<{ date: string; value: number }> => {
  const random = mulberry32(seedOf(userId));

  return Array.from({ length: 30 }, (_, index) => ({
    date: daysAgo(29 - index),
    value: round2(value * (0.92 + (index / 29) * 0.08) * (1 + (random() - 0.5) * 0.015)),
  }));
};

const deltaOf = (operation: Operation): number =>
  operation.kind === "buy" || operation.kind === "withdraw" || operation.kind === "fee"
    ? -Math.abs(operation.amount)
    : Math.abs(operation.amount);

const cashOf = (userId: string): number =>
  round2(
    store.operations
      .filter((operation) => operation.userId === userId)
      .reduce((acc, operation) => acc + deltaOf(operation), 0),
  );

const positionRow = (position: Position, quotes: Quote[]) => {
  const quote = quotes.find((item) => item.ticker === position.ticker);

  return {
    ...position,
    name: quote?.name ?? position.ticker,
    price: quote?.price ?? 0,
    changePct: quote ? pctChange(quote.price, quote.prevClose) : 0,
    value: round2(positionValue(position, quotes)),
    pnl: round2(positionPnl(position, quotes)),
  };
};

const dashboardOf = (userId: string) => buildDashboard(store.positions[userId] ?? [], store.quotes, userId);

const buildDashboard = (positions: Position[], quotes: Quote[], userId: string) => {
  const totals = portfolioTotals(positions, quotes);

  return dashboardView(totals, cashOf(userId), positions, quotes, userId);
};

const dashboardView = (
  totals: ReturnType<typeof portfolioTotals>,
  cash: number,
  positions: Position[],
  quotes: Quote[],
  userId: string,
) => ({
  totals,
  cash,
  equity: round2(totals.value + cash),
  positions: positions.map((position) => positionRow(position, quotes)),
  allocation: allocation(positions, quotes),
  quotes,
  history: historyOf(totals.value + cash, userId),
  unread: store.notifications.filter((item) => item.userId === userId && !item.read).length,
  updatedAt: new Date().toISOString(),
});

const operationsOf = (userId: string, kind: string, cursor: string | null, limit: number) =>
  paginate(
    store.operations
      .filter((operation) => operation.userId === userId && (kind === "all" || operation.kind === kind))
      .sort((left, right) => right.at.localeCompare(left.at)),
    limit,
    cursor,
  );

const notificationsOf = (userId: string): Notification[] =>
  store.notifications
    .filter((item) => item.userId === userId)
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt));

const markRead = (userId: string, notificationId: string): boolean => {
  const target = store.notifications.find((item) => item.id === notificationId && item.userId === userId);

  return target ? readNotification(target) : false;
};

const readNotification = (item: Notification): boolean => {
  item.read = true;

  return true;
};

const userOf = (userId: string): User | null =>
  store.users.find((user) => user.id === userId) ?? null;

const quotesOf = () => store.quotes;

const quoteOf = (ticker: string): Quote | null =>
  store.quotes.find((quote) => quote.ticker === ticker) ?? null;

const ensurePositions = (userId: string): Position[] =>
  store.positions[userId] ?? (store.positions[userId] = []);

const positionOf = (userId: string, ticker: string): Position | null =>
  ensurePositions(userId).find((position) => position.ticker === ticker) ?? null;

const pushPosition = (positions: Position[], position: Position): Position => {
  positions.push(position);

  return position;
};

const createPosition = (positions: Position[], draft: OrderDraft): Position =>
  pushPosition(positions, { ticker: draft.quote.ticker, qty: 0, avgPrice: draft.quote.price });

const findOrCreate = (userId: string, draft: OrderDraft): Position =>
  findIn(ensurePositions(userId), draft);

const findIn = (positions: Position[], draft: OrderDraft): Position =>
  positions.find((position) => position.ticker === draft.quote.ticker) ?? createPosition(positions, draft);

const bookBuy = (position: Position, draft: OrderDraft): Position =>
  Object.assign(position, {
    avgPrice: round2((position.qty * position.avgPrice + draft.amount) / (position.qty + draft.qty)),
    qty: position.qty + draft.qty,
  });

const bookSell = (position: Position, draft: OrderDraft): Position =>
  Object.assign(position, { qty: position.qty - draft.qty });

const applyPosition = (userId: string, draft: OrderDraft): Position => {
  const position = findOrCreate(userId, draft);

  return draft.side === "buy" ? bookBuy(position, draft) : bookSell(position, draft);
};

const prunePositions = (userId: string): Position[] => {
  store.positions[userId] = ensurePositions(userId).filter((position) => position.qty > 0);

  return store.positions[userId];
};

const cashDelta = (draft: OrderDraft): number =>
  draft.side === "buy" ? -round2(draft.amount + draft.fee) : round2(draft.amount - draft.fee);

const pushOperation = (operation: Operation): Operation => {
  store.operations.unshift(operation);

  return operation;
};

const recordOperation = (userId: string, draft: OrderDraft, amount: number): Operation =>
  pushOperation({
    id: id("op"),
    userId,
    at: new Date().toISOString(),
    kind: draft.side,
    ticker: draft.quote.ticker,
    qty: draft.qty,
    price: draft.quote.price,
    amount,
    status: "done",
  });

const finishOrder = (userId: string, draft: OrderDraft, position: Position) => {
  prunePositions(userId);

  return {
    operation: recordOperation(userId, draft, cashDelta(draft)),
    position: position.qty > 0 ? position : null,
    cash: cashOf(userId),
  };
};

const applyOrder = (userId: string, draft: OrderDraft) => {
  const position = applyPosition(userId, draft);

  return finishOrder(userId, draft, position);
};

const sideOf = (body: Record<string, unknown>): "buy" | "sell" =>
  strParam(body.side) === "sell" ? "sell" : "buy";

const draftOf = (quote: Quote, body: Record<string, unknown>): OrderDraft => {
  const qty = Math.round(Number(body.qty));

  return {
    quote,
    qty,
    side: sideOf(body),
    amount: round2(qty * quote.price),
    fee: round2(qty * quote.price * FEE_RATE),
  };
};

const qtyError = (draft: OrderDraft): string | null =>
  Number.isFinite(draft.qty) && draft.qty > 0 ? null : "Количество должно быть больше нуля";

const lotError = (draft: OrderDraft): string | null =>
  draft.qty % draft.quote.lot === 0 ? null : `Количество кратно лоту — ${draft.quote.lot} шт.`;

const fundsError = (userId: string, draft: OrderDraft): string | null =>
  draft.side === "buy" && draft.amount + draft.fee > cashOf(userId) ? "Недостаточно свободных средств" : null;

const holdingError = (userId: string, draft: OrderDraft): string | null => {
  const held = positionOf(userId, draft.quote.ticker)?.qty ?? 0;

  return draft.side === "sell" && held < draft.qty ? "Недостаточно бумаг в портфеле" : null;
};

const firstError = (checks: Array<string | null>): string | null =>
  checks.find((check) => check !== null) ?? null;

const executeDraft = (userId: string, draft: OrderDraft) => {
  const error = firstError([
    qtyError(draft),
    lotError(draft),
    fundsError(userId, draft),
    holdingError(userId, draft),
  ]);

  return error ? { ok: false as const, error } : { ok: true as const, result: applyOrder(userId, draft) };
};

const placeOrder = (userId: string, body: Record<string, unknown>) => {
  const quote = quoteOf(strParam(body.ticker));

  return quote
    ? executeDraft(userId, draftOf(quote, body))
    : { ok: false as const, error: "Инструмент не найден" };
};

const amountRaw = (value: unknown): string =>
  typeof value === "number" ? String(value) : strParam(value);

const depositOperation = (userId: string, amount: number): Operation => ({
  id: id("op"),
  userId,
  at: new Date().toISOString(),
  kind: "deposit",
  ticker: null,
  qty: null,
  price: null,
  amount,
  status: "done",
});

const createDeposit = (userId: string, amount: number) => ({
  ok: true as const,
  operation: pushOperation(depositOperation(userId, amount)),
  cash: cashOf(userId),
});

const depositOf = (userId: string, body: Record<string, unknown>) => {
  const checked = validateAmount(amountRaw(body.amount));

  return checked.ok ? createDeposit(userId, Number(checked.value)) : { ok: false as const, error: checked.error };
};

const renameChecked = (user: User | null, checked: Validation): User | null =>
  user && checked.ok ? Object.assign(user, { name: checked.value }) : null;

const updateProfile = (userId: string, body: Record<string, unknown>): User | null =>
  renameChecked(userOf(userId), validateName(strParam(body.name)));

await app.register(cors, { origin: true });

app.get("/api/health", async () => ({ ok: true, service: "cabinet" }));

app.post("/api/auth/login", async (request, reply) => {
  const [email, password] = credentialsOf(request.body);

  return (await loginUser(email, password)) ?? reply.code(401).send({ error: "Неверный e-mail или пароль" });
});

app.get("/api/me", authed(async (payload) => userOf(payload.sub)));

app.get("/api/quotes", async () => quotesOf());

app.get("/api/dashboard", authed(async (payload) => dashboardOf(payload.sub)));

app.get(
  "/api/operations",
  authed(async (payload, request) => {
    const query = asRecord(request.query);

    return operationsOf(
      payload.sub,
      strParam(query.kind) || "all",
      strParam(query.cursor) || null,
      intParam(query.limit, 8),
    );
  }),
);

app.get("/api/notifications", authed(async (payload) => notificationsOf(payload.sub)));

app.post("/api/notifications/:id/read", authed(async (payload, request) => {
  const params = request.params as { id: string };

  return { ok: markRead(payload.sub, params.id) };
}));

app.post("/api/orders", authed(async (payload, request, reply) => {
  const result = placeOrder(payload.sub, asRecord(request.body));

  return result.ok ? result.result : reply.code(400).send({ error: result.error });
}));

app.post("/api/deposit", authed(async (payload, request, reply) => {
  const result = depositOf(payload.sub, asRecord(request.body));

  return result.ok ? result : reply.code(400).send({ error: result.error });
}));

app.patch("/api/profile", authed(async (payload, request, reply) => {
  const user = updateProfile(payload.sub, asRecord(request.body));

  return user ?? reply.code(400).send({ error: "Имя слишком короткое" });
}));

await app.listen({ port: PORT, host: HOST });
console.info(`[cabinet] API http://${HOST}:${PORT}`);
