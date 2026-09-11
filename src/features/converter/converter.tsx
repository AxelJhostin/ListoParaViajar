"use client";
import { useState } from "react";
import { ArrowDownUp, RefreshCw } from "lucide-react";
import { useTrip } from "@/components/trip-provider";
import { Field } from "@/components/ui";
import { Modal } from "@/components/modal";
import { formatMoney, parseMoney, convert } from "@/domain/money";
import { setRate } from "@/local/database";
export function Converter({ onClose }: { onClose: () => void }) {
  const { rate, refreshRate, online, notify } = useTrip();
  const [from, setFrom] = useState<"CAD" | "USD">("CAD"),
    [value, setValue] = useState("100"),
    [manual, setManual] = useState(""),
    [showManual, setShowManual] = useState(false),
    [busy, setBusy] = useState(false);
  let result: number | null = null;
  try {
    result = convert(
      parseMoney(value),
      from,
      from === "CAD" ? "USD" : "CAD",
      rate,
    );
  } catch {}
  return (
    <Modal title="Conversor de divisas" onClose={onClose}>
      <div className="stack">
        <p className="eyebrow">Un poco de claridad para cada compra</p>
        <div className="converter-card">
          <Field
            label={
              from === "CAD" ? "🇨🇦 Dólar canadiense" : "🇺🇸 Dólar estadounidense"
            }
          >
            <input
              className="big-input"
              aria-label={`Monto ${from}`}
              inputMode="decimal"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </Field>
          <button
            className="swap"
            onClick={() => setFrom(from === "CAD" ? "USD" : "CAD")}
            aria-label="Invertir monedas"
          >
            <ArrowDownUp size={22} />
          </button>
          <div>
            <small>Recibes aproximadamente</small>
            <p className="amount">
              {result === null
                ? "—"
                : formatMoney(result, from === "CAD" ? "USD" : "CAD")}
            </p>
          </div>
        </div>
        <div className="chips">
          {[5, 10, 20, 50, 100].map((n) => (
            <button key={n} onClick={() => setValue(String(n))}>
              {n} {from}
            </button>
          ))}
        </div>
        <div className="callout">
          <strong>
            {rate
              ? `1 CAD = ${rate.value} USD`
              : "Todavía no hay una tasa guardada"}
          </strong>
          <p className="small">
            {rate
              ? `${rate.manual ? "Tasa manual" : rate.source} · Fecha de tasa: ${rate.date}`
              : "Conéctate para actualizarla o ingresa una tasa manual."}
          </p>
          {rate && (
            <p className="small">
              Consultada: {new Date(rate.fetchedAt).toLocaleString("es-EC")}
            </p>
          )}
          {!online && (
            <p className="small">
              Sin conexión · usamos la última tasa disponible.
            </p>
          )}
        </div>
        <div className="two-cols">
          <button
            className="button secondary"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              await refreshRate();
              setBusy(false);
            }}
          >
            <RefreshCw size={16} /> {busy ? "Actualizando…" : "Actualizar tasa"}
          </button>
          <button
            className="button secondary"
            onClick={() => setShowManual(!showManual)}
          >
            Tasa manual
          </button>
        </div>
        {showManual && (
          <form
            className="stack"
            onSubmit={async (e) => {
              e.preventDefault();
              const n = Number(manual.replace(",", "."));
              if (!Number.isFinite(n) || n <= 0 || n > 100) {
                notify("Ingresa una tasa mayor a cero y menor a 100.");
                return;
              }
              await setRate({
                value: n,
                date: new Date().toISOString().slice(0, 10),
                fetchedAt: new Date().toISOString(),
                source: "Manual",
                manual: true,
              });
              setShowManual(false);
            }}
          >
            <Field label="USD por 1 CAD">
              <input
                required
                inputMode="decimal"
                value={manual}
                onChange={(e) => setManual(e.target.value)}
              />
            </Field>
            <button className="button primary">Guardar tasa</button>
          </form>
        )}
        <p className="small muted">
          Tasa referencial; puede diferir de la tasa de tu banco o tarjeta. Las
          tasas nuevas se usan para nuevos gastos.
        </p>
      </div>
    </Modal>
  );
}
