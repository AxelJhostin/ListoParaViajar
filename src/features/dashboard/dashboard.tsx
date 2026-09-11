"use client";
import Link from "@/components/nav-link";
import {
  PlusCircle,
  FileCheck,
  Luggage,
  ShoppingBag,
  ReceiptText,
  MapPin,
  PlaneTakeoff,
  PlaneLanding,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";
import { useRecords, useTrip } from "@/components/trip-provider";
import { Badge, Progress } from "@/components/ui";
import { expenseTotal, formatMoney } from "@/domain/money";
import { useState } from "react";
import { ExpenseForm } from "@/features/expenses/expense-form";
export function Dashboard() {
  const expenses = useRecords("expense"),
    packing = useRecords("packing"),
    docs = useRecords("document"),
    purchases = useRecords("purchase");
  const { lastSync } = useTrip();
  const [add, setAdd] = useState(false);
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Guayaquil",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const days = Math.ceil(
    (Date.parse("2026-09-14") - Date.parse(today)) / 86400000,
  );
  const day =
    Math.floor((Date.parse(today) - Date.parse("2026-09-14")) / 86400000) + 1;
  const done = packing.filter((p) => p.data.done).length;
  const sum = expenseTotal(expenses, "CAD");
  return (
    <div className="stack">
      <section className="welcome">
        <p className="eyebrow">NUESTRA PRIMERA GRAN AVENTURA 🍁</p>
        <h1>
          ¡Hola, familia
          <br />
          Hernández Sumba!
        </h1>
        <p className="muted">
          La emoción de viajar, la tranquilidad de llevarlo todo.
        </p>
      </section>
      <section className="card hero">
        <div className="row spread">
          <Badge tone="red">
            {days > 0
              ? "Cuenta regresiva"
              : today > "2026-09-25"
                ? "De vuelta en casa"
                : "En ruta"}
          </Badge>
          <span className="small">Toronto 2026</span>
        </div>
        <h2>
          {days > 0
            ? `Faltan ${days} días`
            : today > "2026-09-25"
              ? "¡Qué viaje tan bonito!"
              : `Día ${day} de aventura`}
        </h2>
        <p>
          {days > 0
            ? "para despegar rumbo al norte"
            : today > "2026-09-25"
              ? "Recuerdos guardados, cuentas claras."
              : "Disfrutemos cada parte del camino."}
        </p>
        <div className="two-cols date-grid">
          <div>
            <small>
              <PlaneTakeoff size={14} /> Salida
            </small>
            <strong>Lun 14 sep 2026</strong>
            <small>Desde Manta, Ecuador</small>
          </div>
          <div>
            <small>
              <PlaneLanding size={14} /> Llegada a Toronto
            </small>
            <strong>Mar 15 sep 2026</strong>
            <small>Aprox. 06:00 · hora local</small>
          </div>
        </div>
        <p className="small muted">Regreso a Ecuador · 25 septiembre</p>
        <span className="hero-maple" aria-hidden="true">
          🍁
        </span>
      </section>
      <Link href="/ruta" className="card route-card">
        <p className="eyebrow">
          ITINERARIO DE CONEXIONES <MapPin size={16} />
        </p>
        <div className="route-line">
          {["Manta", "Quito", "Colombia", "Toronto"].map((name, i) => (
            <div key={name}>
              <span className={`route-dot ${i === 3 ? "destination" : ""}`}>
                {i === 3 ? (
                  <MapPin size={18} />
                ) : (
                  String(i + 1).padStart(2, "0")
                )}
              </span>
              <strong>{name}</strong>
              <small>{i < 2 ? "🇪🇨" : i === 2 ? "🇨🇴" : "🇨🇦"}</small>
            </div>
          ))}
        </div>
      </Link>
      <div className="destination-row">
        <CheckCircle2 className="green-text" />
        <div>
          <strong>Toronto, Ontario</strong>
          <p className="small muted">Destino principal · con la familia</p>
        </div>
        <Badge tone="green">Confirmado</Badge>
      </div>
      <Link href="/lugares" className="destination-row">
        <HelpCircle />
        <div className="grow">
          <strong>Montreal, Quebec</strong>
          <p className="small muted">Una posible escapada por decidir</p>
        </div>
        <Badge>Por confirmar</Badge>
      </Link>
      <div className="row spread">
        <h2>Preparación del viaje</h2>
        <span className="small muted">Paso a paso</span>
      </div>
      <div className="two-cols summary-grid">
        <Link href="/gastos" className="card">
          <div className="row spread">
            <small>Total registrado</small>
            <ReceiptText size={18} />
          </div>
          <strong>{formatMoney(sum.total)}</strong>
          <small>
            {expenses.length} gastos
            {sum.missing ? ` · ${sum.missing} sin convertir` : ""}
          </small>
        </Link>
        <Link href="/equipaje" className="card">
          <div className="row spread">
            <small>Maletas familiares</small>
            <Luggage size={18} />
          </div>
          <strong>
            {done} / {packing.length}
          </strong>
          <Progress
            value={packing.length ? (done / packing.length) * 100 : 0}
          />
          <small>Prendas y esenciales</small>
        </Link>
        <Link href="/compras" className="card">
          <div className="row spread">
            <small>Compras familiares</small>
            <ShoppingBag size={18} />
          </div>
          <strong>
            {purchases.filter((p) => p.data.status === "Pendiente").length}{" "}
            pendientes
          </strong>
          <small>Detalles para quienes queremos</small>
        </Link>
        <Link href="/documentos" className="card">
          <div className="row spread">
            <small>Documentos</small>
            <FileCheck size={18} />
          </div>
          <strong className="red-text">
            {docs.filter((d) => d.data.status !== "Listo").length} por revisar
          </strong>
          <small>Antes de salir</small>
        </Link>
      </div>
      <section className="stack compact">
        <p className="eyebrow">ACCIONES RÁPIDAS</p>
        <button className="button primary full" onClick={() => setAdd(true)}>
          <PlusCircle size={20} /> Registrar nuevo gasto
        </button>
        <div className="two-cols">
          <Link href="/documentos" className="button secondary">
            <FileCheck size={18} /> Documentos
          </Link>
          <Link href="/equipaje" className="button secondary">
            <Luggage size={18} /> Ver equipaje
          </Link>
        </div>
      </section>
      <section className="card stack compact">
        <div className="row spread">
          <p className="eyebrow">VIAJEROS</p>
          <small>3 aventureros</small>
        </div>
        {[
          ["A", "Axel Hernández Menéndez"],
          ["S", "Sebastián Hernández Menéndez"],
          ["S", "Sumba Abuelita"],
        ].map(([initial, name], i) => (
          <div className="traveler" key={name}>
            <span className={`avatar avatar-${i}`}>{initial}</span>
            <span>{name}</span>
            <CheckCircle2 size={17} />
          </div>
        ))}
      </section>
      <div className="callout">
        <strong>Tu viaje también va contigo sin señal</strong>
        <p className="small">
          Abre la app con internet antes de salir. Podrás consultar lo
          descargado y guardar cambios para enviarlos al reconectarte.
        </p>
        {lastSync && (
          <small>
            Última sincronización: {new Date(lastSync).toLocaleString("es-EC")}
          </small>
        )}
      </div>
      {add && <ExpenseForm onClose={() => setAdd(false)} />}
    </div>
  );
}
