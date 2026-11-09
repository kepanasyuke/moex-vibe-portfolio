import type { FastifyReply } from "fastify";

export const badRequest = (reply: FastifyReply, message: string) =>
  reply.code(400).send({ error: message });

export const unauthorized = (reply: FastifyReply) =>
  reply.code(401).send({ error: "Требуется авторизация" });

export const forbidden = (reply: FastifyReply) =>
  reply.code(403).send({ error: "Недостаточно прав" });

export const notFound = (reply: FastifyReply, message = "Не найдено") =>
  reply.code(404).send({ error: message });

export const conflict = (reply: FastifyReply, message: string) =>
  reply.code(409).send({ error: message });

export const intParam = (value: unknown, fallback: number): number => {
  const parsed = Number.parseInt(String(value ?? ""), 10);

  return Number.isFinite(parsed) ? parsed : fallback;
};

export const strParam = (value: unknown): string =>
  typeof value === "string" ? value : "";

export const asRecord = (value: unknown): Record<string, unknown> =>
  typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {};
