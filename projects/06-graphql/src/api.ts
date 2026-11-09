export interface Instrument {
  ticker: string;
  name: string;
  sector: string;
  price: number;
  prevClose: number;
  changePct: number;
  lot: number;
  updatedAt: string;
}

export interface InstrumentEdge {
  cursor: string;
  node: Instrument;
}

export interface InstrumentsPage {
  totalCount: number;
  edges: InstrumentEdge[];
  pageInfo: { endCursor: string | null; hasNextPage: boolean };
}

export interface InstrumentsQuery {
  sector: string;
  search: string;
  sort: string;
  after: string | null;
}

const INSTRUMENTS_QUERY = /* GraphQL */ `
  query Instruments($sector: String, $search: String, $sort: String, $after: String) {
    instruments(sector: $sector, search: $search, sort: $sort, first: 8, after: $after) {
      totalCount
      edges {
        cursor
        node {
          ticker
          name
          sector
          price
          prevClose
          changePct
          lot
          updatedAt
        }
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
`;

const SECTORS_QUERY = /* GraphQL */ `
  query Sectors {
    sectors
    serverTime
  }
`;

const readPayload = async <T,>(response: Response): Promise<T> => {
  const payload = (await response.json()) as { data?: T; errors?: Array<{ message: string }> };

  return payload.errors?.length ? Promise.reject(new Error(payload.errors[0]?.message)) : (payload.data as T);
};

const post = <T,>(query: string, variables: Record<string, unknown>): Promise<T> =>
  fetch("/graphql", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ query, variables }),
  }).then((response) => readPayload<T>(response));

export const api = {
  instruments: (query: InstrumentsQuery): Promise<{ instruments: InstrumentsPage }> =>
    post<{ instruments: InstrumentsPage }>(INSTRUMENTS_QUERY, {
      sector: query.sector,
      search: query.search,
      sort: query.sort,
      after: query.after,
    }),
  meta: (): Promise<{ sectors: string[]; serverTime: string }> =>
    post<{ sectors: string[]; serverTime: string }>(SECTORS_QUERY, {}),
};

export { INSTRUMENTS_QUERY };
