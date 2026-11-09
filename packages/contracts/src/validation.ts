export type Valid = { ok: true; value: string };
export type Invalid = { ok: false; error: string };
export type Validation = Valid | Invalid;

export const valid = (value: string): Valid => ({ ok: true, value });

export const invalid = (error: string): Invalid => ({ ok: false, error });

const EMAIL = /^[^\s@]+@[^\s@]+\.[a-zа-я]{2,}$/i;
const AMOUNT = /^\d+([.,]\d{1,2})?$/;

export const email = (raw: string): Validation => {
  const value = raw.trim().toLowerCase();

  return EMAIL.test(value) ? valid(value) : invalid("Укажите корректный e-mail");
};

export const password = (raw: string): Validation =>
  raw.length >= 8 && /[a-zа-я]/i.test(raw) && /\d/.test(raw)
    ? valid(raw)
    : invalid("Минимум 8 символов, буквы и цифры");

export const name = (raw: string): Validation => {
  const value = raw.trim();

  return value.length >= 2 ? valid(value) : invalid("Имя слишком короткое");
};

const normalize = (raw: string): number =>
  Number(raw.replace(/\s/g, "").replace(",", "."));

const amountOk = (raw: string, max: number): boolean =>
  AMOUNT.test(raw.trim()) &&
  Number.isFinite(normalize(raw)) &&
  normalize(raw) >= 100 &&
  normalize(raw) <= max;

export const amount = (raw: string, max = 5_000_000): Validation =>
  amountOk(raw, max)
    ? valid(String(Math.round(normalize(raw) * 100) / 100))
    : invalid(`Сумма от 100 ₽ до ${max.toLocaleString("ru-RU")} ₽`);

export const contact = (raw: string): Validation => {
  const value = raw.trim();

  return value.length >= 5 ? valid(value) : invalid("Оставьте телефон или e-mail");
};

export const maskCard = (pan: string): string => {
  const digits = pan.replace(/\D/g, "").slice(-4);

  return `•••• •••• •••• ${digits || "0000"}`;
};

const luhnDigit = (digit: number, index: number): number => {
  const doubled = index % 2 === 1 ? digit * 2 : digit;

  return doubled > 9 ? doubled - 9 : doubled;
};

export const luhn = (pan: string): boolean => {
  const digits = pan.replace(/\D/g, "").split("").reverse().map(Number);

  return digits.length >= 12 && digits.reduce((acc, digit, index) => acc + luhnDigit(digit, index), 0) % 10 === 0;
};
