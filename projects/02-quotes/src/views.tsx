import type { Quote } from "@contracts";
import { formatMoneyPrecise, formatQty, formatSignedPercent } from "@contracts";
import { Icon, Logo, Sparkline, Spinner, cx, useClock } from "@ui";
import { useOrderBook, useTerminal } from "./hooks.ts";
import type { TapeEntry } from "./hooks.ts";

const timeOf = (iso: string): string =>
  iso ? new Date(iso).toLocaleTimeString("ru-RU", { hour12: false }) : "—";

const StatusBadge = ({ status }: { status: "connecting" | "online" | "offline" }) => {
  const clock = useClock(1000);

  return (
    <div className="terminal__status">
      <span className={cx("dot", `dot--${status}`)} />
      <span>{status === "online" ? "Онлайн" : status === "connecting" ? "Подключение" : "Переподключение"}</span>
      <span className="terminal__clock numeric">{timeOf(clock)}</span>
    </div>
  );
};

const InstrumentList = ({
  quotes,
  active,
  onSelect,
}: {
  quotes: Quote[];
  active: string;
  onSelect: (ticker: string) => void;
}) => (
  <aside className="terminal__instruments">
    <div className="terminal__panel-title">
      <Icon name="activity" size={14} />
      Инструменты
    </div>
    <div className="terminal__instruments-list">
      {quotes.map((quote) => (
        <button
          key={quote.ticker}
          type="button"
          className={cx("instrument", quote.ticker === active && "instrument--active")}
          onClick={() => onSelect(quote.ticker)}
        >
          <span className="instrument__ticker">{quote.ticker}</span>
          <span className="instrument__name">{quote.name}</span>
          <span className="instrument__price numeric">{formatMoneyPrecise(quote.price)}</span>
          <span className={cx("instrument__change", quote.changePct >= 0 ? "text-up" : "text-down")}>
            {formatSignedPercent(quote.changePct)}
          </span>
        </button>
      ))}
    </div>
  </aside>
);

const quoteOf = (quotes: Quote[], ticker: string): Quote | undefined =>
  quotes.find((quote) => quote.ticker === ticker);

const QuotePanel = ({
  quotes,
  ticker,
  history,
  at,
}: {
  quotes: Quote[];
  ticker: string;
  history: number[];
  at: string;
}) => {
  const quote = quoteOf(quotes, ticker);

  return quote ? (
    <section className="quote">
      <div className="quote__head">
        <div>
          <div className="eyebrow">{quote.sector}</div>
          <h1 className="quote__name">
            {quote.name} <span className="quote__ticker">{quote.ticker}</span>
          </h1>
        </div>
        <div className="quote__price-block">
          <div className="quote__price numeric">{formatMoneyPrecise(quote.price)}</div>
          <span className={cx("quote__change numeric", quote.changePct >= 0 ? "text-up" : "text-down")}>
            {formatSignedPercent(quote.changePct)} за сессию
          </span>
        </div>
      </div>
      <div className="quote__meta">
        <span className="muted">закрытие {formatMoneyPrecise(quote.prevClose)}</span>
        <span className="muted">обновлено {timeOf(at)}</span>
      </div>
      <Sparkline
        points={history.length > 1 ? history : [quote.prevClose, quote.price]}
        tone={quote.changePct >= 0 ? "up" : "down"}
        height={220}
        label={`График ${quote.ticker}`}
      />
      <div className="quote__stats">
        <div>
          <span className="terminal__label">Лот</span>
          <span className="numeric">{formatQty(quote.lot)}</span>
        </div>
        <div>
          <span className="terminal__label">Максимум</span>
          <span className="numeric text-up">{formatMoneyPrecise(Math.max(...(history.length ? history : [quote.price])))}</span>
        </div>
        <div>
          <span className="terminal__label">Минимум</span>
          <span className="numeric text-down">{formatMoneyPrecise(Math.min(...(history.length ? history : [quote.price])))}</span>
        </div>
      </div>
    </section>
  ) : (
    <div className="terminal__loading">
      <Spinner />
    </div>
  );
};

const maxQty = (levels: Array<{ qty: number }>): number =>
  Math.max(...levels.map((level) => level.qty), 1);

const BookSide = ({
  levels,
  side,
  max,
}: {
  levels: Array<{ price: number; qty: number }>;
  side: "bid" | "ask";
  max: number;
}) => (
  <div className="book__side">
    {levels.map((level) => (
      <div key={level.price} className={cx("book__row", `book__row--${side}`)}>
        <span className="book__bar" style={{ width: `${(level.qty / max) * 100}%` }} />
        <span className={cx("book__price numeric", side === "bid" ? "text-up" : "text-down")}>
          {formatMoneyPrecise(level.price)}
        </span>
        <span className="book__qty numeric">{formatQty(level.qty)}</span>
      </div>
    ))}
  </div>
);

const OrderBookPanel = ({ ticker }: { ticker: string }) => {
  const book = useOrderBook(ticker);

  return (
    <section className="book">
      <div className="terminal__panel-title">
        <Icon name="chart" size={14} />
        Стакан · {ticker}
      </div>
      {book ? (
        <div className="book__grid">
          <div className="book__head">
            <span>Цена</span>
            <span>Объём</span>
          </div>
          <BookSide levels={[...book.asks].reverse()} side="ask" max={maxQty(book.asks)} />
          <div className="book__spread numeric">
            спред {formatMoneyPrecise(Math.max(...book.asks.map((level) => level.price)) - Math.max(...book.bids.map((level) => level.price)))}
          </div>
          <BookSide levels={book.bids} side="bid" max={maxQty(book.bids)} />
        </div>
      ) : (
        <div className="terminal__loading">
          <Spinner />
        </div>
      )}
    </section>
  );
};

const Tape = ({ entries }: { entries: TapeEntry[] }) => (
  <aside className="tape">
    <div className="terminal__panel-title">
      <Icon name="history" size={14} />
      Лента сделок
    </div>
    {entries.length === 0 && <p className="muted">Ожидание сделок…</p>}
    {[...entries].reverse().map((entry, index) => (
      <div key={`${entry.at}-${index}`} className="tape__row">
        <span className="muted numeric">{timeOf(entry.at)}</span>
        <span className={cx("numeric", entry.side === "buy" ? "text-up" : "text-down")}>
          {formatMoneyPrecise(entry.price)}
        </span>
        <span className={cx("tape__side", entry.side === "buy" ? "text-up" : "text-down")}>
          {entry.side === "buy" ? "B" : "S"}
        </span>
      </div>
    ))}
  </aside>
);

export const Terminal = () => {
  const view = useTerminal();

  return (
    <div className="terminal">
      <header className="terminal__top">
        <span className="terminal__brand">
          <Logo compact inverse />
          <span className="terminal__divider" />
          <span className="terminal__title">Терминал котировок</span>
        </span>
        <span className="terminal__hint">поток в реальном времени</span>
        <span className="grow" />
        <StatusBadge status={view.feed.status} />
      </header>
      <div className="terminal__body">
        <InstrumentList quotes={view.feed.quotes} active={view.selected.tab} onSelect={view.selected.setTab} />
        <main className="terminal__main">
          <QuotePanel
            quotes={view.feed.quotes}
            ticker={view.selected.tab}
            history={view.feed.history[view.selected.tab] ?? []}
            at={view.feed.at}
          />
          <OrderBookPanel ticker={view.selected.tab} />
        </main>
        <Tape entries={view.feed.tape[view.selected.tab] ?? []} />
      </div>
    </div>
  );
};
