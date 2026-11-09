import type { Preset, Projection } from "./api.ts";
import { formatMoney, formatPercent } from "@contracts";
import { Button, Card, Icon, Input, Logo, Sparkline, Stat, Table, type Column } from "@ui";
import type { ProjectionPoint } from "./api.ts";
import { useCalcScreen } from "./hooks.ts";

const YEARS_COLUMNS: Array<Column<ProjectionPoint>> = [
  { key: "year", title: "Год", render: (row) => row.year },
  { key: "contributed", title: "Вложено", align: "right", render: (row) => formatMoney(row.contributed) },
  { key: "value", title: "Стоимость", align: "right", render: (row) => formatMoney(row.value) },
  {
    key: "income",
    title: "Доход",
    align: "right",
    render: (row) => <span className="text-up">{formatMoney(row.value - row.contributed)}</span>,
  },
];

const PresetList = ({
  presets,
  active,
  onPick,
}: {
  presets: Preset[];
  active: string;
  onPick: (preset: Preset) => void;
}) => (
  <div className="calc-presets">
    {presets.map((preset) => (
      <button
        key={preset.id}
        type="button"
        className={preset.annualPct === Number(active) ? "calc-preset calc-preset--active" : "calc-preset"}
        onClick={() => onPick(preset)}
      >
        <span className="calc-preset__title">{preset.title}</span>
        <span className="calc-preset__value">{formatPercent(preset.annualPct)}</span>
        <span className="calc-preset__risk">{preset.risk}</span>
      </button>
    ))}
  </div>
);

const ResultPanel = ({ result }: { result: Projection }) => (
  <>
    <div className="calc-result">
      <span className="eyebrow">Итоговая стоимость через {result.input.years} лет</span>
      <strong className="calc-result__value" data-testid="calc-total">
        {formatMoney(result.total)}
      </strong>
      <span className="muted">
        после налога {formatMoney(result.tax)} · доходность {formatPercent(result.input.annualPct)} годовых
      </span>
    </div>
    <div className="grid-3">
      <Stat label="Вложено" value={formatMoney(result.contributed)} hint={`${result.input.monthly.toLocaleString("ru-RU")} ₽ в месяц`} />
      <Stat label="Доход" value={formatMoney(result.income)} tone="up" hint="До налога" />
      <Stat label="Налог" value={formatMoney(result.tax)} hint="НДФЛ по прогрессивной шкале" />
    </div>
    <Sparkline
      points={result.points.map((point) => point.value)}
      height={180}
      tone="up"
      label="Рост стоимости портфеля по годам"
    />
    <Table columns={YEARS_COLUMNS} rows={result.points} rowKey={(row) => String(row.year)} />
  </>
);

export const CalcApp = () => {
  const screen = useCalcScreen();

  return (
    <div className="calc">
      <header className="calc__top">
        <span className="calc__brand">
          <Logo compact />
          <span className="calc__divider" />
          <span className="calc__title">Калькулятор доходности</span>
        </span>
        <span className="calc__demo">демо-стенд</span>
        <span className="grow" />
        <span className="muted">сложный процент · НДФЛ · комиссии</span>
      </header>
      <main className="container calc__body">
        <div className="calc__intro">
          <span className="eyebrow">Планирование</span>
          <h1 className="display display-md">Сколько принесёт портфель</h1>
          <p className="muted">
            Расчёт на сервере: доходность капитализируется ежемесячно, налог считается по прогрессивной шкале
            НДФЛ, комиссии учитываются отдельно.
          </p>
        </div>
        <div className="calc__grid">
          <Card title={<span className="card__title-inline"><Icon name="settings" size={16} />Параметры</span>}>
            <form className="stack" onSubmit={screen.form.submit}>
              <Input
                id="initial"
                label="Начальная сумма, ₽"
                inputMode="numeric"
                value={screen.form.form.initial}
                onChange={(event) => screen.form.patch({ initial: event.target.value })}
              />
              <Input
                id="monthly"
                label="Пополнение в месяц, ₽"
                inputMode="numeric"
                value={screen.form.form.monthly}
                onChange={(event) => screen.form.patch({ monthly: event.target.value })}
              />
              <Input
                id="years"
                label="Горизонт, лет"
                inputMode="numeric"
                value={screen.form.form.years}
                onChange={(event) => screen.form.patch({ years: event.target.value })}
              />
              <Input
                id="rate"
                label="Доходность, % годовых"
                inputMode="numeric"
                value={screen.form.form.annualPct}
                onChange={(event) => screen.form.patch({ annualPct: event.target.value })}
              />
              <PresetList
                presets={screen.presets.data ?? []}
                active={screen.form.form.annualPct}
                onPick={(preset) => screen.form.patch({ annualPct: String(preset.annualPct) })}
              />
              <Button type="submit" size="lg" data-testid="calc-submit">
                Рассчитать
              </Button>
            </form>
          </Card>
          <Card title={<span className="card__title-inline"><Icon name="percent" size={16} />Результат</span>}>
            {screen.result ? (
              <ResultPanel result={screen.result} />
            ) : (
              <div className="calc__placeholder">
                <p className="muted">Заполните параметры и нажмите «Рассчитать».</p>
                <p className="calc__hint">
                  Пример: 100 000 ₽ стартово, 20 000 ₽ в месяц, 18 % годовых на 10 лет.
                </p>
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
};
