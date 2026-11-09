import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import type { FastifyReply, FastifyRequest } from "fastify";
import { SignJWT, jwtVerify } from "jose";
import type { Role, User } from "@contracts";

const SECRET = new TextEncoder().encode(process.env.AUTH_SECRET ?? "moex-vibe-demo-secret");

export interface TokenPayload {
  sub: string;
  role: Role;
  email: string;
  name: string;
}

export const hashPassword = (password: string): string => {
  const salt = randomBytes(16).toString("hex");

  return `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
};

export const verifyPassword = (password: string, stored: string): boolean => {
  const [salt, hash] = stored.split(":");

  return timingSafeEqual(Buffer.from(hash ?? "", "hex"), scryptSync(password, salt ?? "", 64));
};

export const signToken = (user: User): Promise<string> =>
  new SignJWT({ sub: user.id, role: user.role, email: user.email, name: user.name })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(SECRET);

export const verifyToken = async (token: string): Promise<TokenPayload | null> => {
  const result = await jwtVerify(token, SECRET).catch(() => null);

  return result ? (result.payload as unknown as TokenPayload) : null;
};

export const bearer = (request: FastifyRequest): string | null =>
  request.headers.authorization?.replace(/^Bearer\s+/i, "") ?? null;

export const authenticate = async (request: FastifyRequest): Promise<TokenPayload | null> =>
  verifyToken(bearer(request) ?? "");

type Handler<T> = (payload: TokenPayload, request: FastifyRequest, reply: FastifyReply) => Promise<T | FastifyReply>;

export const authed = <T>(
  handler: Handler<T>,
): ((request: FastifyRequest, reply: FastifyReply) => Promise<T | FastifyReply>) =>
  async (request: FastifyRequest, reply: FastifyReply) => {
    const payload = await authenticate(request);

    return payload ? handler(payload, request, reply) : reply.code(401).send({ error: "Требуется авторизация" });
  };

export const adminOnly = <T>(handler: Handler<T>) =>
  authed<T>(async (payload, request, reply) =>
    payload.role === "admin" ? handler(payload, request, reply) : reply.code(403).send({ error: "Недостаточно прав" }),
  );
