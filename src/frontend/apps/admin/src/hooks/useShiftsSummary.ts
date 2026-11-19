import { useCallback, useEffect, useRef, useState } from "react";
import { adminApi, type AdminKdsUser, type AdminShiftsDay, type ShiftSummary } from "@repo/api-client";

// Fecha de hoy en Guatemala (UTC-6, sin horario de verano).
export function guatemalaToday(): string {
  return new Date(Date.now() - 6 * 3600_000).toISOString().slice(0, 10);
}

function errorMessage(e: unknown, fallback: string): string {
  return e instanceof Error && e.message ? e.message : fallback;
}

// Resumen de turnos del día para el admin (base para la facturación de las estaciones).
export function useShiftsSummary() {
  const [date, setDate] = useState(guatemalaToday);
  // "" = todas las estaciones.
  const [stationId, setStationId] = useState("");
  const [stations, setStations] = useState<AdminKdsUser[]>([]);
  const [day, setDay] = useState<AdminShiftsDay | null>(null);
  // Cliente de cada pedido (id del pedido -> quién lo pidió), cruzado con /api/admin/orders.
  const [customers, setCustomers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<ShiftSummary | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  // Descarta respuestas de una consulta vieja si el admin ya cambió de fecha, estación o turno.
  const requestRef = useRef(0);
  const detailRequestRef = useRef(0);

  useEffect(() => {
    adminApi
      .listKdsUsers()
      .then(setStations)
      .catch(() => setStations([]));
  }, []);

  const load = useCallback(async () => {
    const request = ++requestRef.current;
    setLoading(true);
    try {
      const [data, orders] = await Promise.all([
        adminApi.listShifts(date, stationId || undefined),
        // El nombre del cliente es un extra: si falla, la tabla muestra "—".
        adminApi.listOrders(date).catch(() => []),
      ]);
      if (request !== requestRef.current) return;
      setCustomers(Object.fromEntries(orders.map((o) => [o.id, o.student_id])));
      setDay(data);
      setError(null);
    } catch (e) {
      if (request !== requestRef.current) return;
      setError(errorMessage(e, "No se pudo cargar el resumen de turnos."));
    } finally {
      if (request === requestRef.current) setLoading(false);
    }
  }, [date, stationId]);

  useEffect(() => {
    setSelectedId(null);
    void load();
  }, [load]);

  useEffect(() => {
    const request = ++detailRequestRef.current;
    if (!selectedId) {
      setDetail(null);
      setDetailError(null);
      setDetailLoading(false);
      return;
    }
    setDetailLoading(true);
    setDetailError(null);
    adminApi
      .getShift(selectedId)
      .then((data) => {
        if (request === detailRequestRef.current) setDetail(data);
      })
      .catch((e) => {
        if (request === detailRequestRef.current) setDetailError(errorMessage(e, "No se pudo cargar el turno."));
      })
      .finally(() => {
        if (request === detailRequestRef.current) setDetailLoading(false);
      });
  }, [selectedId]);

  return {
    date,
    setDate,
    stationId,
    setStationId,
    stations,
    day,
    customers,
    loading,
    error,
    reload: load,
    selectedId,
    selectShift: setSelectedId,
    detail,
    detailLoading,
    detailError,
  };
}
