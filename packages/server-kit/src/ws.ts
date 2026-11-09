import type { Server } from "node:http";
import { WebSocket, WebSocketServer } from "ws";
import type { Quote } from "@contracts";

const snapshot = (quotes: Quote[]): string =>
  JSON.stringify({ type: "snapshot", at: new Date().toISOString(), quotes });

const tick = (quotes: Quote[]): string =>
  JSON.stringify({ type: "tick", at: new Date().toISOString(), quotes });

const broadcast = (wss: WebSocketServer, payload: () => string): void =>
  wss.clients.forEach((client) => client.readyState === WebSocket.OPEN && client.send(payload()));

const schedule = (
  wss: WebSocketServer,
  source: () => Quote[],
  intervalMs: number,
): (() => void) => {
  const timer = setInterval(() => broadcast(wss, () => tick(source())), intervalMs);

  return () => {
    clearInterval(timer);
    wss.close();
  };
};

const startFeed = (
  wss: WebSocketServer,
  source: () => Quote[],
  intervalMs: number,
): (() => void) => {
  wss.on("connection", (socket) => socket.send(snapshot(source())));

  return schedule(wss, source, intervalMs);
};

export const attachMarketFeed = (
  server: Server,
  source: () => Quote[],
  intervalMs = 900,
): (() => void) => startFeed(new WebSocketServer({ server, path: "/ws" }), source, intervalMs);
