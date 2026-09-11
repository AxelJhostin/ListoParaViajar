"use client";
import { useState, type ReactNode } from "react";
import Link from "@/components/nav-link";
import { usePathname } from "next/navigation";
import {
  Home,
  ReceiptText,
  ShoppingBag,
  Luggage,
  LayoutGrid,
  ArrowLeftRight,
  CloudCheck,
  CloudOff,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { useTrip } from "./trip-provider";
import { Converter } from "@/features/converter/converter";
import { Pwa } from "./pwa";
const nav = [
  { path: "/", label: "Resumen", icon: Home },
  { path: "/gastos", label: "Gastos", icon: ReceiptText },
  { path: "/compras", label: "Compras", icon: ShoppingBag },
  { path: "/equipaje", label: "Equipaje", icon: Luggage },
  { path: "/mas", label: "Más", icon: LayoutGrid },
];
export function AppShell({ children }: { children: ReactNode }) {
  const path = usePathname(),
    [converter, setConverter] = useState(false);
  const { online, pending, status, error, ready, lastSync } = useTrip();
  const titles: Record<string, string> = {
    "/documentos": "Documentos",
    "/ruta": "Ruta y vuelos",
    "/lugares": "Días libres",
    "/estadisticas": "Estadísticas",
    "/ajustes": "Ajustes",
    "/reportes": "Reportes",
  };
  const title =
    nav.find((n) => n.path === path)?.label || titles[path] || "El viaje";
  const state = !online
    ? "Sin conexión"
    : status === "syncing"
      ? "Sincronizando"
      : pending.length
        ? `${pending.length} pendientes`
        : error
          ? "Revisar conexión"
          : lastSync
            ? "Sincronizado"
            : "Por sincronizar";
  const Icon = !online
    ? CloudOff
    : status === "syncing"
      ? RefreshCw
      : error || pending.length
        ? AlertCircle
        : CloudCheck;
  return (
    <>
      <a className="skip-link" href="#contenido">
        Saltar al contenido
      </a>
      <header className="topbar">
        <Link className="brand" href="/">
          <img src="/logo.svg" width="36" height="36" alt="" />
          <span>
            <small>Listo para viajar</small>
            <strong>{title}</strong>
          </span>
        </Link>
        <Link
          href="/ajustes"
          className={`badge ${error || pending.length ? "amber" : "green"}`}
        >
          <Icon size={14} />
          <span>{state}</span>
        </Link>
      </header>
      <aside className="desktop-intro">
        <span className="eyebrow">CANADA · 2026</span>
        <h2>
          Un viaje.
          <br />
          Mil recuerdos.
        </h2>
        <p>Nuestra bitácora familiar, de Manta a Toronto.</p>
        <div className="route-stamp">
          14 — 25
          <br />
          <small>SEPTIEMBRE</small>
        </div>
      </aside>
      <main id="contenido" className="main-content">
        {!ready ? (
          <div className="empty" role="status">
            Preparando tu bitácora…
          </div>
        ) : (
          children
        )}
      </main>
      <button
        className="converter-fab"
        aria-label="Abrir conversor CAD a USD"
        onClick={() => setConverter(true)}
      >
        <ArrowLeftRight size={24} />
      </button>
      <nav className="bottom-nav" aria-label="Navegación principal">
        {nav.map((n) => {
          const active =
            n.path === path ||
            (n.path === "/mas" && !nav.some((p) => p.path === path));
          return (
            <Link
              key={n.path}
              href={n.path}
              prefetch={false}
              aria-current={active ? "page" : undefined}
              className={active ? "active" : ""}
            >
              <n.icon size={22} />
              <span>{n.label}</span>
            </Link>
          );
        })}
      </nav>
      {converter && <Converter onClose={() => setConverter(false)} />}
      <Pwa />
    </>
  );
}
