import cors from "@fastify/cors";
import Fastify from "fastify";
import type { FastifyReply } from "fastify";
import { paginate } from "@contracts";
import type { AuditEntry, User } from "@contracts";
import {
  adminOnly,
  asRecord,
  createStore,
  findByEmail,
  id,
  signToken,
  strParam,
  verifyPassword,
} from "@kit";

const PORT = Number(process.env.PORT ?? 4104);
const HOST = process.env.HOST ?? "127.0.0.1";

const store = createStore();
const app = Fastify({ logger: false });

const loginUser = async (email: string, password: string) => {
  const user = findByEmail(store, email);

  return user && verifyPassword(password, store.passwords[user.email] ?? "")
    ? { token: await signToken(user), user }
    : null;
};

const registerEntry = (entry: AuditEntry): AuditEntry => {
  store.audit.unshift(entry);

  return entry;
};

const audit = (actorId: string, action: string, target: string): AuditEntry =>
  registerEntry({ id: id("audit"), at: new Date().toISOString(), actorId, action, target });

const publicUser = (user: User) => ({
  ...user,
  operations: store.operations.filter((operation) => operation.userId === user.id).length,
  payments: store.payments.filter((payment) => payment.userId === user.id).length,
  notifications: store.notifications.filter((item) => item.userId === user.id).length,
});

const usersOf = () => store.users.map(publicUser);

const applyRole = (target: User, roleRaw: string, actorId: string): AuditEntry => {
  target.role = roleRaw === "admin" ? "admin" : "investor";

  return audit(actorId, "role.changed", `${target.email} → ${target.role}`);
};

const changeRole = (actorId: string, userId: string, roleRaw: string): AuditEntry | null => {
  const target = store.users.find((user) => user.id === userId);

  return target && target.id !== actorId ? applyRole(target, roleRaw, actorId) : null;
};

const applyStatus = (target: User, statusRaw: string, actorId: string): AuditEntry => {
  target.status = statusRaw === "blocked" ? "blocked" : "active";

  return audit(actorId, target.status === "blocked" ? "user.blocked" : "user.activated", target.email);
};

const changeStatus = (actorId: string, userId: string, statusRaw: string): AuditEntry | null => {
  const target = store.users.find((user) => user.id === userId);

  return target && target.id !== actorId ? applyStatus(target, statusRaw, actorId) : null;
};

const notify = (user: User, title: string, body: string): number =>
  store.notifications.push({
    id: id("n"),
    userId: user.id,
    title,
    body,
    createdAt: new Date().toISOString(),
    read: false,
  });

const recipientsOf = (audience: string): User[] =>
  store.users.filter((user) =>
    audience === "all" ? true : audience === "investors" ? user.role === "investor" : user.id === audience,
  );

const sendAll = (recipients: User[], payload: { title: string; body: string; actorId: string }): AuditEntry => {
  recipients.forEach((user) => notify(user, payload.title, payload.body));

  return audit(payload.actorId, "notification.sent", `Получателей: ${recipients.length}`);
};

const broadcast = (actorId: string, title: string, body: string, audience: string): AuditEntry =>
  sendAll(recipientsOf(audience), { title, body, actorId });

const statsOf = () => ({
  users: store.users.length,
  admins: store.users.filter((user) => user.role === "admin").length,
  blocked: store.users.filter((user) => user.status === "blocked").length,
  notifications: store.notifications.length,
  audit: store.audit.length,
  depositVolume: store.payments
    .filter((payment) => payment.kind === "deposit" && payment.status === "settled")
    .reduce((acc, payment) => acc + payment.amount, 0),
});

await app.register(cors, { origin: true });

app.get("/api/health", async () => ({ ok: true, service: "admin" }));

app.post("/api/auth/login", async (request, reply) => {
  const data = asRecord(request.body);

  return (await loginUser(strParam(data.email), strParam(data.password))) ?? reply.code(401).send({
    error: "Неверный e-mail или пароль",
  });
});

app.get("/api/users", adminOnly(async () => usersOf()));

app.get("/api/stats", adminOnly(async () => statsOf()));

app.get(
  "/api/audit",
  adminOnly(async (_payload, request) =>
    paginate(store.audit, 8, strParam(asRecord(request.query).cursor) || null),
  ),
);

app.patch(
  "/api/users/:id/role",
  adminOnly(async (payload, request, reply) =>
    changeRole(payload.sub, strParam(asRecord(request.params).id), strParam(asRecord(request.body).role)) ??
    reply.code(400).send({ error: "Нельзя изменить роль этого пользователя" }),
  ),
);

app.patch(
  "/api/users/:id/status",
  adminOnly(async (payload, request, reply) =>
    changeStatus(payload.sub, strParam(asRecord(request.params).id), strParam(asRecord(request.body).status)) ??
    reply.code(400).send({ error: "Нельзя заблокировать этого пользователя" }),
  ),
);

const broadcastOrError = (
  actorId: string,
  body: Record<string, unknown>,
  reply: FastifyReply,
) =>
  strParam(body.title) && strParam(body.body)
    ? broadcast(actorId, strParam(body.title), strParam(body.body), strParam(body.audience) || "all")
    : reply.code(400).send({ error: "Заполните заголовок и текст" });

app.post(
  "/api/broadcast",
  adminOnly(async (payload, request, reply) => broadcastOrError(payload.sub, asRecord(request.body), reply)),
);

await app.listen({ port: PORT, host: HOST });
console.info(`[admin] API http://${HOST}:${PORT}`);
