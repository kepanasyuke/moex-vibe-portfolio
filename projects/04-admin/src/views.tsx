import { useState } from "react";
import type { AuditEntry, Role } from "@contracts";
import { formatDateTime, formatMoney } from "@contracts";
import {
  Alert,
  AppShell,
  Badge,
  Button,
  Card,
  Input,
  Logo,
  PageHeader,
  Spinner,
  Stat,
  Table,
  Tabs,
  Textarea,
  type Column,
  type NavItem,
} from "@ui";
import type { AdminUser, Session } from "./api.ts";
import { useAdminScreen, useAuditPage, useBroadcastForm, useSession, useUsersView } from "./hooks.ts";
import type { Section } from "./hooks.ts";

type ScreenState = ReturnType<typeof useSession>;

const NAV: NavItem[] = [
  { key: "overview", label: "Обзор" },
  { key: "users", label: "Пользователи", hint: "Роли" },
  { key: "broadcast", label: "Рассылка" },
  { key: "audit", label: "Аудит" },
];

const AUDIENCE = [
  { value: "all", label: "Все пользователи" },
  { value: "investors", label: "Только инвесторы" },
];

const LoginScreen = ({ session }: { session: ScreenState }) => {
  const [form, setForm] = useState({ email: "admin@moex.dev", password: "Admin12345" });

  return (
    <div className="admin-login">
      <div className="admin-login__card">
        <Logo />
        <h1 className="display display-md">Администрирование</h1>
        <p className="muted">Пользователи, роли, рассылки и журнал действий.</p>
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
        <p className="muted admin-login__hint">Демо: admin@moex.dev / Admin12345</p>
      </div>
    </div>
  );
};

const Overview = ({ data }: { data: ReturnType<typeof useAdminScreen>["data"] }) => (
  <>
    <PageHeader eyebrow="Пульс платформы" title="Обзор" subtitle="Ключевые метрики демо-стенда" />
    <div className="grid-4">
      <Card>
        <Stat label="Пользователи" value={data.stats.data?.users ?? "—"} hint={`${data.stats.data?.admins ?? 0} администраторов`} />
      </Card>
      <Card>
        <Stat label="Заблокированы" value={data.stats.data?.blocked ?? "—"} hint="Активных ограничений" />
      </Card>
      <Card>
        <Stat label="Пополнения" value={formatMoney(data.stats.data?.depositVolume ?? 0)} hint="Исполненные платежи" />
      </Card>
      <Card>
        <Stat label="Уведомления" value={data.stats.data?.notifications ?? "—"} hint="Отправлено пользователям" />
      </Card>
    </div>
    <div style={{ marginTop: 20 }}>
      <Card title="Последние действия" flush>
        <Table
          columns={[
            { key: "at", title: "Когда", render: (row: AuditEntry) => formatDateTime(row.at) },
            { key: "action", title: "Действие", render: (row) => <span className="mono">{row.action}</span> },
            { key: "target", title: "Объект", render: (row) => row.target },
          ]}
          rows={data.audit.data?.items.slice(0, 6) ?? []}
          rowKey={(row) => row.id}
        />
      </Card>
    </div>
  </>
);

const ROLE_OPTIONS: Array<{ value: Role; label: string }> = [
  { value: "investor", label: "Инвестор" },
  { value: "admin", label: "Администратор" },
];

const UsersTable = ({ data }: { data: ReturnType<typeof useAdminScreen>["data"] }) => {
  const view = useUsersView(data.users.data ?? []);

  return <UsersTableBody data={data} view={view} />;
};

const UsersTableBody = ({
  data,
  view,
}: {
  data: ReturnType<typeof useAdminScreen>["data"];
  view: ReturnType<typeof useUsersView>;
}) => {
  const columns: Array<Column<AdminUser>> = [
    {
      key: "user",
      title: "Пользователь",
      render: (row) => (
        <div>
          <div style={{ fontWeight: 700 }}>{row.name}</div>
          <div className="muted" style={{ fontSize: 12 }}>
            {row.email}
          </div>
        </div>
      ),
    },
    {
      key: "role",
      title: "Роль",
      render: (row) => (
        <select
          className="admin-role"
          value={row.role}
          onChange={(event) => data.setRole(row.id, event.target.value as Role)}
        >
          {ROLE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ),
    },
    {
      key: "status",
      title: "Статус",
      render: (row) =>
        row.status === "active" ? <Badge tone="green">Активен</Badge> : <Badge tone="down">Заблокирован</Badge>,
    },
    {
      key: "activity",
      title: "Активность",
      render: (row) => (
        <span className="muted" style={{ fontSize: 13 }}>
          {row.operations} операций · {row.payments} платежей
        </span>
      ),
    },
    {
      key: "action",
      title: "",
      render: (row) => (
        <Button
          size="sm"
          variant={row.status === "active" ? "ghost" : "dark"}
          onClick={() => data.setStatus(row.id, row.status === "active" ? "blocked" : "active")}
        >
          {row.status === "active" ? "Заблокировать" : "Разблокировать"}
        </Button>
      ),
    },
  ];

  return (
    <>
      <div className="admin-search">
        <Input
          id="search"
          placeholder="Поиск по имени или e-mail"
          value={view.query}
          onChange={(event) => view.setQuery(event.target.value)}
        />
      </div>
      <Card flush>
        <Table
          columns={columns}
          rows={view.filtered}
          rowKey={(row) => row.id}
          empty={<div className="admin-empty">Никого не нашли</div>}
        />
      </Card>
    </>
  );
};

const Users = ({ data }: { data: ReturnType<typeof useAdminScreen>["data"] }) => (
  <>
    <PageHeader
      eyebrow="Доступ"
      title="Пользователи"
      subtitle="Роли и блокировки применяются сразу, действия попадают в аудит"
    />
    <UsersTable data={data} />
  </>
);

const Broadcast = ({ data }: { data: ReturnType<typeof useAdminScreen>["data"] }) => {
  const form = useBroadcastForm(data.broadcast);

  return (
    <>
      <PageHeader eyebrow="Коммуникации" title="Рассылка" subtitle="Сообщение появится в кабинетах выбранной аудитории" />
      <div className="grid-2">
        <Card title="Новое сообщение">
          <form className="stack" onSubmit={form.submit}>
            <Input
              id="title"
              label="Заголовок"
              value={form.form.title}
              onChange={(event) => form.patch({ title: event.target.value })}
            />
            <Textarea
              id="body"
              label="Текст"
              value={form.form.body}
              onChange={(event) => form.patch({ body: event.target.value })}
            />
            <Tabs
              items={AUDIENCE}
              value={form.form.audience}
              onChange={(audience) => form.patch({ audience })}
            />
            {form.notice && (
              <Alert tone={form.notice === "Рассылка отправлена" ? "success" : "warn"} title={form.notice} />
            )}
            <Button type="submit">Отправить</Button>
          </form>
        </Card>
        <Card title="Как это работает">
          <ul className="admin-list">
            <li>Сообщение создаётся для каждого получателя отдельно.</li>
            <li>Инвесторы увидят его в разделе «Уведомления» кабинета.</li>
            <li>Каждая рассылка фиксируется в журнале аудита.</li>
            <li>Демо-стенд: данные живут в памяти процесса.</li>
          </ul>
          <div className="kv">
            <span className="kv__k">Пользователей</span>
            <span className="kv__v">{data.stats.data?.users ?? "—"}</span>
          </div>
          <div className="kv">
            <span className="kv__k">Инвесторов</span>
            <span className="kv__v">{(data.stats.data?.users ?? 0) - (data.stats.data?.admins ?? 0)}</span>
          </div>
        </Card>
      </div>
    </>
  );
};

const Audit = ({ token }: { token: string }) => {
  const view = useAuditPage(token);

  return (
    <>
      <PageHeader eyebrow="Безопасность" title="Журнал действий" subtitle="Все изменения ролей, статусов и рассылки" />
      <Card flush>
        <Table
          columns={[
            { key: "at", title: "Когда", render: (row: AuditEntry) => formatDateTime(row.at) },
            { key: "actor", title: "Кто", render: (row) => <span className="mono">{row.actorId}</span> },
            { key: "action", title: "Действие", render: (row) => <Badge tone="gray">{row.action}</Badge> },
            { key: "target", title: "Объект", render: (row) => row.target },
          ]}
          rows={view.audit.data?.items ?? []}
          rowKey={(row) => row.id}
          empty={<div className="admin-empty">Журнал пуст</div>}
        />
        <div className="admin-pager">
          <Button variant="ghost" size="sm" disabled={!view.cursor} onClick={() => view.setCursor(null)}>
            В начало
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={!view.audit.data?.nextCursor}
            onClick={() => view.setCursor(view.audit.data?.nextCursor ?? null)}
          >
            Дальше
          </Button>
        </div>
      </Card>
    </>
  );
};

const AdminApp = ({ session, onLogout }: { session: Session; onLogout: () => void }) => {
  const screen = useAdminScreen(session.token);

  return (
    <AppShell
      product="Администрирование"
      nav={NAV}
      active={screen.tabs.tab}
      onSelect={(key) => screen.tabs.setTab(key as Section)}
      user={session.user}
      onLogout={onLogout}
    >
      {screen.tabs.tab === "overview" && <Overview data={screen.data} />}
      {screen.tabs.tab === "users" && <Users data={screen.data} />}
      {screen.tabs.tab === "broadcast" && <Broadcast data={screen.data} />}
      {screen.tabs.tab === "audit" && <Audit token={session.token} />}
    </AppShell>
  );
};

export const Root = () => {
  const session = useSession();

  return session.session ? (
    <AdminApp session={session.session} onLogout={session.signOut} />
  ) : (
    <LoginScreen session={session} />
  );
};

export const Loading = () => (
  <div className="admin-loading">
    <Spinner />
  </div>
);
