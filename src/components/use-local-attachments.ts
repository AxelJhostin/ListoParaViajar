"use client";
import { useEffect, useState } from "react";
import { localDB } from "@/local/database";
export function useLocalAttachments() {
  const [counts, setCounts] = useState<Record<string, number>>({});
  useEffect(() => {
    const reload = () =>
      void localDB()
        .then(async (db) => {
          const result: Record<string, number> = {};
          let cursor = await db
            .transaction("photos")
            .store.index("by-record")
            .openKeyCursor();
          while (cursor) {
            result[cursor.key] = (result[cursor.key] || 0) + 1;
            cursor = await cursor.continue();
          }
          setCounts(result);
        })
        .catch(() => {});
    reload();
    window.addEventListener("trip-change", reload);
    return () => window.removeEventListener("trip-change", reload);
  }, []);
  return counts;
}
