import { useState } from "react";
import type { Payment, PaymentKind, PaymentMethod } from "@contracts";
import { formatDateTime, formatMoney } from "@contracts";
import {
  Alert,
  Badge,
  Button,
  Card,
  EmptyState,
  Input,
  Logo,
  Segmented,
  Spinner,
  Stat,
  Table,
  Tabs,
  type Column,
} from "@ui";
import type { Session } from "./api.ts";
import { useSession, useWalletScreen } from "./hooks.ts";

type ScreenState = ReturnType<typeof useSession>;

const KIND_LABEL: Record<PaymentKind, string> = { deposit: "Пополнение", withdraw: "Вывод" };
const METHOD_LABEL: Record<PaymentMethod, string> = { card: "Карта", sbp: "СБП", account: "Банковский счёт" };

const STATUS: Record<Payment["status"], { label: string; tone: "green" | "warn" | "down" | "gray" }> = {
  created: { label: "Создан", tone: "gray" },
  processing: { label: "В обработке", tone: "warn" },
  settled: { label: "Исполнен", tone: "green" },
  rejected: { label: "Отклонён", tone: "down" },
};

const LoginScreen = ({ session }: { session: ScreenState }) => {
  const [form, setForm] = useState({ email: "ivan.petrov@moex.dev", password: "Demo12345" });

  return (
    <div className="pay-login">
      <div className="pay-login__card">
        <Logo />
        <h1 className="display display-md">Платежи</h1>
        <p className="muted">Пополнение счёта, вывод средств и история операций.</p>
        <form
          className="stack"
          onSubmit={(event) => {
            event.preventDefault();
            session.signIn(form.email, form.password);
          }}
        >
          <Input
            id="email"
            label="E-mail"
            value={form.email}
            onChange={(event) => setForm((previous) => ({ ...previous, email: event.target.value }))}
          />
          <Input
            id="password"
            label="Пароль"
            type="password"
            value={form.password}
            onChange={(event) => setForm((previous) => ({ ...previous, password: event.target.value }))}
          />
          {session.error && (
            <Alert tone="warn" title="Не удалось войти">
              {session.error}
            </Alert>
          )}
          <Button type="submit" block size="lg">
            Войти
          </Button>
        </form>
        <p className="muted pay-login__hint">Демо: ivan.petrov@moex.dev / Demo12345</p>
      </div>
    </div>
  );
};

const StatusCell = ({ status }: { status: Payment["status"] }) => (
  <Badge tone={STATUS[status].tone}>{STATUS[status].label}</Badge>
);

const COLUMNS: Array<Column<Payment>> = [
  { key: "at", title: "Дата", render: (row) => formatDateTime(row.createdAt) },
  {
    key: "kind",
    title: "Тип",
    render: (row) => (
      <span className={row.kind === "deposit" ? "text-up" : "text-down"}>{KIND_LABEL[row.kind]}</span>
    ),
  },
  { key: "method", title: "Способ", render: (row) => METHOD_LABEL[row.method] },
  {
    key: "amount",
    title: "Сумма",
    align: "right",
    render: (row) => (
      <span className="numeric">
        {formatMoney(row.amount)}
        {row.fee > 0 && <span className="muted"> + {formatMoney(row.fee)}</span>}
      </span>
    ),
  },
  { key: "status", title: "Статус", render: (row) => <StatusCell status={row.status} /> },
];

const KIND_TABS = [
  { value: "all", label: "Все" },
  { value: "deposit", label: "Пополнения" },
  { value: "withdraw", label: "Выводы" },
];

const STATUS_TABS = [
  { value: "all", label: "Любой статус" },
  { value: "processing", label: "В обработке" },
  { value: "settled", label: "Исполнены" },
  { value: "rejected", label: "Отклонены" },
];

const History = ({ filters, page }: { filters: ReturnType<typeof useWalletScreen>["view"]["filters"]; page: ReturnType<typeof useWalletScreen>["view"]["feed"]["page"] }) => (
  <Card
    title="История операций"
    action={
      <span className="muted" style={{ fontSize: 13 }}>
        {page.data?.total ?? 0} записей
      </span>
    }
    flush
  >
    <div className="pay-history__filters">
      <Tabs items={KIND_TABS} value={filters.kind} onChange={filters.setKind} />
      <Tabs items={STATUS_TABS} value={filters.status} onChange={filters.setStatus} />
    </div>
    {page.status === "loading" && !page.data ? (
      <div className="pay-loading">
        <Spinner />
      </div>
    ) : (
      <Table
        columns={COLUMNS}
        rows={page.data?.items ?? []}
        rowKey={(row) => row.id}
        empty={<EmptyState title="Операций пока нет" text="Пополните счёт, чтобы начать инвестировать." />}
      />
    )}
    <div className="pay-history__pager">
      <Button variant="ghost" size="sm" disabled={!filters.cursor} onClick={() => filters.setCursor(null)}>
        В начало
      </Button>
      <Button
        variant="ghost"
        size="sm"
        disabled={!page.data?.nextCursor}
        onClick={() => filters.setCursor(page.data?.nextCursor ?? null)}
      >
        Дальше
      </Button>
    </div>
  </Card>
);

const PaymentForm = ({ form }: { form: ReturnType<typeof useWalletScreen>["form"] }) => (
  <Card title="Новая операция">
    <form className="stack" onSubmit={form.submit}>
      <Segmented
        options={[
          { value: "deposit", label: "Пополнить" },
          { value: "withdraw", label: "Вывести" },
        ]}
        value={form.draft.kind}
        onChange={(kind) => form.patch({ kind: kind as PaymentKind })}
      />
      <Input
        id="amount"
        label="Сумма, ₽"
        inputMode="numeric"
        value={form.draft.amount}
        onChange={(event) => form.patch({ amount: event.target.value })}
        hint={
          form.draft.kind === "withdraw"
            ? "Комиссия 1 %, минимум 30 ₽. Вывод на счёт в течение дня."
            : "Зачисление мгновенно, без комиссии."
        }
      />
      <div className="pay-quick">
        {[1000, 5000, 10_000, 50_000].map((value) => (
          <button
            key={value}
            type="button"
            className="pay-quick__item"
            onClick={() => form.patch({ amount: String(value) })}
          >
            {formatMoney(value)}
          </button>
        ))}
      </div>
      <Segmented
        options={[
          { value: "card", label: "Карта" },
          { value: "sbp", label: "СБП" },
          { value: "account", label: "Счёт" },
        ]}
        value={form.draft.method}
        onChange={(method) => form.patch({ method: method as PaymentMethod })}
      />
      {form.draft.method === "card" && (
        <Input
          id="card"
          label="Номер карты"
          placeholder="4276 0000 0000 0000"
          value={form.draft.card}
          onChange={(event) => form.patch({ card: event.target.value })}
          hint="Демо: 4276 1600 0000 0000 (проходит проверку Луна)"
        />
      )}
      {form.notice && (
        <Alert tone="warn" title="Проверьте данные">
          {form.notice}
        </Alert>
      )}
      <Button type="submit" block>
        {form.draft.kind === "deposit" ? "Пополнить счёт" : "Вывести средства"}
      </Button>
      <p className="muted pay-form__note">
        Операция проходит антифрод-проверку. Статус обновляется автоматически.
      </p>
    </form>
  </Card>
);

const BalancePanel = ({ balance, page }: { balance: ReturnType<typeof useWalletScreen>["view"]["feed"]["balance"]; page: ReturnType<typeof useWalletScreen>["view"]["feed"]["page"] }) => {
  const settled = (page.data?.items ?? []).filter((payment) => payment.status === "settled");

  return (
    <Card title="Счёт">
      <Stat
        label="Доступно"
        value={balance.data ? formatMoney(balance.data.available) : "—"}
        hint="Средства доступны для инвестиций"
      />
      <div className="pay-summary">
        <div>
          <span className="eyebrow">Пополнено</span>
          <span className="numeric text-up">
            {formatMoney(settled.filter((payment) => payment.kind === "deposit").reduce((acc, payment) => acc + payment.amount, 0))}
          </span>
        </div>
        <div>
          <span className="eyebrow">Выведено</span>
          <span className="numeric text-down">
            {formatMoney(settled.filter((payment) => payment.kind === "withdraw").reduce((acc, payment) => acc + payment.amount, 0))}
          </span>
        </div>
      </div>
    </Card>
  );
};

const Wallet = ({ session, onLogout }: { session: Session; onLogout: () => void }) => {
  const screen = useWalletScreen(session.token);

  return (
    <div className="pay-page">
      <header className="pay-top">
        <Logo compact />
        <span className="pay-top__title">Платежи</span>
        <span className="grow" />
        <span className="muted">{session.user.name}</span>
        <Button variant="ghost" size="sm" onClick={onLogout}>
          Выйти
        </Button>
      </header>
      <div className="container pay-body">
        <div className="pay-grid">
          <PaymentForm form={screen.form} />
          <BalancePanel balance={screen.view.feed.balance} page={screen.view.feed.page} />
        </div>
        <div style={{ marginTop: 20 }}>
          <History filters={screen.view.filters} page={screen.view.feed.page} />
        </div>
      </div>
    </div>
  );
};

export const Root = () => {
  const session = useSession();

  return session.session ? (
    <Wallet session={session.session} onLogout={session.signOut} />
  ) : (
    <LoginScreen session={session} />
  );
};
