import { useState } from "react";
import { useAsync, useDebounced } from "@ui";
import { api } from "./api.ts";

export interface FilterState {
  sector: string;
  search: string;
  sort: string;
  cursor: string | null;
}

export const useInstrumentFilters = () => {
  const [state, setState] = useState<FilterState>({ sector: "all", search: "", sort: "ticker", cursor: null });

  return {
    state,
    setSector: (sector: string) => setState((previous) => ({ ...previous, sector, cursor: null })),
    setSearch: (search: string) => setState((previous) => ({ ...previous, search, cursor: null })),
    setSort: (sort: string) => setState((previous) => ({ ...previous, sort, cursor: null })),
    setCursor: (cursor: string | null) => setState((previous) => ({ ...previous, cursor })),
    reset: () => setState({ sector: "all", search: "", sort: "ticker", cursor: null }),
  };
};

export const useInstrumentsFeed = (state: FilterState) => {
  const search = useDebounced(state.search, 350);
  const page = useAsync(
    () => api.instruments({ sector: state.sector, search, sort: state.sort, after: state.cursor }),
    [state.sector, state.sort, state.cursor, search],
  );

  return { page };
};

export const useMeta = () => useAsync(() => api.meta(), []);

export const useInstrumentsView = () => {
  const filters = useInstrumentFilters();
  const feed = useInstrumentsFeed(filters.state);

  return { filters, feed };
};

export const useGraphqlScreen = () => {
  const view = useInstrumentsView();
  const meta = useMeta();

  return { view, meta };
};
