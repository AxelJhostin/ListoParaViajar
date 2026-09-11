"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  localDB,
  getRate,
  saveLocal,
  setRate,
  type Pending,
} from "@/local/database";
import { syncNow } from "@/local/sync";
import {
  rateSchema,
  schemas,
  type DataMap,
  type Kind,
  type Rate,
  type TripRecord,
} from "@/domain/models";
type Context = {
  records: TripRecord[];
  pending: Pending[];
  ready: boolean;
  error: string;
  status: string;
  lastSync: string;
  online: boolean;
  rate: Rate | null;
  notice: string;
  notify: (text: string) => void;
  save: <K extends Kind>(
    kind: K,
    data: DataMap[K],
    existing?: TripRecord<K>,
  ) => Promise<TripRecord<K>>;
  remove: (record: TripRecord) => Promise<void>;
  refreshRate: () => Promise<void>;
  sync: () => Promise<void>;
};
const TripContext = createContext<Context | null>(null);
export const useTrip = () => {
  const c = useContext(TripContext);
  if (!c) throw new Error("TripProvider missing");
  return c;
};
export function useRecords<K extends Kind>(kind: K) {
  return useTrip().records.filter(
    (r) => r.kind === kind && !r.deleted,
  ) as TripRecord<K>[];
}
export function TripProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState({
    records: [] as TripRecord[],
    pending: [] as Pending[],
    ready: false,
    error: "",
    status: "ready",
    lastSync: "",
    rate: null as Rate | null,
  });
  const [online, setOnline] = useState(true),
    [notice, notify] = useState("");
  const reload = useCallback(async () => {
    try {
      const db = await localDB();
      const [records, pending, error, status, lastSync, rate] =
        await Promise.all([
          db.getAll("records"),
          db.getAll("outbox"),
          db.get("meta", "syncError"),
          db.get("meta", "syncStatus"),
          db.get("meta", "lastSync"),
          getRate(),
        ]);
      setState({
        records,
        pending,
        ready: true,
        error: String(error || ""),
        status: String(status || "ready"),
        lastSync: String(lastSync || ""),
        rate,
      });
    } catch {
      setState((s) => ({
        ...s,
        ready: true,
        error:
          "No se pudo abrir el almacenamiento local. Comprueba el espacio y los permisos del navegador.",
      }));
    }
  }, []);
  const refreshRate = useCallback(async () => {
    try {
      const response = await fetch("/api/rate", {
        signal: AbortSignal.timeout(12000),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      await setRate(rateSchema.parse(result));
    } catch (e) {
      notify(e instanceof Error ? e.message : "Tasa no disponible.");
    }
  }, []);
  useEffect(() => {
    void reload();
    setOnline(navigator.onLine);
    void syncNow();
    void refreshRate();
    const change = () => void reload(),
      reconnect = () => {
        setOnline(navigator.onLine);
        if (navigator.onLine) void syncNow();
      },
      focus = () => {
        if (document.visibilityState === "visible") void syncNow();
      };
    const ch = new BroadcastChannel("trip");
    ch.onmessage = change;
    window.addEventListener("trip-change", change);
    window.addEventListener("online", reconnect);
    window.addEventListener("offline", reconnect);
    document.addEventListener("visibilitychange", focus);
    const timer = setInterval(() => {
      if (navigator.onLine && document.visibilityState === "visible")
        void syncNow();
    }, 15000);
    return () => {
      clearInterval(timer);
      ch.close();
      window.removeEventListener("trip-change", change);
      window.removeEventListener("online", reconnect);
      window.removeEventListener("offline", reconnect);
      document.removeEventListener("visibilitychange", focus);
    };
  }, [reload, refreshRate]);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => notify(""), 6000);
    return () => clearTimeout(timer);
  }, [notice]);
  async function save<K extends Kind>(
    kind: K,
    data: DataMap[K],
    existing?: TripRecord<K>,
  ) {
    const parsed = schemas[kind].parse(data) as DataMap[K];
    const current = existing ? await (await localDB()).get('records', existing.id) : undefined;
    // Acknowledgment may advance the version while the saved form stays open.
    // Rebase only if its baseline data is unchanged; real remote edits still conflict.
    const baseVersion = current && existing && JSON.stringify(current.data) === JSON.stringify(existing.data)
      ? current.version : existing?.version || 0;
    const record = {
      id: existing?.id || crypto.randomUUID(),
      kind,
      data: parsed,
      version: baseVersion,
      updatedAt: new Date().toISOString(),
      deleted: false,
    };
    await saveLocal(record);
    await reload();
    void syncNow();
    notify("Guardado en este dispositivo.");
    return record;
  }
  async function remove(record: TripRecord) {
    await saveLocal({ ...record, deleted: true });
    await reload();
    void syncNow();
    notify("Registro eliminado.");
  }
  return (
    <TripContext.Provider
      value={{
        ...state,
        online,
        notice,
        notify,
        save,
        remove,
        refreshRate,
        sync: syncNow,
      }}
    >
      {children}
      {notice && (
        <div role="status" className="toast">
          {notice}
        </div>
      )}
    </TripContext.Provider>
  );
}
