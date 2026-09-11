"use client";
import { useState } from "react";
import {
  Check,
  Utensils,
  TrainFront,
  ShoppingCart,
  Gift,
  Compass,
  BedDouble,
  HeartPulse,
  Ellipsis,
} from "lucide-react";
import { Modal } from "@/components/modal";
import { Field } from "@/components/ui";
import { Attachments } from "@/components/attachments";
import { useTrip } from "@/components/trip-provider";
import {
  defaults,
  categories,
  people,
  paymentMethods,
  type TripRecord,
} from "@/domain/models";
import { parseMoney, convert, formatMoney } from "@/domain/money";
const icons = [
  Utensils,
  TrainFront,
  ShoppingCart,
  Gift,
  Compass,
  BedDouble,
  HeartPulse,
  Ellipsis,
];
export function ExpenseForm({
  existing,
  onClose,
}: {
  existing?: TripRecord<"expense">;
  onClose: () => void;
}) {
  const { save, rate } = useTrip();
  const [draft, setDraft] = useState(() => ({
    ...defaults("expense"),
    ...existing?.data,
    rate: existing ? existing.data.rate : rate,
  }));
  const [amount, setAmount] = useState(
      existing ? String(existing.data.amountMinor / 100) : "",
    ),
    [saved, setSaved] = useState(existing),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [dirty, setDirty] = useState(false);
  const patch = (data: Partial<typeof draft>) => {
    setDraft((d) => ({ ...d, ...data }));
    setDirty(true);
  };
  let converted: number | null = null;
  try {
    converted = convert(
      parseMoney(amount),
      draft.currency,
      draft.currency === "CAD" ? "USD" : "CAD",
      draft.rate,
    );
  } catch {}
  return (
    <Modal
      title={saved ? "Detalle del gasto" : "Nuevo gasto"}
      onClose={() => {
        if (
          !dirty ||
          confirm("¿Cerrar sin guardar los cambios del formulario?")
        )
          onClose();
      }}
    >
      <form
        className="stack"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError("");
          try {
            const data = { ...draft, amountMinor: parseMoney(amount) };
            const r = await save("expense", data, saved);
            setSaved(r);
            setDirty(false);
          } catch (e) {
            setError(e instanceof Error ? e.message : "No se pudo guardar.");
          } finally {
            setBusy(false);
          }
        }}
      >
        <section className="amount-panel">
          <div className="row spread">
            <span className="eyebrow">Monto del gasto</span>
            <div className="segmented">
              {(["CAD", "USD"] as const).map((currency) => (
                <button
                  type="button"
                  key={currency}
                  className={draft.currency === currency ? "selected" : ""}
                  onClick={() => patch({ currency })}
                >
                  {currency} ($)
                </button>
              ))}
            </div>
          </div>
          <div className="amount-entry">
            <span>{draft.currency === "CAD" ? "C$" : "US$"}</span>
            <input
              aria-label="Monto del gasto"
              inputMode="decimal"
              required
              placeholder="0.00"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setDirty(true);
              }}
            />
          </div>
          <p className="conversion-pill">
            {converted === null
              ? "Sin tasa: se conservará el monto original"
              : `≈ ${formatMoney(converted, draft.currency === "CAD" ? "USD" : "CAD")}`}
          </p>
          {rate && (
            <button
              className="text-button"
              type="button"
              onClick={() => patch({ rate })}
            >
              Usar tasa disponible: {rate.value} USD por CAD
            </button>
          )}
        </section>
        <Field label="Concepto / lugar">
          <input
            required
            maxLength={250}
            placeholder="Ej. Café, traslado, souvenir…"
            value={draft.description}
            onChange={(e) => patch({ description: e.target.value })}
          />
        </Field>
        <fieldset>
          <legend>Categoría</legend>
          <div className="category-grid">
            {categories.map((c, i) => {
              const Icon = icons[i];
              return (
                <button
                  type="button"
                  aria-pressed={draft.category === c}
                  className={draft.category === c ? "selected" : ""}
                  key={c}
                  onClick={() => patch({ category: c })}
                >
                  <Icon size={22} />
                  <span>{c}</span>
                </button>
              );
            })}
          </div>
        </fieldset>
        <Field label="¿Quién cubrió el gasto?">
          <input
            list="people-expense"
            required
            value={draft.paidBy}
            onChange={(e) => patch({ paidBy: e.target.value })}
          />
          <datalist id="people-expense">
            {people.map((p) => (
              <option key={p} value={p} />
            ))}
          </datalist>
        </Field>
        <Field label="Método de pago">
          <select
            value={draft.paymentMethod}
            onChange={(e) =>
              patch({
                paymentMethod: e.target.value as typeof draft.paymentMethod,
              })
            }
          >
            {paymentMethods.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </Field>
        <div className="two-cols">
          <Field label="Fecha del gasto">
            <input
              type="date"
              required
              value={draft.date}
              onChange={(e) => patch({ date: e.target.value })}
            />
          </Field>
          <Field label="Hora">
            <input
              type="time"
              required
              value={draft.time}
              onChange={(e) => patch({ time: e.target.value })}
            />
          </Field>
        </div>
        <p className="small muted">
          Fecha contable del viaje (Toronto). Puedes ajustarla para los
          traslados.
        </p>
        <Field label="Notas adicionales">
          <textarea
            rows={3}
            value={draft.notes}
            onChange={(e) => patch({ notes: e.target.value })}
          />
        </Field>
        {error && (
          <p role="alert" className="error-text">
            {error}
          </p>
        )}
        <button className="button primary full" disabled={busy}>
          <Check size={18} />
          {busy ? "Guardando…" : saved ? "Guardar cambios" : "Guardar gasto"}
        </button>
      </form>
      {saved ? (
        <div className="section-divider">
          <Attachments recordId={saved.id} />
          <button className="button secondary full" onClick={onClose}>
            Listo, volver a gastos
          </button>
        </div>
      ) : (
        <p className="small muted form-footnote">
          Después de guardar podrás adjuntar recibos desde la cámara, galería o
          un PDF.
        </p>
      )}
    </Modal>
  );
}
