const money = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "RUB",
  maximumFractionDigits: 0,
});

const moneyPrecise = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "RUB",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const percent = new Intl.NumberFormat("ru-RU", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const day = new Intl.DateTimeFormat("ru-RU", { dateStyle: "medium" });

const dayTime = new Intl.DateTimeFormat("ru-RU", {
  dateStyle: "short",
  timeStyle: "short",
});

export const formatMoney = (value: number): string => money.format(value);

export const formatMoneyPrecise = (value: number): string =>
  moneyPrecise.format(value);

export const formatPercent = (value: number): string =>
  `${percent.format(value)} %`;

export const formatSignedPercent = (value: number): string =>
  `${value > 0 ? "+" : ""}${percent.format(value)} %`;

export const formatDate = (iso: string): string => day.format(new Date(iso));

export const formatDateTime = (iso: string): string =>
  dayTime.format(new Date(iso));

export const formatQty = (value: number): string =>
  new Intl.NumberFormat("ru-RU").format(value);

export const pctChange = (price: number, prevClose: number): number =>
  prevClose === 0 ? 0 : ((price - prevClose) / prevClose) * 100;

export const round2 = (value: number): number =>
  Math.round((value + Number.EPSILON) * 100) / 100;

export const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);
