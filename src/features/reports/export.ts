import type { TripRecord } from "@/domain/models";
import { convert } from "@/domain/money";
export function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
export function csvCell(value: unknown) {
  let text = String(value ?? "");
  if (/^[=+\-@\t\r]/.test(text)) text = "'" + text;
  return '"' + text.replaceAll('"', '""') + '"';
}
export function buildCsv(rows: TripRecord<"expense">[]) {
  const header = [
    "ID",
    "Fecha",
    "Hora (Toronto / manual)",
    "Descripción",
    "Categoría",
    "Pagó",
    "Método",
    "Moneda original",
    "Monto original",
    "CAD referencial",
    "USD referencial",
    "USD por CAD",
    "Fecha tasa",
    "Fuente tasa",
    "Notas",
  ];
  const data = rows
    .filter((r) => !r.deleted)
    .map((r) => {
      const d = r.data;
      const cad = convert(d.amountMinor, d.currency, "CAD", d.rate),
        usd = convert(d.amountMinor, d.currency, "USD", d.rate);
      return [
        r.id,
        d.date,
        d.time,
        d.description,
        d.category,
        d.paidBy,
        d.paymentMethod,
        d.currency,
        (d.amountMinor / 100).toFixed(2),
        cad === null ? "" : (cad / 100).toFixed(2),
        usd === null ? "" : (usd / 100).toFixed(2),
        d.rate?.value,
        d.rate?.date,
        d.rate?.source,
        d.notes,
      ];
    });
  return (
    "\uFEFF" +
    [header, ...data].map((row) => row.map(csvCell).join(",")).join("\r\n")
  );
}
export function downloadCsv(rows: TripRecord<"expense">[]) {
  downloadBlob(
    new Blob([buildCsv(rows)], { type: "text/csv;charset=utf-8;" }),
    `gastos-viaje-${new Date().toISOString().slice(0, 10)}.csv`,
  );
}
