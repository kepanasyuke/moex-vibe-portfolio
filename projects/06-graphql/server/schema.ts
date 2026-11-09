import { createSchema } from "graphql-yoga";
import { decodeCursor, encodeCursor, paginate } from "@contracts";
import type { Quote } from "@contracts";
import type { Store } from "@kit";

export interface InstrumentArgs {
  sector?: string | null;
  search?: string | null;
  sort?: string | null;
  first?: number | null;
  after?: string | null;
}

const SORTERS: Record<string, (left: Quote, right: Quote) => number> = {
  ticker: (left, right) => left.ticker.localeCompare(right.ticker),
  price: (left, right) => right.price - left.price,
  change: (left, right) => right.changePct - left.changePct,
};

const matchSector = (quote: Quote, sector?: string | null): boolean =>
  !sector || sector === "all" || quote.sector === sector;

const matchSearch = (quote: Quote, search?: string | null): boolean =>
  !search || `${quote.ticker} ${quote.name}`.toLowerCase().includes(search.trim().toLowerCase());

const filteredOf = (quotes: Quote[], args: InstrumentArgs): Quote[] => {
  const filtered = quotes.filter((quote) => matchSector(quote, args.sector) && matchSearch(quote, args.search));

  return filtered.sort(SORTERS[args.sort ?? "ticker"] ?? SORTERS.ticker);
};

const sizeOf = (args: InstrumentArgs): number => Math.min(Math.max(args.first ?? 8, 1), 50);

const edgesOf = (total: number, page: ReturnType<typeof paginate<Quote>>, after: string | null) => ({
  totalCount: total,
  edges: page.items.map((node, index) => ({ cursor: encodeCursor(decodeCursor(after) + index), node })),
  pageInfo: { endCursor: page.nextCursor, hasNextPage: Boolean(page.nextCursor) },
});

const pageOf = (filtered: Quote[], args: InstrumentArgs) =>
  edgesOf(filtered.length, paginate(filtered, sizeOf(args), args.after ?? null), args.after ?? null);

const connectionOf = (quotes: Quote[], args: InstrumentArgs) => {
  const filtered = filteredOf(quotes, args);

  return pageOf(filtered, args);
};

export const schema = createSchema<{ store: Store }>({
  typeDefs: /* GraphQL */ `
    type Instrument {
      ticker: ID!
      name: String!
      sector: String!
      price: Float!
      prevClose: Float!
      changePct: Float!
      lot: Int!
      updatedAt: String!
    }

    type InstrumentEdge {
      cursor: String!
      node: Instrument!
    }

    type PageInfo {
      endCursor: String
      hasNextPage: Boolean!
    }

    type InstrumentConnection {
      totalCount: Int!
      edges: [InstrumentEdge!]!
      pageInfo: PageInfo!
    }

    type Query {
      instruments(sector: String, search: String, sort: String, first: Int, after: String): InstrumentConnection!
      instrument(ticker: String!): Instrument
      sectors: [String!]!
      serverTime: String!
    }
  `,
  resolvers: {
    Query: {
      instruments: (_parent: unknown, args: InstrumentArgs, context: { store: Store }) =>
        connectionOf(context.store.quotes, args),
      instrument: (_parent: unknown, args: { ticker: string }, context: { store: Store }) =>
        context.store.quotes.find((quote) => quote.ticker === args.ticker) ?? null,
      sectors: (_parent: unknown, _args: unknown, context: { store: Store }) =>
        [...new Set(context.store.quotes.map((quote) => quote.sector))].sort(),
      serverTime: () => new Date().toISOString(),
    },
  },
});
