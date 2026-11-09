import { formatMoneyPrecise, formatPercent } from "@contracts";
import {
  Badge,
  Button,
  Card,
  Icon,
  ICON_NAMES,
  Input,
  Logo,
  Modal,
  PageHeader,
  ProgressBar,
  Sparkline,
  Table,
  Tabs,
  type Column,
  useTabs,
} from "@ui";
import type { Tokens } from "./api.ts";
import { useDesignScreen } from "./hooks.ts";

interface SampleRow {
  ticker: string;
  name: string;
  price: number;
  change: number;
}

const SAMPLE_ROWS: SampleRow[] = [
  { ticker: "GAZP", name: "Газпром", price: 128.4, change: 1.82 },
  { ticker: "SBER", name: "Сбербанк", price: 312.5, change: 1.4 },
  { ticker: "YDEX", name: "Яндекс", price: 4210, change: -2.09 },
];

const SAMPLE_COLUMNS: Array<Column<SampleRow>> = [
  { key: "ticker", title: "Тикер", render: (row) => <strong>{row.ticker}</strong> },
  { key: "name", title: "Инструмент", render: (row) => <span className="muted">{row.name}</span> },
  { key: "price", title: "Цена", align: "right", render: (row) => formatMoneyPrecise(row.price) },
  {
    key: "change",
    title: "Δ",
    align: "right",
    render: (row) => <span className={row.change >= 0 ? "text-up" : "text-down"}>{formatPercent(row.change)}</span>,
  },
];

const ColorsGrid = ({ tokens }: { tokens: Tokens }) => (
  <div className="ds-colors">
    {tokens.colors.map((color) => (
      <div key={color.name} className="ds-color">
        <span className="ds-color__chip" style={{ background: color.value }} />
        <span className="ds-color__name mono">{color.name}</span>
        <span className="ds-color__value mono">{color.value}</span>
        <span className="ds-color__role">{color.role}</span>
      </div>
    ))}
  </div>
);

const TypeSpecimen = ({ tokens }: { tokens: Tokens }) => (
  <div className="ds-type">
    {tokens.typography.map((type) => (
      <div key={type.name} className="ds-type__row">
        <div className="ds-type__meta">
          <span className="mono">{type.name}</span>
          <span className="muted">{type.size} · {type.weight}</span>
        </div>
        <div
          className={type.name.startsWith("display") ? "display" : ""}
          style={{ fontWeight: type.weight, fontSize: Number.parseInt(type.size, 10) }}
        >
          {type.sample}
        </div>
      </div>
    ))}
  </div>
);

const SpacingScale = ({ tokens }: { tokens: Tokens }) => (
  <div className="ds-spacing">
    {tokens.spacing.map((value) => (
      <div key={value} className="ds-spacing__row">
        <span className="mono">{value}px</span>
        <span className="ds-spacing__bar" style={{ width: value * 4 }} />
      </div>
    ))}
  </div>
);

const TokensSection = ({ tokens }: { tokens: Tokens }) => (
  <>
    <PageHeader eyebrow="Токены" title="Цвет, типографика, ритм" subtitle="Всё, из чего собираются интерфейсы" />
    <div className="stack">
      <Card title="Палитра">
        <ColorsGrid tokens={tokens} />
      </Card>
      <div className="grid-2">
        <Card title="Типографика">
          <TypeSpecimen tokens={tokens} />
        </Card>
        <Card title="Шкала отступов">
          <SpacingScale tokens={tokens} />
        </Card>
      </div>
    </div>
  </>
);

const ComponentsShowcase = () => {
  const tabs = useTabs<string>("overview");

  return (
    <div className="grid-2">
      <Card title="Кнопки">
        <div className="ds-buttons">
          <Button>Primary</Button>
          <Button variant="dark">Dark</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="quiet">Quiet</Button>
          <Button loading>Загрузка</Button>
          <Button disabled>Disabled</Button>
        </div>
      </Card>
      <Card title="Бейджи">
        <div className="row" style={{ flexWrap: "wrap" }}>
          <Badge tone="red">Новое</Badge>
          <Badge tone="green">Исполнено</Badge>
          <Badge tone="warn">В обработке</Badge>
          <Badge tone="down">Отклонено</Badge>
          <Badge tone="gray">Черновик</Badge>
          <Badge tone="black">MOEX</Badge>
        </div>
      </Card>
      <Card title="Поля">
        <div className="stack">
          <Input id="demo-email" label="E-mail" placeholder="name@moex.dev" hint="Подсказка под полем" />
          <Input id="demo-error" label="Сумма" value="50" error="Минимальная сумма — 100 ₽" onChange={() => undefined} />
        </div>
      </Card>
      <Card title="Табы и сегменты">
        <div className="stack">
          <Tabs
            items={[
              { value: "overview", label: "Обзор" },
              { value: "history", label: "История" },
              { value: "settings", label: "Настройки" },
            ]}
            value={tabs.tab}
            onChange={tabs.setTab}
          />
          <p className="muted">Активный раздел: {tabs.tab}</p>
        </div>
      </Card>
      <Card title="Таблица" flush>
        <Table columns={SAMPLE_COLUMNS} rows={SAMPLE_ROWS} rowKey={(row) => row.ticker} />
      </Card>
      <Card title="Прогресс и график">
        <div className="stack">
          <ProgressBar label="GAZP" value={42} suffix="42 %" />
          <ProgressBar label="SBER" value={28} suffix="28 %" alternate />
          <Sparkline points={[100, 104, 102, 108, 111, 109, 115, 118]} tone="up" height={90} />
        </div>
      </Card>
      <Card title="Иконки" action={<span className="muted">{ICON_NAMES.length} шт · 24 px</span>}>
        <div className="ds-icons">
          {ICON_NAMES.map((name) => (
            <div key={name} className="ds-icon">
              <Icon name={name} size={20} />
              <span className="ds-icon__name">{name}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

const ComponentsSection = ({ demo }: { demo: ReturnType<typeof useDesignScreen>["demo"] }) => (
  <>
    <PageHeader eyebrow="Компоненты" title="Библиотека" subtitle="Один источник правды для восьми проектов" />
    <ComponentsShowcase />
    <div style={{ marginTop: 20 }}>
      <Card title="Модальное окно и тосты">
        <div className="row">
          <Button onClick={demo.openModal}>Открыть модальное окно</Button>
          <Button variant="ghost" onClick={() => demo.toasts.push("Готово: компонент добавлен", "success")}>
            Показать тост
          </Button>
        </div>
      </Card>
    </div>
    <Modal
      open={demo.modal}
      onClose={demo.closeModal}
      title="Демонстрационный диалог"
      footer={
        <>
          <Button variant="ghost" onClick={demo.closeModal}>
            Отмена
          </Button>
          <Button
            onClick={() => {
              demo.closeModal();
              demo.toasts.push("Действие подтверждено", "success");
            }}
          >
            Подтвердить
          </Button>
        </>
      }
    >
      <p className="muted">
        Модальное окно блокирует скролл, закрывается по Escape и по клику на подложку. Внутри — та же
        дизайн-система, что и во всех проектах портфолио.
      </p>
    </Modal>
    <div className="toasts">
      {demo.toasts.items.map((toast) => (
        <div key={toast.id} className={toast.tone === "success" ? "toast toast--success" : "toast"}>
          {toast.text}
        </div>
      ))}
    </div>
  </>
);

const RulesSection = ({ rules }: { rules: ReturnType<typeof useDesignScreen>["catalog"]["data"] }) => (
  <>
    <PageHeader eyebrow="Инженерные правила" title="Как мы пишем код" subtitle="Правила зашиты в ESLint и проверяются в CI" />
    <div className="stack">
      {(rules?.rules ?? []).map((rule) => (
        <Card key={rule.id} title={rule.title}>
          <p className="muted">{rule.text}</p>
          <pre className="ds-code">{rule.code}</pre>
        </Card>
      ))}
    </div>
  </>
);

export const DesignSystemApp = () => {
  const screen = useDesignScreen();

  return (
    <div className="ds">
      <header className="ds__top">
        <Logo compact />
        <span className="ds__title">Дизайн-система</span>
        <span className="grow" />
        <span className="muted">8 проектов · один UI-кит</span>
      </header>
      <main className="container ds__body">
        {screen.tokens.data && <TokensSection tokens={screen.tokens.data} />}
        <div className="ds__section">
          <ComponentsSection demo={screen.demo} />
        </div>
        <div className="ds__section">
          <RulesSection rules={screen.catalog.data} />
        </div>
      </main>
    </div>
  );
};
