export type Role = "investor" | "admin";

export type UserStatus = "active" | "blocked";

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  status: UserStatus;
  createdAt: string;
}

export interface Instrument {
  ticker: string;
  name: string;
  sector: string;
  price: number;
  prevClose: number;
  lot: number;
}

export interface Quote extends Instrument {
  changePct: number;
  updatedAt: string;
}

export interface Position {
  ticker: string;
  qty: number;
  avgPrice: number;
}

export type OperationKind =
  | "buy"
  | "sell"
  | "deposit"
  | "withdraw"
  | "dividend"
  | "fee";

export type OperationStatus = "done" | "pending" | "rejected";

export interface Operation {
  id: string;
  userId: string;
  at: string;
  kind: OperationKind;
  ticker: string | null;
  qty: number | null;
  price: number | null;
  amount: number;
  status: OperationStatus;
}

export type PaymentMethod = "card" | "sbp" | "account";

export type PaymentStatus = "created" | "processing" | "settled" | "rejected";

export type PaymentKind = "deposit" | "withdraw";

export interface Payment {
  id: string;
  userId: string;
  kind: PaymentKind;
  amount: number;
  fee: number;
  method: PaymentMethod;
  status: PaymentStatus;
  createdAt: string;
  idempotencyKey: string;
  cardMask: string | null;
  reason: string | null;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
}

export interface AuditEntry {
  id: string;
  at: string;
  actorId: string;
  action: string;
  target: string;
}

export interface Lead {
  id: string;
  name: string;
  contact: string;
  company: string;
  createdAt: string;
}

export interface OrderBookLevel {
  price: number;
  qty: number;
}

export interface OrderBook {
  ticker: string;
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  updatedAt: string;
}
