import type { ReactNode } from "react";
import { Plus, Search } from "lucide-react";
export function Empty({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: () => void;
}) {
  return (
    <div className="empty card">
      <div className="empty-icon">🍁</div>
      <h2>{title}</h2>
      <p>{body}</p>
      {action && (
        <button className="button primary" onClick={action}>
          <Plus size={18} /> Agregar el primero
        </button>
      )}
    </div>
  );
}
export function PageHeading({
  eyebrow,
  title,
  body,
  children,
}: {
  eyebrow?: string;
  title: string;
  body?: string;
  children?: ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {body && <p className="muted">{body}</p>}
      </div>
      {children}
    </div>
  );
}
export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}
export function SearchBox({
  value,
  onChange,
  placeholder = "Buscar…",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="search">
      <Search size={18} />
      <input
        aria-label={placeholder}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "green" | "red" | "amber" | "neutral";
}) {
  return <span className={`badge ${tone}`}>{children}</span>;
}
export function Progress({ value }: { value: number }) {
  return (
    <div
      className="progress"
      role="progressbar"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Progreso"
    >
      <span style={{ width: `${value}%` }} />
    </div>
  );
}
