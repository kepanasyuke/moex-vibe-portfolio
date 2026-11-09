import type { Instrument, InstrumentsPage } from "./api.ts";
import { formatMoneyPrecise, formatQty, formatSignedPercent } from "@contracts";
import {
  Button,
  Card,
  Input,
  Logo,
  Segmented,
  Spinner,
  Stat,
  Table,
  Tabs,
  type Column,
} from "@ui";
import { INSTRUMENTS_QUERY } from "./api.ts";
import { useGraphqlScreen } from "./hooks.ts";
import type { FilterState } from "./hooks.ts";

const COLUMNS: Array<Column<Instrument>> = [
  {
    key: "ticker",
    title: "Тикер",
    render: (row) => (
      <div>
        <div style={{ fontWeight: 800 }}>{row.ticker}</div>
        <div className="muted" style={{ fontSize: 12 }}>
          {row.name}
        </div>
      </div>
    ),
  },
  { key: "sector", title: "Сектор", render: (row) => <span className="muted">{row.sector}</span> },
  { key: "price", title: "Цена", align: "right", render: (row) => formatMoneyPrecise(row.price) },
  {
    key: "change",
    title: "Изменение",
    align: "right",
    render: (row) => (
      <span className={row.changePct >= 0 ? "text-up" : "text-down"}>{formatSignedPercent(row.changePct)}</span>
    ),
  },
  { key: "lot", title: "Лот", align: "right", render: (row) => formatQty(row.lot) },
];

const SORT_OPTIONS = [
  { value: "ticker", label: "По тикеру" },
  { value: "price", label: "По цене" },
  { value: "change", label: "По изменению" },
];

const FiltersBar = ({
  filters,
  sectors,
  onReset,
}: {
  filters: ReturnType<typeof useGraphqlScreen>["view"]["filters"];
  sectors: string[];
  onReset: () => void;
}) => (
  <Card>
    <div className="gql-filters">
      <Input
        id="search"
        placeholder="Поиск по тикеру или названию"
        value={filters.state.search}
        onChange={(event) => filters.setSearch(event.target.value)}
      />
      <Tabs
        items={[{ value: "all", label: "Все сектора" }, ...sectors.map((sector) => ({ value: sector, label: sector }))]}
        value={filters.state.sector}
        onChange={filters.setSector}
      />
      <div className="gql-filters__row">
        <Segmented options={SORT_OPTIONS} value={filters.state.sort} onChange={filters.setSort} />
        <Button variant="quiet" size="sm" onClick={onReset}>
          Сбросить
        </Button>
      </div>
    </div>
  </Card>
);

const QueryPreview = ({ state }: { state: FilterState }) => (
  <Card title="Запрос GraphQL">
    <pre className="gql-code">{INSTRUMENTS_QUERY.trim()}</pre>
    <div className="gql-vars">
      <span className="eyebrow">Переменные</span>
      <pre className="gql-code">{JSON.stringify({ sector: state.sector, sort: state.sort }, null, 2)}</pre>
    </div>
  </Card>
);

export const GraphqlApp = () => {
  const screen = useGraphqlScreen();

  return <GraphqlView screen={screen} />;
};

const GraphqlView = ({ screen }: { screen: ReturnType<typeof useGraphqlScreen> }) => (
  <GraphqlBody view={screen.view} meta={screen.meta} page={screen.view.feed.page.data?.instruments} />
);

const GraphqlBody = ({
  view,
  meta,
  page,
}: {
  view: ReturnType<typeof useGraphqlScreen>["view"];
  meta: ReturnType<typeof useGraphqlScreen>["meta"];
  page: InstrumentsPage | undefined;
}) => (
    <div className="gql">
      <header className="gql__top">
        <Logo compact inverse />
        <span className="gql__title">GraphQL-витрина</span>
        <span className="gql__endpoint mono">POST /graphql</span>
        <span className="grow" />
        <span className="gql__time mono">
          {meta.data ? new Date(meta.data.serverTime).toLocaleTimeString("ru-RU", { hour12: false }) : "—"}
        </span>
      </header>
      <main className="container gql__body">
        <div className="gql__intro">
          <div>
            <span className="eyebrow">Витрина инструментов</span>
            <h1 className="display display-md">Один запрос — все фильтры</h1>
            <p className="muted">
              Курсорная пагинация, поиск и сортировка на стороне GraphQL-сервера. Данные обновляются при каждом
              изменении параметров.
            </p>
          </div>
          <div className="gql__stats">
            <Stat label="Инструментов" value={page?.totalCount ?? "—"} hint="В текущей выборке" />
            <Stat label="Секторов" value={meta.data?.sectors.length ?? "—"} hint="Отрасли рынка" />
          </div>
        </div>

        <div className="gql__layout">
          <div className="gql__main">
            <FiltersBar
              filters={view.filters}
              sectors={meta.data?.sectors ?? []}
              onReset={view.filters.reset}
            />
            <div style={{ marginTop: 16 }}>
              <Card flush>
                {view.feed.page.status === "loading" && !page ? (
                  <div className="gql__loading">
                    <Spinner />
                  </div>
                ) : (
                  <Table
                    columns={COLUMNS}
                    rows={page?.edges.map((edge) => edge.node) ?? []}
                    rowKey={(row) => row.ticker}
                    empty={<div className="gql__empty">Ничего не найдено</div>}
                  />
                )}
                <div className="gql__pager">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={!view.filters.state.cursor}
                    onClick={() => view.filters.setCursor(null)}
                  >
                    В начало
                  </Button>
                  <span className="muted">{page?.totalCount ?? 0} записей</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={!page?.pageInfo.hasNextPage}
                    onClick={() => view.filters.setCursor(page?.pageInfo.endCursor ?? null)}
                  >
                    Дальше
                  </Button>
                </div>
              </Card>
            </div>
          </div>
          <aside className="gql__side">
            <QueryPreview state={view.filters.state} />
          </aside>
        </div>
      </main>
    </div>
);
