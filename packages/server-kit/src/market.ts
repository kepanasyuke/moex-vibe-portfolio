import { pctChange, round2 } from "@contracts";
import type { OrderBook, Quote } from "@contracts";

const advance = (state: { value: number }): number =>
  (state.value = (state.value + 0x6d2b79f5) >>> 0);

const mix = (value: number): number => {
  const t = Math.imul(value ^ (value >>> 15), 1 | value);

  return (((t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t) >>> 0) / 4_294_967_296;
};

export const mulberry32 = (seed: number): (() => number) => {
  const state = { value: seed >>> 0 };

  return () => mix(advance(state));
};

const jitter = (random: () => number, base: number): number =>
  Math.max(0.01, base * (1 + (random() - 0.5) * 0.0035));

const quoteAt = (quote: Quote, price: number, at: string): Quote => ({
  ...quote,
  price,
  changePct: round2(pctChange(price, quote.prevClose)),
  updatedAt: at,
});

export const tickQuotes = (quotes: Quote[], random: () => number): Quote[] => {
  const at = new Date().toISOString();

  return quotes.map((quote) => quoteAt(quote, round2(jitter(random, quote.price)), at));
};

const level = (quote: Quote, random: () => number, side: 1 | -1) => (index: number) => ({
  price: round2(quote.price + side * 0.05 * (index + 1)),
  qty: Math.max(1, Math.round((random() * 900 + 40) / quote.lot) * quote.lot),
});

const sideFactory = (quote: Quote, random: () => number, depth: number) => (direction: 1 | -1) =>
  Array.from({ length: depth }, (_, index) => level(quote, random, direction)(index));

export const orderBook = (quote: Quote, random: () => number): OrderBook => {
  const side = sideFactory(quote, random, 8);

  return { ticker: quote.ticker, bids: side(-1), asks: side(1), updatedAt: new Date().toISOString() };
};
