import cors from "@fastify/cors";
import Fastify from "fastify";
import { COLORS, COMPONENTS, RADIUS, RULES, SPACING, TYPOGRAPHY } from "./tokens.ts";

const PORT = Number(process.env.PORT ?? 4108);
const HOST = process.env.HOST ?? "127.0.0.1";

const app = Fastify({ logger: false });

const tokensOf = () => ({ colors: COLORS, typography: TYPOGRAPHY, spacing: SPACING, radius: RADIUS });

await app.register(cors, { origin: true });

app.get("/api/health", async () => ({ ok: true, service: "design-system" }));

app.get("/api/tokens", async () => tokensOf());

app.get("/api/components", async () => COMPONENTS);

app.get("/api/rules", async () => RULES);

await app.listen({ port: PORT, host: HOST });
console.info(`[design-system] API http://${HOST}:${PORT}`);
