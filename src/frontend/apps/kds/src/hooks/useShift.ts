import { useCallback, useEffect, useRef, useState } from "react";
import {
  ApiError,
  kdsApi,
  shiftErrorCode,
  type CurrentShift,
  type Shift,
  type ShiftSocketEvent,
  type ShiftSummary,
} from "@repo/api-client";

// Resumen parcial de los KPIs y las pausas mientras el turno está abierto.
const REFRESH_INTERVAL_MS = 60_000;

type UseShiftOptions = {
  token: string | null;
  onUnauthorized: () => void;
};

// Fecha de hoy en Guatemala (UTC-6, sin horario de verano) para pedir los turnos del día.
function guatemalaToday(): string {
  return new Date(Date.now() - 6 * 3600_000).toISOString().slice(0, 10);
}

export type ShiftBusy = "start" | "end" | "pause" | null;

// Turno de la estación (docs/HANDOFF_TURNOS_KDS.md): decide qué pantalla se ve (iniciar turno,
// panel de pedidos o resumen) y es dueño de pausar/reanudar, que solo existe dentro de un turno.
export function useShift({ token, onUnauthorized }: UseShiftOptions) {
  const [current, setCurrent] = useState<CurrentShift | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<ShiftBusy>(null);
  const [error, setError] = useState<string | null>(null);
  // Resumen que se está mostrando (al cerrar el turno o al abrir uno cerrado desde un aviso).
  const [summary, setSummary] = useState<ShiftSummary | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  // Turno que se cerró al iniciar uno nuevo, o que otra pantalla cerró: aviso con enlace al resumen.
  const [closedNotice, setClosedNotice] = useState<Shift | null>(null);
  // Número que tendrá el próximo turno del día (cantidad de turnos de hoy + 1).
  const [nextShiftNo, setNextShiftNo] = useState<number | null>(null);

  const busyRef = useRef<ShiftBusy>(null);
  const unauthorizedRef = useRef(onUnauthorized);
  unauthorizedRef.current = onUnauthorized;
  const currentRef = useRef(current);
  currentRef.current = current;

  const fail = useCallback((e: unknown, fallback: string) => {
    if (e instanceof ApiError && e.status === 401) {
      unauthorizedRef.current();
      return;
    }
    setError(e instanceof Error && e.message ? e.message : fallback);
  }, []);

  const refresh = useCallback(async () => {
    try {
      const data = await kdsApi.currentShift();
      setCurrent(data);
      if (!data.shift) {
        const today = await kdsApi.listShifts(guatemalaToday()).catch(() => null);
        setNextShiftNo(today ? today.length + 1 : null);
      }
    } catch (e) {
      fail(e, "No se pudo cargar el turno.");
    } finally {
      setLoading(false);
    }
  }, [fail]);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    void refresh();
    const timer = setInterval(() => void refresh(), REFRESH_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [token, refresh]);

  // Corre una acción de turno de una en una: un segundo toque mientras tanto se ignora.
  const exclusive = useCallback(async (kind: Exclude<ShiftBusy, null>, action: () => Promise<void>) => {
    if (busyRef.current) return;
    busyRef.current = kind;
    setBusy(kind);
    setError(null);
    try {
      await action();
    } finally {
      busyRef.current = null;
      setBusy(null);
    }
  }, []);

  // Los 409 de turno ya dicen qué pasó (`detail.message`); si otra pantalla cambió el turno, se recarga.
  const handleConflict = useCallback(
    async (e: unknown, fallback: string) => {
      const code = shiftErrorCode(e);
      if (e instanceof ApiError && e.status === 409 && code) {
        setError(e.message);
        if (code !== "pending_requests") await refresh();
        return;
      }
      fail(e, fallback);
    },
    [fail, refresh],
  );

  const start = useCallback(
    () =>
      exclusive("start", async () => {
        try {
          const result = await kdsApi.startShift();
          setSummary(null);
          setClosedNotice(result.previous_shift_closed);
          await refresh();
        } catch (e) {
          await handleConflict(e, "No se pudo iniciar el turno.");
        }
      }),
    [exclusive, refresh, handleConflict],
  );

  const end = useCallback(
    () =>
      exclusive("end", async () => {
        try {
          const result = await kdsApi.endShift();
          setSummary(result);
          await refresh();
        } catch (e) {
          await handleConflict(e, "No se pudo finalizar el turno.");
        }
      }),
    [exclusive, refresh, handleConflict],
  );

  // Pausar y reanudar no piden confirmación; solo el turno abierto puede pausarse.
  const togglePause = useCallback(
    () =>
      exclusive("pause", async () => {
        const data = currentRef.current;
        if (!data?.shift) return;
        const paused = data.shift.pausas.en_pausa || !data.station_active;
        try {
          await kdsApi.setActive(paused);
          await refresh();
        } catch (e) {
          await handleConflict(e, "No se pudo cambiar el estado de la estación.");
        }
      }),
    [exclusive, refresh, handleConflict],
  );

  const openSummary = useCallback(
    async (shiftId: string) => {
      setLoadingSummary(true);
      setError(null);
      try {
        setSummary(await kdsApi.getShift(shiftId));
        setClosedNotice(null);
      } catch (e) {
        fail(e, "No se pudo cargar el resumen del turno.");
      } finally {
        setLoadingSummary(false);
      }
    },
    [fail],
  );

  const closeSummary = useCallback(() => setSummary(null), []);
  const dismissNotice = useCallback(() => setClosedNotice(null), []);
  const clearError = useCallback(() => setError(null), []);

  // `shift_status` y `station_status` llegan por el WebSocket de la cocina (de todas las estaciones
  // del local): solo cuentan los de esta estación.
  const handleSocketEvent = useCallback(
    (event: ShiftSocketEvent) => {
      const ownId = currentRef.current?.shift?.kds_user_id;
      if (ownId && event.kds_user_id !== ownId) return;
      // La acción propia ya refresca al terminar.
      if (busyRef.current) return;
      if (event.type === "shift_status" && event.status === "closed" && ownId) {
        setClosedNotice(event.shift);
      }
      void refresh();
    },
    [refresh],
  );

  const shift = current?.shift ?? null;
  // La estación puede quedar inactiva después de un cierre; eso no es una pausa (no hay turno).
  const paused = shift !== null && (shift.pausas.en_pausa || current?.station_active === false);
  const openPause = shift?.pausas.en_pausa ? (shift.pausas.detalle[shift.pausas.detalle.length - 1] ?? null) : null;

  return {
    loading,
    shift,
    kpis: current?.kpis ?? null,
    pendientes: current?.pendientes ?? { por_aceptar: 0, en_curso: 0 },
    paused,
    openPause,
    nextShiftNo,
    busy,
    error,
    summary,
    loadingSummary,
    closedNotice,
    start,
    end,
    togglePause,
    openSummary,
    closeSummary,
    dismissNotice,
    clearError,
    refresh,
    handleSocketEvent,
  };
}
