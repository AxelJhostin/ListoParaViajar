import type { DataMap, Rate, TripRecord } from "./models";
export function parseMoney(input: string): number {
  const value = input.trim().replace(",", ".");
  if (!/^\d{1,9}(\.\d{0,2})?$/.test(value))
    throw new Error("Usa un monto positivo con hasta 2 decimales.");
  const [whole, fraction = ""] = value.split(".");
  return Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
}
export const formatMoney = (minor: number, currency: "CAD" | "USD" = "CAD") =>
  new Intl.NumberFormat("es-EC", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(minor / 100) +
  " " +
  currency;
export function convert(
  minor: number,
  from: "CAD" | "USD",
  to: "CAD" | "USD",
  rate: Rate | null,
): number | null {
  if (from === to) return minor;
  if (!rate) return null;
  return Math.round(from === "CAD" ? minor * rate.value : minor / rate.value);
}
export function expenseTotal(
  records: TripRecord<"expense">[],
  currency: "CAD" | "USD",
) {
  let total = 0,
    missing = 0;
  for (const r of records) {
    if (r.deleted) continue;
    const n = convert(
      r.data.amountMinor,
      r.data.currency,
      currency,
      r.data.rate,
    );
    if (n === null) missing++;
    else total += n;
  }
  return { total, missing };
}
export function groupExpenses(
  records: TripRecord<"expense">[],
  key: "category" | "paidBy" | "paymentMethod" | "date",
) {
  const result: Record<string, number> = {};
  for (const r of records) {
    const n = convert(r.data.amountMinor, r.data.currency, "CAD", r.data.rate);
    if (n !== null) result[r.data[key]] = (result[r.data[key]] || 0) + n;
  }
  return Object.entries(result).sort((a, b) => b[1] - a[1]);
}
export const nativeMoney = (data: DataMap["expense"]) =>
  formatMoney(data.amountMinor, data.currency);
