import Link from "@/components/nav-link";
import {
  FileCheck,
  Route,
  Compass,
  ChartColumn,
  FileDown,
  Settings,
  MapPinned,
  ChevronRight,
  CalendarClock,
  ShieldAlert,
  BookHeart,
} from "lucide-react";
import { PageHeading } from "@/components/ui";
const links = [
  [
    "/hoy",
    "Modo Hoy",
    "Próximo vuelo, acciones y relojes locales",
    CalendarClock,
  ],
  [
    "/documentos",
    "Documentos esenciales",
    "Papeles listos para cada trayecto",
    FileCheck,
  ],
  ["/ruta", "Ruta y vuelos", "Manta → Quito → Bogotá → Toronto", Route],
  [
    "/emergencia",
    "Paquete de emergencia",
    "Vuelos, contactos y documentos en una vista",
    ShieldAlert,
  ],
  ["/diario", "Diario del viaje", "Historias y fotos de cada día", BookHeart],
  ["/info", "Información del viaje", "Hospedaje, contactos y notas", MapPinned],
  ["/lugares", "Días libres", "Lugares e ideas por descubrir", Compass],
  ["/estadisticas", "Estadísticas", "Nuestra aventura en números", ChartColumn],
  ["/reportes", "Reportes", "Cuentas claras para compartir", FileDown],
  ["/ajustes", "Ajustes", "Tema, sincronización y respaldos", Settings],
] as const;
export default function Page() {
  return (
    <div className="stack">
      <PageHeading
        eyebrow="TODO A MANO"
        title="Más del viaje"
        body="Pequeños detalles, mucha tranquilidad."
      />
      {links.map(([href, title, body, Icon]) => (
        <Link href={href} key={href} className="card menu-item">
          <span className="record-icon">
            <Icon size={23} />
          </span>
          <div className="grow">
            <h2>{title}</h2>
            <p className="muted small">{body}</p>
          </div>
          <ChevronRight size={18} />
        </Link>
      ))}
    </div>
  );
}
