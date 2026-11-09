export const COLORS = [
  { name: "brand-red", value: "#e40000", role: "Основной акцент, CTA" },
  { name: "brand-hot", value: "#ff0508", role: "Ховер и фокус" },
  { name: "brand-deep", value: "#b40000", role: "Нажатие" },
  { name: "ink", value: "#1e1f24", role: "Основной текст" },
  { name: "ink-soft", value: "#62636c", role: "Вторичный текст" },
  { name: "ink-faint", value: "#8b8d98", role: "Подписи" },
  { name: "line", value: "#e7e8ec", role: "Разделители" },
  { name: "paper", value: "#ffffff", role: "Поверхности" },
  { name: "surface", value: "#fcfcfd", role: "Фон" },
  { name: "tint", value: "#fff7f6", role: "Подсветка красным" },
  { name: "up", value: "#0a7f4f", role: "Рост" },
  { name: "down", value: "#c40000", role: "Падение" },
];

export const TYPOGRAPHY = [
  { name: "display-xl", sample: "Инвестиции", size: "108 / 0.94", weight: 900 },
  { name: "display-lg", sample: "Одна инфраструктура", size: "56 / 0.96", weight: 900 },
  { name: "display-md", sample: "Сколько принесёт портфель", size: "34 / 1.05", weight: 900 },
  { name: "body", sample: "Торговые платформы, депозитарий и сервисы биржи", size: "15 / 1.5", weight: 400 },
  { name: "caption", sample: "Обновлено в 19:42 · демо-данные", size: "12 / 1.5", weight: 500 },
];

export const SPACING = [4, 8, 12, 16, 24, 32, 48, 64];

export const RADIUS = [
  { name: "control", value: 4 },
  { name: "card", value: 10 },
  { name: "pill", value: 999 },
];

export const COMPONENTS = [
  { name: "Button", purpose: "Действия: primary, dark, ghost, quiet", status: "ready" },
  { name: "Input / Textarea", purpose: "Поля с подписью, подсказкой и ошибкой", status: "ready" },
  { name: "Badge", purpose: "Статусы: red, green, gray, black, warn, down", status: "ready" },
  { name: "Card", purpose: "Контейнер с заголовком и действием", status: "ready" },
  { name: "Table", purpose: "Табличные данные с числовым выравниванием", status: "ready" },
  { name: "Tabs / Segmented", purpose: "Переключение фильтров и режимов", status: "ready" },
  { name: "Modal", purpose: "Диалог с блокировкой скролла и Escape", status: "ready" },
  { name: "Toasts", purpose: "Короткие подтверждения действий", status: "ready" },
  { name: "Sparkline", purpose: "График динамики без осей", status: "ready" },
  { name: "ProgressBar", purpose: "Доли и структура портфеля", status: "ready" },
  { name: "AppShell", purpose: "Каркас кабинета: хедер, навигация, контент", status: "ready" },
];

export const RULES = [
  {
    id: "single-exit",
    title: "Один выход из функции",
    text: "Каждая функция имеет ровно один return, и он — последний оператор. Ранние выходы запрещены.",
    code: "const statusOf = (payment) =>\n  payment.status === \"settled\" ? \"ok\" : \"wait\";",
  },
  {
    id: "short-functions",
    title: "1–2 оператора на функцию",
    text: "max-statements: 2. Логика собирается из маленьких функций, а не из длинных процедур.",
    code: "const totalOf = (items) =>\n  items.reduce((acc, item) => acc + item.price, 0);",
  },
  {
    id: "no-loops",
    title: "Без continue, break и while",
    text: "Только map / filter / reduce и рекурсия. Циклы с управляющими операторами запрещены линтером.",
    code: "const tickers = quotes\n  .filter((quote) => quote.changePct > 0)\n  .map((quote) => quote.ticker);",
  },
];
