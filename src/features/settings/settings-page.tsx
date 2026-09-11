"use client";
import { useEffect, useState } from "react";
import {
  RefreshCw,
  Download,
  Upload,
  Sun,
  Moon,
  Monitor,
  CloudCheck,
} from "lucide-react";
import { useTrip } from "@/components/trip-provider";
import { PageHeading } from "@/components/ui";
import { resolveConflict } from "@/local/sync";
import { exportBackup, importBackup } from "@/local/backup";
export function SettingsPage() {
  const { pending, error, lastSync, sync, notify } = useTrip();
  const [theme, setTheme] = useState("auto"),
    [storage, setStorage] = useState(""),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    setTheme(localStorage.getItem("trip-theme") || "auto");
    void navigator.storage
      ?.estimate()
      .then((s) =>
        setStorage(
          `${((s.usage || 0) / 1024 / 1024).toFixed(1)} MB utilizados en este dispositivo`,
        ),
      );
    const media = matchMedia("(prefers-color-scheme: dark)");
    const change = () => {
      if ((localStorage.getItem("trip-theme") || "auto") === "auto")
        document.documentElement.dataset.theme = media.matches
          ? "dark"
          : "light";
    };
    media.addEventListener("change", change);
    return () => media.removeEventListener("change", change);
  }, []);
  function changeTheme(value: string) {
    setTheme(value);
    localStorage.setItem("trip-theme", value);
    document.documentElement.dataset.theme =
      value === "auto"
        ? matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
        : value;
  }
  async function action(fn: () => Promise<unknown>) {
    setBusy(true);
    try {
      await fn();
    } catch (e) {
      notify(
        e instanceof Error ? e.message : "No se pudo completar la operación.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="stack">
      <PageHeading
        eyebrow="A TU MANERA"
        title="Ajustes"
        body="Todo listo, incluso cuando no hay señal."
      />
      <section className="card stack">
        <h2>Apariencia</h2>
        <div className="theme-options">
          {[
            ["auto", "Automático", Monitor],
            ["light", "Claro", Sun],
            ["dark", "Oscuro", Moon],
          ].map(([value, label, Icon]) => {
            const ThemeIcon = Icon as typeof Sun;
            return (
              <button
                key={String(value)}
                aria-pressed={theme === value}
                className={theme === value ? "selected" : ""}
                onClick={() => changeTheme(String(value))}
              >
                <ThemeIcon size={22} />
                {String(label)}
              </button>
            );
          })}
        </div>
      </section>
      <section className="card stack">
        <h2>
          <CloudCheck size={22} /> Sincronización
        </h2>
        <p>{pending.length} cambios pendientes</p>
        <p className="small muted">
          Última sincronización:{" "}
          {lastSync
            ? new Date(lastSync).toLocaleString("es-EC")
            : "Todavía no sincronizado"}
        </p>
        {error && (
          <p className="callout" role="alert">
            {error}
          </p>
        )}
        <button
          className="button primary"
          disabled={busy}
          onClick={() => void action(sync)}
        >
          <RefreshCw size={18} /> Sincronizar ahora
        </button>
        {pending
          .filter((p) => "conflict" in p)
          .map((p) => (
            <div className="conflict" key={p.record.id}>
              <h3>Revisar cambios: {p.record.data.description}</h3>
              <p className="small">
                Hay una versión distinta en otro dispositivo. Elige cuál
                conservar.
              </p>
              <details>
                <summary>Comparar versiones</summary>
                <p className="small">Este dispositivo</p>
                <pre>{JSON.stringify(p.record.data, null, 2)}</pre>
                <p className="small">Versión compartida</p>
                <pre>{JSON.stringify(p.conflict?.data || null, null, 2)}</pre>
              </details>
              <div className="two-cols">
                <button
                  className="button secondary"
                  onClick={() =>
                    void action(() => resolveConflict(p.record.id, false))
                  }
                >
                  Usar compartida
                </button>
                <button
                  className="button primary"
                  onClick={() =>
                    void action(() => resolveConflict(p.record.id, true))
                  }
                >
                  Conservar mi cambio
                </button>
              </div>
            </div>
          ))}
      </section>
      <section className="card stack">
        <h2>Respaldo y fotos locales</h2>
        <p className="small muted">
          {storage || "Almacenamiento en este navegador"}
        </p>
        <p className="small">
          Las fotos y los PDF no se comparten automáticamente con otros
          celulares. Borrar los datos del navegador elimina esos adjuntos y los
          cambios pendientes.
        </p>
        <button
          className="button secondary"
          disabled={busy}
          onClick={() => void action(exportBackup)}
        >
          <Download size={18} /> Descargar respaldo con adjuntos
        </button>
        <label className="button secondary">
          <Upload size={18} /> Importar respaldo
          <input
            type="file"
            accept=".zip"
            hidden
            disabled={busy}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (
                file &&
                confirm(
                  "Se agregarán registros y adjuntos que no estén en este dispositivo. Los existentes se conservan. ¿Continuar?",
                )
              )
                void action(async () => {
                  const n = await importBackup(file);
                  notify(`Respaldo importado: ${n} registros agregados.`);
                  await sync();
                });
              e.target.value = "";
            }}
          />
        </label>
        <button
          className="text-button"
          onClick={() =>
            void action(async () => {
              const granted = await navigator.storage?.persist();
              notify(
                granted
                  ? "El navegador concedió almacenamiento persistente."
                  : "El navegador no concedió persistencia. Conserva una copia descargada.",
              );
            })
          }
        >
          Solicitar conservar almacenamiento
        </button>
        {busy && <p role="status">Procesando…</p>}
      </section>
      <section className="card stack">
        <h2>Instalar en el celular</h2>
        <p>
          <strong>Android:</strong> abre el menú de Chrome y elige “Instalar
          aplicación” o “Agregar a pantalla principal”.
        </p>
        <p>
          <strong>iPhone:</strong> en Safari, abre Compartir → “Agregar a
          inicio”.
        </p>
        <p className="small muted">
          Abre la app con internet después de instalarla. Mantén la misma
          dirección web para conservar el almacenamiento local. La
          sincronización se reanuda al abrir la app con conexión; el teléfono
          puede suspenderla cuando está cerrada.
        </p>
      </section>
      <p className="small muted center">
        Listo Para Viajar · 1.0.0
        <br />
        Hecho para nuestra aventura familiar 🍁
      </p>
    </div>
  );
}
