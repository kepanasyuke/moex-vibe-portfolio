import type { ReactNode } from "react";
import { formatDate, formatDateTime, formatMoney, formatMoneyPrecise, formatPercent, formatQty, formatSignedPercent, round2 } from "@contracts";
import type { Operation, OperationKind, Quote, User } from "@contracts";
import {
  Alert,
  AppShell,
  Badge,
  Button,
  Card,
  EmptyState,
  Input,
  KV,
  Logo,
  PageHeader,
  ProgressBar,
  Segmented,
  Select,
  Skeleton,
  Sparkline,
  StepMark,
  Stat,
  Table,
  Tabs,
  type AsyncState,
  type Column,
  type NavItem,
  useTabs,
} from "@ui";
import {
  useDashboard,
  useLoginForm,
  useNotificationsView,
  useOperationsView,
  useOverviewView,
  useProfileScreen,
  useTradingScreen,
} from "./hooks.ts";
import type { useSession } from "./hooks.ts";
import type { Dashboard, NotificationItem, PositionRow } from "./types.ts";

type Section = "overview" | "trading" | "positions" | "operations" | "notifications" | "profile";
type SessionState = ReturnType<typeof useSession>;

const NAV: NavItem[] = [
  { key: "overview", label: "Обзор", hint: "Сводка", icon: "gauge" },
  { key: "trading", label: "Торговля", hint: "Сделки", icon: "exchange" },
  { key: "positions", label: "Портфель", icon: "pie" },
  { key: "operations", label: "Операции", icon: "history" },
  { key: "notifications", label: "Уведомления", icon: "bell" },
  { key: "profile", label: "Профиль", icon: "user" },
];

const KIND_OPTIONS = [
  { value: "all", label: "Все" },
  { value: "buy", label: "Покупки" },
  { value: "sell", label: "Продажи" },
  { value: "deposit", label: "Пополнения" },
  { value: "withdraw", label: "Выводы" },
  { value: "dividend", label: "Дивиденды" },
  { value: "fee", label: "Комиссии" },
];

const KIND_LABEL: Record<OperationKind, string> = {
  buy: "Покупка",
  sell: "Продажа",
  deposit: "Пополнение",
  withdraw: "Вывод",
  dividend: "Дивиденды",
  fee: "Комиссия",
};

const STATUS = {
  done: { label: "Исполнена", tone: "green" as const },
  pending: { label: "В обработке", tone: "warn" as const },
  rejected: { label: "Отклонена", tone: "down" as const },
};

export const AsyncBlock = <T,>({
  state,
  children,
}: {
  state: AsyncState<T>;
  children: (data: T) => ReactNode;
}) =>
  state.status === "error" ? (
    <Alert tone="warn" title="Не удалось загрузить данные">
      {state.error}
    </Alert>
  ) : state.status === "loading" || !state.data ? (
    <div className="stack">
      <Skeleton height={96} />
      <Skeleton height={180} />
      <Skeleton height={120} />
    </div>
  ) : (
    <>{children(state.data)}</>
  );

export const LoginScreen = ({ session }: { session: SessionState }) => {
  const form = useLoginForm(session.signIn);

  return (
    <div className="login">
      <aside className="login__aside">
        <Logo inverse />
        <div className="login__claim display display-lg">Инвестиции начинаются здесь</div>
        <StepMark className="login__mark" />
        <p className="login__note">
          Демо-кабинет инвестора: портфель, история операций и уведомления. Все данные учебные.
        </p>
      </aside>
      <section className="login__panel">
        <Card title="Вход в кабинет">
          <form className="stack" onSubmit={form.submit}>
            <Input
              id="email"
              label="E-mail"
              type="email"
              autoComplete="username"
              value={form.email}
              onChange={(event) => form.setEmail(event.target.value)}
              required
            />
            <Input
              id="password"
              label="Пароль"
              type="password"
              autoComplete="current-password"
              value={form.password}
              onChange={(event) => form.setPassword(event.target.value)}
              required
            />
            {session.error && (
              <Alert tone="warn" title="Не удалось войти">
                {session.error}
              </Alert>
            )}
            <Button type="submit" size="lg" block>
              Войти
            </Button>
          </form>
          <div className="login__demo">
            <span className="eyebrow">Демо-доступ</span>
            <button type="button" className="login__demo-link" onClick={() => form.quick("ivan.petrov@moex.dev", "Demo12345")}>
              Инвестор · ivan.petrov@moex.dev
            </button>
            <button type="button" className="login__demo-link" onClick={() => form.quick("anna.smirnova@moex.dev", "Demo12345")}>
              Инвестор · anna.smirnova@moex.dev
            </button>
            <button type="button" className="login__demo-link" onClick={() => form.quick("admin@moex.dev", "Admin12345")}>
              Администратор · admin@moex.dev
            </button>
          </div>
        </Card>
      </section>
    </div>
  );
};

export const Workspace = ({
  session,
  onLogout,
  onUser,
}: {
  session: NonNullable<SessionState["session"]>;
  onLogout: () => void;
  onUser: (user: User) => void;
}) => {
  const nav = useTabs<Section>("overview");

  return (
    <AppShell
      product="Кабинет инвестора"
      nav={NAV}
      active={nav.tab}
      onSelect={(key) => nav.setTab(key as Section)}
      user={session.user}
      onLogout={onLogout}
    >
      {nav.tab === "overview" && <Overview token={session.token} />}
      {nav.tab === "trading" && <Trading token={session.token} />}
      {nav.tab === "positions" && <Positions token={session.token} />}
      {nav.tab === "operations" && <Operations token={session.token} />}
      {nav.tab === "notifications" && <Notifications token={session.token} />}
      {nav.tab === "profile" && <Profile token={session.token} user={session.user} onUser={onUser} />}
    </AppShell>
  );
};

const quoteOf = (quotes: Quote[], ticker: string): Quote | null =>
  quotes.find((quote) => quote.ticker === ticker) ?? null;

const amountOf = (quote: Quote | null, qty: number): number =>
  quote ? round2(qty * quote.price) : 0;

const feeOf = (amount: number): number => round2(amount * 0.003);

const calcOf = (quote: Quote | null, side: "buy" | "sell", qty: number) => {
  const amount = amountOf(quote, qty);

  return {
    amount,
    fee: feeOf(amount),
    total: side === "buy" ? round2(amount + feeOf(amount)) : round2(amount - feeOf(amount)),
  };
};

const heldOf = (positions: PositionRow[], ticker: string): number =>
  positions.find((position) => position.ticker === ticker)?.qty ?? 0;

const tradeViewOf = (data: Dashboard, form: { ticker: string; side: "buy" | "sell"; qty: string }) => ({
  quote: quoteOf(data.quotes, form.ticker),
  calc: calcOf(quoteOf(data.quotes, form.ticker), form.side, Number(form.qty)),
  held: heldOf(data.positions, form.ticker),
});

const Trading = ({ token }: { token: string }) => {
  const screen = useTradingScreen(token);

  return (
    <AsyncBlock state={screen.dashboard}>
      {(data) => <TradingBody screen={screen} data={data} />}
    </AsyncBlock>
  );
};

const TradingBody = ({ screen, data }: { screen: ReturnType<typeof useTradingScreen>; data: Dashboard }) => {
  const view = tradeViewOf(data, screen.trade.form);

  return (
    <>
      <PageHeader
        eyebrow="Торговля"
        title="Новая сделка"
        subtitle="Комиссия 0,3 % от объёма, исполнение по текущей цене"
      />
      <div className="grid-2">
        <Card title="Заявка">
          <form className="stack" onSubmit={screen.trade.submit}>
            <Select
              id="ticker"
              label="Инструмент"
              options={data.quotes.map((quote) => ({ value: quote.ticker, label: `${quote.ticker} · ${quote.name}` }))}
              value={screen.trade.form.ticker}
              onChange={(event) => screen.trade.patch({ ticker: event.target.value })}
            />
            <Segmented
              options={[
                { value: "buy", label: "Купить" },
                { value: "sell", label: "Продать" },
              ]}
              value={screen.trade.form.side}
              onChange={(side) => screen.trade.patch({ side: side as "buy" | "sell" })}
            />
            <Input
              id="qty"
              label="Количество, шт."
              inputMode="numeric"
              value={screen.trade.form.qty}
              onChange={(event) => screen.trade.patch({ qty: event.target.value })}
              hint={
                view.quote
                  ? `Лот ${formatQty(view.quote.lot)} · в портфеле ${formatQty(view.held)}`
                  : "Инструмент не выбран"
              }
            />
            <div>
              <KV k="Цена" v={view.quote ? formatMoneyPrecise(view.quote.price) : "—"} />
              <KV k="Объём" v={formatMoney(view.calc.amount)} />
              <KV k="Комиссия" v={formatMoney(view.calc.fee)} />
              <KV
                k={screen.trade.form.side === "buy" ? "Спишется" : "Зачислится"}
                v={formatMoney(view.calc.total)}
              />
            </div>
            {screen.trade.error && (
              <Alert tone="warn" title="Заявка отклонена">
                {screen.trade.error}
              </Alert>
            )}
            {screen.trade.notice && (
              <Alert tone="success" title={screen.trade.notice}>
                Позиция и история операций обновлены.
              </Alert>
            )}
            <Button type="submit" size="lg">
              {screen.trade.form.side === "buy" ? "Купить" : "Продать"}
            </Button>
          </form>
        </Card>
        <div className="stack">
          <Card title="Счёт">
            <Stat
              label="Свободные средства"
              value={formatMoney(data.cash)}
              hint={`Капитал ${formatMoney(data.equity)}`}
            />
            <KV k="Стоимость бумаг" v={formatMoney(data.totals.value)} />
            <KV k="Прибыль по позициям" v={formatMoney(data.totals.pnl)} />
          </Card>
          <Card title="Пополнение">
            <form className="stack" onSubmit={screen.deposit.submit}>
              <Input
                id="deposit"
                label="Сумма, ₽"
                inputMode="numeric"
                value={screen.deposit.amount}
                onChange={(event) => screen.deposit.patch(event.target.value)}
                hint="Без комиссии, зачисление мгновенно"
              />
              <div className="row">
                {[5000, 10_000, 50_000].map((value) => (
                  <Button
                    key={value}
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => screen.deposit.patch(String(value))}
                  >
                    {formatMoney(value)}
                  </Button>
                ))}
              </div>
              {screen.deposit.error && (
                <Alert tone="warn" title="Пополнение не выполнено">
                  {screen.deposit.error}
                </Alert>
              )}
              {screen.deposit.notice && (
                <Alert tone="success" title={screen.deposit.notice}>
                  Средства доступны для сделок.
                </Alert>
              )}
              <Button type="submit" variant="dark">
                Пополнить
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </>
  );
};

const Profile = ({
  token,
  user,
  onUser,
}: {
  token: string;
  user: User;
  onUser: (user: User) => void;
}) => {
  const screen = useProfileScreen(token, user, onUser);

  return (
    <>
      <PageHeader eyebrow="Профиль" title={user.name} subtitle="Данные учётной записи" />
      <div className="grid-2">
        <Card title="Личные данные">
          <form className="stack" onSubmit={screen.submit}>
            <Input
              id="name"
              label="Имя"
              value={screen.name}
              onChange={(event) => screen.patch(event.target.value)}
            />
            <Input
              id="email"
              label="E-mail"
              value={user.email}
              readOnly
              hint="E-mail меняется через поддержку"
            />
            <div className="row">
              <Badge tone={user.role === "admin" ? "black" : "red"}>
                {user.role === "admin" ? "Администратор" : "Инвестор"}
              </Badge>
              <Badge tone="green">Активен</Badge>
            </div>
            {screen.feedback?.tone === "ok" && <Alert tone="success" title={screen.feedback.text} />}
            {screen.feedback?.tone === "error" && (
              <Alert tone="warn" title="Не сохранено">
                {screen.feedback.text}
              </Alert>
            )}
            <Button type="submit">Сохранить</Button>
          </form>
        </Card>
        <Card title="Учётная запись">
          <KV k="ID" v={<span className="mono">{user.id}</span>} />
          <KV k="Роль" v={user.role === "admin" ? "Администратор" : "Инвестор"} />
          <KV k="Статус" v="Активен" />
          <KV k="С нами с" v={formatDate(user.createdAt)} />
        </Card>
      </div>
    </>
  );
};

const periodValues = (history: { value: number }[], days: string) =>
  history.map((point) => point.value).slice(days === "7" ? -7 : 0);

const spreadLabel = (values: number[]) =>
  `${formatMoney(Math.min(...values))} — ${formatMoney(Math.max(...values))}`;

const Overview = ({ token }: { token: string }) => {
  const view = useOverviewView(token);

  return (
    <AsyncBlock state={view.dashboard}>
      {(data) => (
        <>
          <PageHeader
            eyebrow="Кабинет"
            title="Обзор портфеля"
            subtitle={`Данные на ${formatDateTime(data.updatedAt)}`}
            actions={
              <div className="row">
                <Tabs
                  items={[
                    { value: "7", label: "7 дней" },
                    { value: "30", label: "30 дней" },
                  ]}
                  value={view.period.tab}
                  onChange={view.period.setTab}
                />
                <Button variant="ghost" size="sm" onClick={view.dashboard.reload}>
                  Обновить
                </Button>
              </div>
            }
          />
          <Card flush>
            <div className="stats">
              <Stat label="Капитал" value={formatMoney(data.equity)} hint="Бумаги и свободные средства" />
              <Stat label="Свободные средства" value={formatMoney(data.cash)} hint="Доступны для сделок" />
              <Stat
                label="Прибыль"
                value={formatMoney(data.totals.pnl)}
                tone={data.totals.pnl >= 0 ? "up" : "down"}
                hint={formatSignedPercent(data.totals.pnlPct)}
              />
              <Stat
                label="За день"
                value={formatMoney(data.totals.dayPnl)}
                tone={data.totals.dayPnl >= 0 ? "up" : "down"}
                hint="К закрытию прошлой сессии"
              />
            </div>
          </Card>
          <div className="grid-2" style={{ marginTop: 20 }}>
            <Card
              title="Динамика стоимости"
              action={
                <Badge tone={data.totals.pnl >= 0 ? "green" : "down"}>{formatSignedPercent(data.totals.pnlPct)}</Badge>
              }
            >
              <Sparkline
                points={periodValues(data.history, view.period.tab)}
                tone={data.totals.pnl >= 0 ? "up" : "down"}
                height={210}
                label={`Динамика стоимости портфеля за ${view.period.tab} дней`}
              />
              <div className="row-between" style={{ marginTop: 12 }}>
                <span className="muted">Диапазон за {view.period.tab} дней</span>
                <span className="numeric">{spreadLabel(periodValues(data.history, view.period.tab))}</span>
              </div>
            </Card>
            <Card title="Структура портфеля">
              <div className="bars">
                {data.allocation.map((item) => (
                  <ProgressBar key={item.ticker} label={item.ticker} value={item.share} suffix={formatPercent(item.share)} />
                ))}
              </div>
              <div className="row-between bar__total">
                <span className="muted">Итого</span>
                <span className="numeric">
                  {formatMoney(data.allocation.reduce((sum, item) => sum + item.value, 0))}
                </span>
              </div>
            </Card>
          </div>
          <div style={{ marginTop: 20 }}>
            <Card title="Позиции" flush>
              <PositionsTable rows={data.positions} />
            </Card>
          </div>
        </>
      )}
    </AsyncBlock>
  );
};

const Positions = ({ token }: { token: string }) => {
  const dashboard = useDashboard(token);

  return (
    <AsyncBlock state={dashboard}>
      {(data) => (
        <>
          <PageHeader
            eyebrow="Портфель"
            title="Мои позиции"
            subtitle={`${data.positions.length} инструментов · ${formatMoney(data.totals.value)}`}
          />
          <div className="grid-2">
            <Card title="Позиции" flush>
              <PositionsTable rows={data.positions} />
            </Card>
            <Card title="Распределение">
              <div className="bars">
                {data.allocation.map((item) => (
                  <ProgressBar key={item.ticker} label={item.ticker} value={item.share} suffix={formatMoney(item.value)} />
                ))}
              </div>
            </Card>
          </div>
        </>
      )}
    </AsyncBlock>
  );
};

const POSITION_COLUMNS: Array<Column<PositionRow>> = [
  {
    key: "ticker",
    title: "Инструмент",
    render: (row) => (
      <div>
        <div style={{ fontWeight: 700 }}>{row.ticker}</div>
        <div className="muted" style={{ fontSize: 12 }}>
          {row.name}
        </div>
      </div>
    ),
  },
  { key: "qty", title: "Кол-во", align: "right", render: (row) => formatQty(row.qty) },
  { key: "avg", title: "Средняя", align: "right", render: (row) => formatMoneyPrecise(row.avgPrice) },
  { key: "price", title: "Цена", align: "right", render: (row) => formatMoneyPrecise(row.price) },
  { key: "value", title: "Стоимость", align: "right", render: (row) => formatMoney(row.value) },
  {
    key: "pnl",
    title: "P&L",
    align: "right",
    render: (row) => <span className={row.pnl >= 0 ? "text-up" : "text-down"}>{formatMoney(row.pnl)}</span>,
  },
];

const PositionsTable = ({ rows }: { rows: PositionRow[] }) => (
  <Table columns={POSITION_COLUMNS} rows={rows} rowKey={(row) => row.ticker} />
);

const OPERATION_COLUMNS: Array<Column<Operation>> = [
  { key: "at", title: "Дата", render: (row) => formatDate(row.at) },
  {
    key: "kind",
    title: "Операция",
    render: (row) => (
      <div>
        <div style={{ fontWeight: 600 }}>{KIND_LABEL[row.kind]}</div>
        {row.ticker && (
          <div className="muted" style={{ fontSize: 12 }}>
            {row.ticker}
            {row.qty ? ` · ${formatQty(row.qty)} шт.` : ""}
          </div>
        )}
      </div>
    ),
  },
  {
    key: "amount",
    title: "Сумма",
    align: "right",
    render: (row) => (
      <span className={row.amount >= 0 ? "text-up" : "text-down"}>{formatMoney(Math.abs(row.amount))}</span>
    ),
  },
  {
    key: "status",
    title: "Статус",
    render: (row) => <Badge tone={STATUS[row.status].tone}>{STATUS[row.status].label}</Badge>,
  },
];

const OperationsView = ({ view }: { view: ReturnType<typeof useOperationsView> }) => (
  <>
    <PageHeader eyebrow="История" title="Операции" subtitle="Сделки, пополнения, дивиденды и комиссии" />
    <div className="row-between" style={{ marginBottom: 16 }}>
      <Tabs items={KIND_OPTIONS} value={view.kind} onChange={view.setKind} />
      <span className="muted">{view.data.data?.total ?? 0} записей</span>
    </div>
    <Card flush>
      <Table
        columns={OPERATION_COLUMNS}
        rows={view.data.data?.items ?? []}
        rowKey={(row) => row.id}
        empty={<EmptyState title="Операций нет" text="Измените фильтр или совершите первую сделку." />}
      />
    </Card>
    <div className="row-between" style={{ marginTop: 16 }}>
      <Button variant="ghost" size="sm" disabled={!view.cursor} onClick={() => view.setCursor(null)}>
        В начало
      </Button>
      <Button
        variant="ghost"
        size="sm"
        disabled={!view.data.data?.nextCursor}
        onClick={() => view.setCursor(view.data.data?.nextCursor ?? null)}
      >
        Дальше
      </Button>
    </div>
  </>
);

const Operations = ({ token }: { token: string }) => {
  const view = useOperationsView(token);

  return <AsyncBlock state={view.data}>{() => <OperationsView view={view} />}</AsyncBlock>;
};

const NotificationCard = ({ item, onRead }: { item: NotificationItem; onRead: () => void }) => (
  <Card
    title={item.title}
    action={!item.read ? <Badge tone="red">Новое</Badge> : <Badge tone="gray">Прочитано</Badge>}
  >
    <p className="muted">{item.body}</p>
    <div className="row-between" style={{ marginTop: 12 }}>
      <span className="muted" style={{ fontSize: 12 }}>
        {formatDateTime(item.createdAt)}
      </span>
      {!item.read && (
        <Button size="sm" variant="ghost" onClick={onRead}>
          Отметить прочитанным
        </Button>
      )}
    </div>
  </Card>
);

const NotificationsView = ({ list, markRead }: { list: NotificationItem[]; markRead: (id: string) => void }) => (
  <>
    <PageHeader eyebrow="Сервис" title="Уведомления" subtitle="События по счёту и сообщения биржи" />
    <div className="stack">
      {list.map((item) => (
        <NotificationCard key={item.id} item={item} onRead={() => markRead(item.id)} />
      ))}
    </div>
  </>
);

const Notifications = ({ token }: { token: string }) => {
  const view = useNotificationsView(token);

  return (
    <AsyncBlock state={view.list}>
      {(items) => <NotificationsView list={items} markRead={view.markRead} />}
    </AsyncBlock>
  );
};
