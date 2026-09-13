import { deviceDateTime, type TripRecord } from "@/domain/models";
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
    "N.º",
    "Fecha",
    "Hora local",
    "Concepto / lugar",
    "Categoría",
    "Persona",
    "Método de pago",
    "Moneda original",
    "Monto original",
    "Monto referencial CAD",
    "Monto referencial USD",
    "Estado de conversión",
    "Tasa USD por 1 CAD",
    "Fecha de la tasa",
    "Fuente de la tasa",
    "Notas",
  ];
  const activeRows = rows
    .filter((record) => !record.deleted)
    .sort((a, b) =>
      `${a.data.date}T${a.data.time}`.localeCompare(
        `${b.data.date}T${b.data.time}`,
      ),
    );
  const data = activeRows.map((r, index) => {
    const d = r.data;
    const cad = convert(d.amountMinor, d.currency, "CAD", d.rate),
      usd = convert(d.amountMinor, d.currency, "USD", d.rate);
    return [
      index + 1,
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
      d.rate ? "Tasa registrada" : "Sin tasa de cambio",
      d.rate?.value ?? "",
      d.rate?.date ?? "",
      d.rate?.source ?? "",
      d.notes,
    ];
  });
  const totalCad = activeRows.reduce(
    (sum, row) =>
      sum +
      (convert(row.data.amountMinor, row.data.currency, "CAD", row.data.rate) ??
        0),
    0,
  );
  const totalUsd = activeRows.reduce(
    (sum, row) =>
      sum +
      (convert(row.data.amountMinor, row.data.currency, "USD", row.data.rate) ??
        0),
    0,
  );
  const withoutRate = activeRows.filter((row) => !row.data.rate).length;
  const total = activeRows.length
    ? [
        "TOTAL",
        "",
        "",
        "Total referencial",
        "",
        "",
        "",
        "",
        "",
        (totalCad / 100).toFixed(2),
        (totalUsd / 100).toFixed(2),
        withoutRate
          ? `${withoutRate} gasto${withoutRate === 1 ? "" : "s"} sin tasa`
          : "Completo",
        "",
        "",
        "",
        "",
      ]
    : null;
  return (
    "\uFEFF" +
    [header, ...data, ...(total ? [total] : [])]
      .map((row) => row.map(csvCell).join(","))
      .join("\r\n")
  );
}
export function downloadCsv(rows: TripRecord<"expense">[]) {
  downloadBlob(
    new Blob([buildCsv(rows)], { type: "text/csv;charset=utf-8;" }),
    `reporte-gastos-viaje-${deviceDateTime().date}.csv`,
  );
}
