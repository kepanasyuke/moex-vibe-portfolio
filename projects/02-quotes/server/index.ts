import cors from "@fastify/cors";
import Fastify from "fastify";
import type { FastifyRequest } from "fastify";
import type { Quote } from "@contracts";
import { asRecord, attachMarketFeed, createStore, mulberry32, orderBook, strParam, tickQuotes } from "@kit";

const PORT = Number(process.env.PORT ?? 4102);
const HOST = process.env.HOST ?? "127.0.0.1";

const store = createStore();
const random = mulberry32(2026);
const app = Fastify({ logger: false });

const tick = (): Quote[] => (store.quotes = tickQuotes(store.quotes, random));

const bookOf = (ticker: string) => {
  const quote = store.quotes.find((item) => item.ticker === ticker);

  return quote ? orderBook(quote, random) : null;
};

const tickerOf = (request: FastifyRequest): string => strParam(asRecord(request.params).ticker);

await app.register(cors, { origin: true });

app.get("/api/health", async () => ({ ok: true, service: "quotes" }));

app.get("/api/instruments", async () => store.quotes);

app.get("/api/orderbook/:ticker", async (request, reply) =>
  bookOf(tickerOf(request)) ?? reply.code(404).send({ error: "Инструмент не найден" }),
);

attachMarketFeed(app.server, tick, 1100);

await app.listen({ port: PORT, host: HOST });
console.info(`[quotes] API + WS http://${HOST}:${PORT}`);
