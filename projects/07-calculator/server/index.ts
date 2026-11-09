import { app } from "./app.ts";

const PORT = Number(process.env.PORT ?? 4107);
const HOST = process.env.HOST ?? "127.0.0.1";

await app.listen({ port: PORT, host: HOST });
console.info(`[calculator] API http://${HOST}:${PORT}`);
