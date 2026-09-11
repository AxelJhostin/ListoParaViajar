"use client";
import { useEffect, useState } from "react";
export function Pwa() {
  const [update, setUpdate] = useState<ServiceWorker | null>(null);
  useEffect(() => {
    if (
      process.env.NODE_ENV !== "production" ||
      !("serviceWorker" in navigator)
    )
      return;
    void navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        if (reg.waiting) setUpdate(reg.waiting);
        reg.addEventListener("updatefound", () => {
          const worker = reg.installing;
          worker?.addEventListener("statechange", () => {
            if (
              worker.state === "installed" &&
              navigator.serviceWorker.controller
            )
              setUpdate(worker);
          });
        });
      })
      .catch(() => {});
  }, []);
  if (!update) return null;
  return (
    <div className="update-banner" role="status">
      Hay una versión nueva. Guarda el formulario antes de actualizar.
      <button
        className="button secondary"
        onClick={() => {
          navigator.serviceWorker.addEventListener(
            "controllerchange",
            () => location.reload(),
            { once: true },
          );
          update.postMessage("SKIP_WAITING");
        }}
      >
        Actualizar
      </button>
    </div>
  );
}
