import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import type { IncomingMessage, ServerResponse } from "node:http";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { contact as validateContact, name as validateName } from "@contracts";
import type { Validation } from "@contracts";
import { asRecord, createStore, id, strParam } from "@kit";
import { createServer as createViteServer } from "vite";

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PORT = Number(process.env.PORT ?? 5105);
const HOST = process.env.HOST ?? "127.0.0.1";
const PROD = process.env.NODE_ENV === "production" || existsSync(path.join(PROJECT_ROOT, "dist/server/entry-server.js"));

const store = createStore();
const vite = PROD
  ? null
  : await createViteServer({ root: PROJECT_ROOT, server: { middlewareMode: true }, appType: "custom" });

const send = (response: ServerResponse, status: number, type: string, body: unknown) =>
  response.writeHead(status, { "content-type": type }).end(body);

const json = (response: ServerResponse, status: number, payload: unknown) =>
  send(response, status, "application/json; charset=utf-8", JSON.stringify(payload));

const mimeOf = (file: string): string =>
  file.endsWith(".js")
    ? "text/javascript; charset=utf-8"
    : file.endsWith(".css")
      ? "text/css; charset=utf-8"
      : file.endsWith(".svg")
        ? "image/svg+xml"
        : file.endsWith(".woff2")
          ? "font/woff2"
          : "application/octet-stream";

const assetPath = (url: string): string =>
  path.join(PROJECT_ROOT, "dist/client", url === "/" ? "index.html" : url);

/* eslint-disable max-statements, moex/single-exit */
const parseBody = (raw: string): unknown => {
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
};
/* eslint-enable max-statements, moex/single-exit */

const collect = (request: IncomingMessage, resolve: (value: unknown) => void, chunks: Buffer[]): void => {
  request.on("data", (chunk: Buffer) => chunks.push(chunk));
  request.on("end", () => resolve(parseBody(Buffer.concat(chunks).toString("utf8"))));
};

const readBody = (request: IncomingMessage): Promise<unknown> =>
  new Promise((resolve) => {
    const chunks: Buffer[] = [];

    collect(request, resolve, chunks);
  });

const errorOf = (nameCheck: Validation, contactCheck: Validation): string =>
  nameCheck.ok ? (contactCheck.ok ? "" : contactCheck.error) : nameCheck.error;

const checked = (body: Record<string, unknown>) => ({
  name: validateName(strParam(body.name)),
  contact: validateContact(strParam(body.contact)),
  company: strParam(body.company),
});

const storeLead = (name: string, contact: string, company: string, response: ServerResponse) => {
  store.leads.push({ id: id("lead"), name, contact, company, createdAt: new Date().toISOString() });

  return json(response, 201, { ok: true });
};

const saveLead = (body: Record<string, unknown>, response: ServerResponse) => {
  const { name, contact, company } = checked(body);

  return name.ok && contact.ok
    ? storeLead(name.value, contact.value, company, response)
    : json(response, 400, { error: errorOf(name, contact) });
};

const createLead = async (request: IncomingMessage, response: ServerResponse) => {
  const body = asRecord(await readBody(request));

  return saveLead(body, response);
};

const handleApi = (request: IncomingMessage, response: ServerResponse) =>
  request.method === "POST" ? createLead(request, response) : json(response, 200, { count: store.leads.length });

const loadTemplate = () =>
  readFile(path.join(PROJECT_ROOT, PROD ? "dist/client/index.html" : "index.html"), "utf8");

const loadEntry = async (): Promise<{ render: (url: string) => string }> =>
  vite
    ? (vite.ssrLoadModule("/src/entry-server.tsx") as Promise<{ render: (url: string) => string }>)
    : import(pathToFileURL(path.join(PROJECT_ROOT, "dist/server/entry-server.js")).href);

const renderPage = async (response: ServerResponse, url: string) => {
  const [template, entry] = await Promise.all([loadTemplate(), loadEntry()]);

  return send(response, 200, "text/html; charset=utf-8", template.replace("<!--app-html-->", entry.render(url)));
};

const serveAsset = async (response: ServerResponse, url: string) => {
  const data = await readFile(assetPath(url)).catch(() => null);

  return data ? send(response, 200, mimeOf(url), data) : false;
};

const handleStatic = (request: IncomingMessage, response: ServerResponse) => {
  const url = request.url?.split("?")[0] ?? "/";

  return url.includes(".")
    ? serveAsset(response, url).then((served) => served || renderPage(response, url))
    : renderPage(response, url);
};

const handlePage = (request: IncomingMessage, response: ServerResponse) => {
  const url = request.url ?? "/";

  return vite ? vite.middlewares(request, response, () => renderPage(response, url)) : handleStatic(request, response);
};

const onRequest = (request: IncomingMessage, response: ServerResponse) =>
  request.url?.startsWith("/api/") ? handleApi(request, response) : handlePage(request, response);

const app = createServer((request, response) => {
  Promise.resolve(onRequest(request, response)).catch(() => json(response, 500, { error: "Внутренняя ошибка" }));
});

app.listen(PORT, HOST, () => console.info(`[landing] SSR http://${HOST}:${PORT}`));
