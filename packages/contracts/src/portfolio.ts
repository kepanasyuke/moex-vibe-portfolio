import { round2 } from "./format.ts";
import type { Position, Quote } from "./types.ts";

export interface PortfolioTotals {
  value: number;
  cost: number;
  pnl: number;
  pnlPct: number;
  dayPnl: number;
}

const sumBy = <T>(items: T[], pick: (item: T) => number): number =>
  items.reduce((acc, item) => acc + pick(item), 0);

const priceOf = (quotes: Quote[], ticker: string): number =>
  quotes.find((quote) => quote.ticker === ticker)?.price ?? 0;

const prevOf = (quotes: Quote[], ticker: string): number =>
  quotes.find((quote) => quote.ticker === ticker)?.prevClose ?? 0;

export const positionValue = (position: Position, quotes: Quote[]): number =>
  position.qty * priceOf(quotes, position.ticker);

export const positionCost = (position: Position): number =>
  position.qty * position.avgPrice;

export const positionPnl = (position: Position, quotes: Quote[]): number =>
  positionValue(position, quotes) - positionCost(position);

export const positionDayPnl = (position: Position, quotes: Quote[]): number =>
  position.qty * (priceOf(quotes, position.ticker) - prevOf(quotes, position.ticker));

const totalsOf = (value: number, cost: number, dayPnl: number): PortfolioTotals => ({
  value: round2(value),
  cost: round2(cost),
  pnl: round2(value - cost),
  pnlPct: cost === 0 ? 0 : round2(((value - cost) / cost) * 100),
  dayPnl: round2(dayPnl),
});

export const portfolioTotals = (
  positions: Position[],
  quotes: Quote[],
): PortfolioTotals =>
  totalsOf(
    sumBy(positions, (position) => positionValue(position, quotes)),
    sumBy(positions, positionCost),
    sumBy(positions, (position) => positionDayPnl(position, quotes)),
  );

export const allocation = (
  positions: Position[],
  quotes: Quote[],
): Array<{ ticker: string; share: number; value: number }> => {
  const total = sumBy(positions, (position) => positionValue(position, quotes));

  return positions
    .map((position) => ({
      ticker: position.ticker,
      value: round2(positionValue(position, quotes)),
      share: total === 0 ? 0 : round2((positionValue(position, quotes) / total) * 100),
    }))
    .sort((left, right) => right.value - left.value);
};
