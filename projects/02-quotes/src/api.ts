import type { OrderBook } from "@contracts";

export const fetchOrderBook = (ticker: string): Promise<OrderBook> =>
  fetch(`/api/orderbook/${encodeURIComponent(ticker)}`).then((response) =>
    response.ok ? (response.json() as Promise<OrderBook>) : Promise.reject(new Error("Стакан недоступен")),
  );
