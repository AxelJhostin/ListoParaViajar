"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="empty card">
      <h1>No pudimos abrir esta pantalla</h1>
      <p>Tus registros guardados permanecen en este dispositivo.</p>
      <button className="button primary" onClick={reset}>
        Volver a intentar
      </button>
    </div>
  );
}
