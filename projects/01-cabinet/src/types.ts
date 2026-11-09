import type { Operation, Position, Quote, User } from "@contracts";

export interface Session {
  token: string;
  user: User;
}

export interface PositionRow extends Position {
  name: string;
  price: number;
  changePct: number;
  value: number;
  pnl: number;
}

export interface Dashboard {
  totals: {
    value: number;
    cost: number;
    pnl: number;
    pnlPct: number;
    dayPnl: number;
  };
  cash: number;
  equity: number;
  quotes: Quote[];
  positions: PositionRow[];
  allocation: Array<{ ticker: string; share: number; value: number }>;
  history: Array<{ date: string; value: number }>;
  unread: number;
  updatedAt: string;
}

export interface OperationsPage {
  items: Operation[];
  total: number;
  nextCursor: string | null;
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
}
