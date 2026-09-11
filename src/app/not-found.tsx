import Link from "@/components/nav-link";
export default function NotFound() {
  return (
    <div className="empty card">
      <h1>Nos salimos de la ruta</h1>
      <p>Esta página no existe.</p>
      <Link className="button primary" href="/">
        Volver al resumen
      </Link>
    </div>
  );
}
