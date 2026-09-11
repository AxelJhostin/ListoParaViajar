"use client";
import Link from "@/components/nav-link";
import { useRecords } from "@/components/trip-provider";
import { PageHeading, Progress } from "@/components/ui";
import { expenseTotal, formatMoney, groupExpenses } from "@/domain/money";
export function StatisticsPage() {
  const expenses = useRecords("expense"),
    packing = useRecords("packing"),
    docs = useRecords("document"),
    purchases = useRecords("purchase");
  const cad = expenseTotal(expenses, "CAD");
  return (
    <div className="stack">
      <PageHeading
        eyebrow="LA AVENTURA EN NÚMEROS"
        title="Estadísticas"
        body="Así va nuestro viaje, de un vistazo."
      />
      <section className="card">
        <p className="eyebrow">TOTAL REGISTRADO</p>
        <p className="amount">{formatMoney(cad.total)}</p>
        <p className="small muted">
          {expenses.length} gastos · {cad.missing} sin tasa de conversión
        </p>
      </section>
      {(["category", "date", "paidBy", "paymentMethod"] as const).map(
        (key, i) => {
          const data = groupExpenses(expenses, key),
            max = Math.max(1, ...data.map((d) => d[1]));
          return (
            <section className="card stack" key={key}>
              <h2>
                {
                  [
                    "Por categoría",
                    "Gasto diario",
                    "Por persona",
                    "Por método de pago",
                  ][i]
                }
              </h2>
              {!data.length && (
                <p className="muted">Aparecerá al registrar tus gastos.</p>
              )}
              {data.map(([label, total]) => (
                <div className="stat-bar" key={label}>
                  <div className="row spread">
                    <span>{label}</span>
                    <strong>{formatMoney(total)}</strong>
                  </div>
                  <div className="bar-track">
                    <span style={{ width: `${(total / max) * 100}%` }} />
                  </div>
                </div>
              ))}
            </section>
          );
        },
      )}
      <section className="card stack">
        <h2>Preparación</h2>
        {[
          [
            "Equipaje",
            packing.filter((p) => p.data.done).length,
            packing.length,
          ],
          [
            "Documentos",
            docs.filter((p) => p.data.status === "Listo").length,
            docs.length,
          ],
          [
            "Compras empacadas",
            purchases.filter((p) => p.data.status === "Empacado").length,
            purchases.length,
          ],
        ].map(([label, done, total]) => (
          <div className="stack compact" key={label}>
            <div className="row spread">
              <span>{label}</span>
              <strong>
                {done} / {total}
              </strong>
            </div>
            <Progress
              value={Number(total) ? (Number(done) / Number(total)) * 100 : 0}
            />
          </div>
        ))}
        <p className="small muted">
          Compras:{" "}
          {purchases.filter((p) => p.data.status === "Pendiente").length}{" "}
          pendientes ·{" "}
          {purchases.filter((p) => p.data.status === "Comprado").length}{" "}
          compradas ·{" "}
          {purchases.filter((p) => p.data.status === "Empacado").length}{" "}
          empacadas
        </p>
      </section>
      <Link href="/reportes" className="button primary">
        Ver reportes y exportar
      </Link>
    </div>
  );
}
