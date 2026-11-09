import { useEffect, useState } from "react";
import type { OrderBook, Quote } from "@contracts";
import { useTabs } from "@ui";
import { fetchOrderBook } from "./api.ts";

export interface TapeEntry {
  at: string;
  price: number;
  side: "buy" | "sell";
}

export interface FeedState {
  status: "connecting" | "online" | "offline";
  quotes: Quote[];
  history: Record<string, number[]>;
  tape: Record<string, TapeEntry[]>;
  at: string;
}

interface Control {
  socket: WebSocket | null;
  timer: number;
  closed: boolean;
}

const EMPTY: FeedState = { status: "connecting", quotes: [], history: {}, tape: {}, at: "" };

const WS_URL = `${window.location.protocol === "https:" ? "wss" : "ws"}://${window.location.host}/ws`;

const mergeHistory = (history: FeedState["history"], quotes: Quote[]): FeedState["history"] =>
  Object.fromEntries(
    quotes.map((quote) => [quote.ticker, [...(history[quote.ticker] ?? []), quote.price].slice(-80)]),
  );

const sideOf = (entries: TapeEntry[] | undefined, price: number): TapeEntry["side"] => {
  const previous = entries?.at(-1)?.price ?? price;

  return price >= previous ? "buy" : "sell";
};

const mergeTape = (
  tape: FeedState["tape"],
  quotes: Quote[],
  at: string,
): FeedState["tape"] =>
  Object.fromEntries(
    quotes.map((quote) => [
      quote.ticker,
      [
        ...(tape[quote.ticker] ?? []),
        { at, price: quote.price, side: sideOf(tape[quote.ticker], quote.price) },
      ].slice(-14),
    ]),
  );

const applyQuotes = (state: FeedState, quotes: Quote[], at: string): FeedState => ({
  ...state,
  status: "online",
  quotes,
  at,
  history: mergeHistory(state.history, quotes),
  tape: mergeTape(state.tape, quotes, at),
});

const connect = (set: React.Dispatch<React.SetStateAction<FeedState>>, control: Control) => {
  const socket = new WebSocket(WS_URL);

  wire(socket, set, control);
  control.socket = socket;
};

const wire = (
  socket: WebSocket,
  set: React.Dispatch<React.SetStateAction<FeedState>>,
  control: Control,
) => {
  socket.onopen = () => set((previous) => ({ ...previous, status: "online" }));
  socket.onclose = () => retry(set, control);
  socket.onmessage = (event) => {
    const message = JSON.parse(String(event.data)) as { at: string; quotes: Quote[] };

    set((previous) => applyQuotes(previous, message.quotes, message.at));
  };
};

const retry = (set: React.Dispatch<React.SetStateAction<FeedState>>, control: Control) => {
  set((previous) => ({ ...previous, status: "offline" }));

  if (!control.closed) {
    control.timer = window.setTimeout(() => connect(set, control), 1500);
  }
};

export const useFeed = () => {
  const [state, setState] = useState<FeedState>(EMPTY);

  useEffect(() => {
    const control: Control = { socket: null, timer: 0, closed: false };

    connect(setState, control);

    return () => {
      control.closed = true;
      control.socket?.close();
      window.clearTimeout(control.timer);
    };
  }, []);

  return state;
};

export const useTerminal = () => {
  const feed = useFeed();
  const selected = useTabs<string>("GAZP");

  return { feed, selected };
};

const loadBook = (ticker: string, set: (book: OrderBook) => void): void => {
  fetchOrderBook(ticker).then(set).catch(() => undefined);
};

export const useOrderBook = (ticker: string) => {
  const [book, setBook] = useState<OrderBook | null>(null);

  useEffect(() => {
    loadBook(ticker, setBook);
    const timer = window.setInterval(() => loadBook(ticker, setBook), 2400);

    return () => window.clearInterval(timer);
  }, [ticker]);

  return book;
};
