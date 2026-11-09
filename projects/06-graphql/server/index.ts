import { createServer } from "node:http";
import type { IncomingMessage, ServerResponse } from "node:http";
import { createYoga } from "graphql-yoga";
import { createStore } from "@kit";
import { schema } from "./schema.ts";

const PORT = Number(process.env.PORT ?? 4106);
const HOST = process.env.HOST ?? "127.0.0.1";

const store = createStore();

const yoga = createYoga({
  schema,
  graphqlEndpoint: "/graphql",
  cors: true,
  context: () => ({ store }),
});

const health = (response: ServerResponse) =>
  response.writeHead(200, { "content-type": "application/json" }).end(JSON.stringify({ ok: true, service: "graphql" }));

const healthHandler = (_request: IncomingMessage, response: ServerResponse) => health(response);

const server = createServer((request, response) =>
  (request.url === "/api/health" ? healthHandler : yoga)(request, response),
);

server.listen(PORT, HOST, () => console.info(`[graphql] http://${HOST}:${PORT}/graphql`));
