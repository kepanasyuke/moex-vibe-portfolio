import { randomUUID } from "node:crypto";
import type {
  AuditEntry,
  Instrument,
  Lead,
  Notification,
  Operation,
  Payment,
  Position,
  Quote,
  User,
} from "@contracts";
import { pctChange } from "@contracts";
import { hashPassword } from "./auth.ts";

export interface Store {
  users: User[];
  passwords: Record<string, string>;
  instruments: Instrument[];
  quotes: Quote[];
  positions: Record<string, Position[]>;
  operations: Operation[];
  payments: Payment[];
  notifications: Notification[];
  audit: AuditEntry[];
  leads: Lead[];
}

const day = 86_400_000;

const daysAgo = (days: number): string => new Date(Date.now() - days * day).toISOString();

const INSTRUMENTS: Instrument[] = [
  { ticker: "GAZP", name: "Газпром", sector: "Нефть и газ", price: 128.4, prevClose: 126.1, lot: 10 },
  { ticker: "SBER", name: "Сбербанк", sector: "Банки", price: 312.5, prevClose: 308.2, lot: 10 },
  { ticker: "LKOH", name: "Лукойл", sector: "Нефть и газ", price: 6440, prevClose: 6390, lot: 1 },
  { ticker: "YDEX", name: "Яндекс", sector: "Технологии", price: 4210, prevClose: 4300, lot: 1 },
  { ticker: "T", name: "Т-Технологии", sector: "Банки", price: 285.6, prevClose: 281, lot: 1 },
  { ticker: "GMKN", name: "Норникель", sector: "Металлы", price: 152.3, prevClose: 154.8, lot: 10 },
  { ticker: "MOEX", name: "Московская биржа", sector: "Финансы", price: 182.4, prevClose: 180.2, lot: 10 },
  { ticker: "AFLT", name: "Аэрофлот", sector: "Транспорт", price: 62.8, prevClose: 61.9, lot: 10 },
  { ticker: "ROSN", name: "Роснефть", sector: "Нефть и газ", price: 585.5, prevClose: 590.1, lot: 1 },
  { ticker: "VTBR", name: "ВТБ", sector: "Банки", price: 102.4, prevClose: 101.2, lot: 1 },
  { ticker: "PLZL", name: "Полюс", sector: "Металлы", price: 13_240, prevClose: 13_100, lot: 1 },
  { ticker: "MGNT", name: "Магнит", sector: "Ритейл", price: 4980, prevClose: 5020, lot: 1 },
];

const toQuote = (instrument: Instrument, at: string): Quote => ({
  ...instrument,
  changePct: Number(pctChange(instrument.price, instrument.prevClose).toFixed(2)),
  updatedAt: at,
});

const USERS: User[] = [
  {
    id: "u-ivan",
    email: "ivan.petrov@moex.dev",
    name: "Иван Петров",
    role: "investor",
    status: "active",
    createdAt: daysAgo(420),
  },
  {
    id: "u-anna",
    email: "anna.smirnova@moex.dev",
    name: "Анна Смирнова",
    role: "investor",
    status: "active",
    createdAt: daysAgo(180),
  },
  {
    id: "u-admin",
    email: "admin@moex.dev",
    name: "Мария Орлова",
    role: "admin",
    status: "active",
    createdAt: daysAgo(900),
  },
];

const PASSWORDS: Record<string, string> = {
  "ivan.petrov@moex.dev": "Demo12345",
  "anna.smirnova@moex.dev": "Demo12345",
  "admin@moex.dev": "Admin12345",
};

const OPERATIONS: Operation[] = [
  { id: "op-1", userId: "u-ivan", at: daysAgo(2), kind: "buy", ticker: "GAZP", qty: 40, price: 124.8, amount: 4992, status: "done" },
  { id: "op-2", userId: "u-ivan", at: daysAgo(6), kind: "dividend", ticker: "SBER", qty: null, price: null, amount: 1240, status: "done" },
  { id: "op-3", userId: "u-ivan", at: daysAgo(9), kind: "buy", ticker: "SBER", qty: 20, price: 305.4, amount: 6108, status: "done" },
  { id: "op-4", userId: "u-ivan", at: daysAgo(14), kind: "sell", ticker: "AFLT", qty: 100, price: 64.1, amount: 6410, status: "done" },
  { id: "op-5", userId: "u-ivan", at: daysAgo(18), kind: "deposit", ticker: null, qty: null, price: null, amount: 50_000, status: "done" },
  { id: "op-6", userId: "u-ivan", at: daysAgo(21), kind: "fee", ticker: null, qty: null, price: null, amount: -12.4, status: "done" },
  { id: "op-7", userId: "u-ivan", at: daysAgo(27), kind: "buy", ticker: "LKOH", qty: 3, price: 6120, amount: 18_360, status: "done" },
  { id: "op-8", userId: "u-ivan", at: daysAgo(33), kind: "withdraw", ticker: null, qty: null, price: null, amount: 15_000, status: "done" },
  { id: "op-9", userId: "u-ivan", at: daysAgo(41), kind: "buy", ticker: "YDEX", qty: 2, price: 3980, amount: 7960, status: "done" },
  { id: "op-10", userId: "u-ivan", at: daysAgo(55), kind: "deposit", ticker: null, qty: null, price: null, amount: 100_000, status: "done" },
  { id: "op-11", userId: "u-anna", at: daysAgo(3), kind: "buy", ticker: "T", qty: 300, price: 272.5, amount: 81_750, status: "done" },
  { id: "op-12", userId: "u-anna", at: daysAgo(8), kind: "buy", ticker: "MOEX", qty: 50, price: 166.2, amount: 8310, status: "done" },
  { id: "op-13", userId: "u-anna", at: daysAgo(12), kind: "deposit", ticker: null, qty: null, price: null, amount: 120_000, status: "done" },
  { id: "op-14", userId: "u-anna", at: daysAgo(30), kind: "dividend", ticker: "MOEX", qty: null, price: null, amount: 920, status: "done" },
];

const PAYMENTS: Payment[] = [
  { id: "pay-1", userId: "u-ivan", kind: "deposit", amount: 50_000, fee: 0, method: "sbp", status: "settled", createdAt: daysAgo(19), idempotencyKey: "seed-1", cardMask: null, reason: null },
  { id: "pay-2", userId: "u-ivan", kind: "deposit", amount: 15_000, fee: 0, method: "card", status: "settled", createdAt: daysAgo(34), idempotencyKey: "seed-2", cardMask: "•••• 4242", reason: null },
  { id: "pay-3", userId: "u-anna", kind: "deposit", amount: 120_000, fee: 0, method: "account", status: "settled", createdAt: daysAgo(13), idempotencyKey: "seed-3", cardMask: null, reason: null },
  { id: "pay-4", userId: "u-ivan", kind: "withdraw", amount: 15_000, fee: 150, method: "account", status: "settled", createdAt: daysAgo(33), idempotencyKey: "seed-4", cardMask: null, reason: null },
  { id: "pay-5", userId: "u-anna", kind: "withdraw", amount: 20_000, fee: 200, method: "card", status: "rejected", createdAt: daysAgo(9), idempotencyKey: "seed-5", cardMask: "•••• 1188", reason: "Недостаточно средств" },
];

const NOTIFICATIONS: Notification[] = [
  {
    id: "n-1",
    userId: "u-ivan",
    title: "Дивиденды зачислены",
    body: "По акциям SBER начислено 1 240 ₽. Средства доступны для инвестиций.",
    createdAt: daysAgo(6),
    read: false,
  },
  {
    id: "n-2",
    userId: "u-ivan",
    title: "Изменение тарифов",
    body: "С 1 декабря комиссия за сделки на фондовом рынке — 0,03 %.",
    createdAt: daysAgo(11),
    read: true,
  },
  {
    id: "n-3",
    userId: "u-anna",
    title: "Добро пожаловать на биржу",
    body: "Ваш счёт открыт. Пройдите тест неквалифицированного инвестора, чтобы торговать сложными инструментами.",
    createdAt: daysAgo(30),
    read: false,
  },
];

const AUDIT: AuditEntry[] = [
  { id: "a-1", at: daysAgo(1), actorId: "u-admin", action: "role.changed", target: "u-anna → investor" },
  { id: "a-2", at: daysAgo(4), actorId: "u-admin", action: "notification.sent", target: "Все инвесторы" },
  { id: "a-3", at: daysAgo(7), actorId: "u-admin", action: "user.blocked", target: "spam@example.com" },
];

const LEADS: Lead[] = [
  { id: "l-1", name: "Сергей", contact: "+7 900 123-45-67", company: "Ромашка", createdAt: daysAgo(2) },
  { id: "l-2", name: "Ольга", contact: "olga@corp.ru", company: "Вектор", createdAt: daysAgo(5) },
];

const buildSeed = (): Store => {
  const at = new Date().toISOString();

  return {
    users: USERS,
    passwords: Object.fromEntries(
      Object.entries(PASSWORDS).map(([email, password]) => [email, hashPassword(password)]),
    ),
    instruments: INSTRUMENTS,
    quotes: INSTRUMENTS.map((instrument) => toQuote(instrument, at)),
    positions: {
      "u-ivan": [
        { ticker: "GAZP", qty: 120, avgPrice: 112.4 },
        { ticker: "SBER", qty: 40, avgPrice: 280.1 },
        { ticker: "LKOH", qty: 3, avgPrice: 6100 },
        { ticker: "YDEX", qty: 2, avgPrice: 3900 },
      ],
      "u-anna": [
        { ticker: "T", qty: 300, avgPrice: 272.5 },
        { ticker: "MOEX", qty: 50, avgPrice: 166.2 },
      ],
      "u-admin": [],
    },
    operations: OPERATIONS,
    payments: PAYMENTS,
    notifications: NOTIFICATIONS,
    audit: AUDIT,
    leads: LEADS,
  };
};

export const createStore = (): Store => structuredClone(buildSeed());

export const id = (prefix: string): string => `${prefix}-${randomUUID().slice(0, 8)}`;

export const findByEmail = (store: Store, email: string): User | undefined =>
  store.users.find((user) => user.email.toLowerCase() === email.toLowerCase());
