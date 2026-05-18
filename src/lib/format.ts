export const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export const shortDate = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
});

export const monthName = new Intl.DateTimeFormat("pt-BR", {
  month: "long",
  year: "numeric",
});

export function money(value: number | string | { toString(): string }) {
  return currency.format(Number(value));
}

export function dateInputValue(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export function addMonths(date: Date, months: number) {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
}

export function clampDay(year: number, month: number, day: number) {
  return Math.min(day, new Date(year, month + 1, 0).getDate());
}
