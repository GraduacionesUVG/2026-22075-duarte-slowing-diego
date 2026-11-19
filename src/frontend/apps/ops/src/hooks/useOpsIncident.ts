import { useCallback, useEffect, useRef, useState } from "react";
import { opsApi } from "@repo/api-client";

const POLL_MS = 15_000;
const MAX_SAMPLES = 20;

export type HealthSample = { ms: number | null; at: number };

// Vigila GET /health/ (API + MongoDB). La caída se declara cuando la API no responde
// o reporta la base de datos desconectada; las muestras alimentan la gráfica de latencia.
export function useOpsIncident() {
  const [samples, setSamples] = useState<HealthSample[]>([]);
  const [apiReachable, setApiReachable] = useState(true);
  const [dbConnected, setDbConnected] = useState(true);
  const [isDown, setIsDown] = useState(false);
  const [downSince, setDownSince] = useState<number | null>(null);
  const [lastOkAt, setLastOkAt] = useState<number | null>(null);
  const [retrying, setRetrying] = useState(false);
  const [checked, setChecked] = useState(false);
  const downRef = useRef(false);

  const check = useCallback(async () => {
    const started = performance.now();
    let ms: number | null = null;
    let ok = false;
    let db = false;
    try {
      const health = await opsApi.health();
      ms = Math.round(performance.now() - started);
      db = health.database_connected;
      ok = health.status === "OK" && db;
    } catch {
      // sin respuesta: se cuenta como caída
    }
    const now = Date.now();
    setSamples((prev) => [...prev, { ms, at: now }].slice(-MAX_SAMPLES));
    setApiReachable(ms !== null);
    setDbConnected(ms !== null && db);
    if (ok) setLastOkAt(now);
    if (!ok && !downRef.current) setDownSince(now);
    if (ok) setDownSince(null);
    downRef.current = !ok;
    setIsDown(!ok);
    setChecked(true);
  }, []);

  useEffect(() => {
    void check();
    const timer = setInterval(() => void check(), POLL_MS);
    return () => clearInterval(timer);
  }, [check]);

  const retryConnection = useCallback(async () => {
    setRetrying(true);
    await check();
    setRetrying(false);
  }, [check]);

  return { isDown, checked, apiReachable, dbConnected, downSince, lastOkAt, samples, retrying, retryConnection };
}

export type OpsHealth = ReturnType<typeof useOpsIncident>;
