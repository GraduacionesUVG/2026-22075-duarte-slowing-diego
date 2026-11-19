import { useCallback, useEffect, useState } from "react";
import { ApiError, opsApi, type IntegrationsHealth } from "@repo/api-client";

// El backend cachea 60 s: consultar más seguido no aporta datos nuevos.
const REFRESH_MS = 60_000;

function explain(e: unknown): string {
  if (e instanceof ApiError && e.status === 404) {
    return "El backend desplegado todavía no tiene GET /health/integrations. Falta publicar la versión nueva.";
  }
  if (e instanceof ApiError && e.status === 403) {
    return "Solo las cuentas Dev/TI (superadmin) pueden ver el estado de las integraciones.";
  }
  return e instanceof Error && e.message
    ? `No se pudo consultar el estado de las integraciones: ${e.message}`
    : "No se pudo consultar el estado de las integraciones.";
}

// Estado de OpenAI y de la WhatsApp Cloud API (páginas de estado públicas + validez de nuestras llaves).
export function useIntegrationsHealth() {
  const [data, setData] = useState<IntegrationsHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (force: boolean) => {
    try {
      setData(await opsApi.integrationsHealth({ probe: true, refresh: force }));
      setError(null);
    } catch (e) {
      // Se conserva el último resultado bueno (si lo hay) y se avisa del fallo.
      setError(explain(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(false);
    const timer = setInterval(() => void load(false), REFRESH_MS);
    return () => clearInterval(timer);
  }, [load]);

  // "Verificar ahora": ignora el caché del backend.
  const refresh = useCallback(async () => {
    setRefreshing(true);
    await load(true);
    setRefreshing(false);
  }, [load]);

  return { data, loading, refreshing, error, refresh };
}
