import { useCallback, useEffect, useMemo, useState } from "react";
import { opsApi, type GlobalKpis, type OrderEvent, type TiKdsUser, type TiRestaurant } from "@repo/api-client";
import type { BadgeStatus } from "../components/StatusBadge";
import type { OpsHealth } from "./useOpsIncident";
import { clock, guatemalaDate } from "../lib/format";
import { describeEvent } from "../lib/events";

export type HealthCard = {
  name: string;
  value: string;
  detail: string;
  status: BadgeStatus;
  statusLabel: string;
};

export type LatencyPoint = {
  pct: number;
  warn: boolean;
};

export type FunnelStat = {
  name: string;
  value: string;
  pct: number;
  color: string;
};

export type EventRow = {
  time: string;
  event: string;
  restaurant: string;
  message: string;
  result: string;
};

const REFRESH_MS = 30_000;
const LATENCY_CEILING_MS = 1500;
const LATENCY_WARN_MS = 800;
const RECENT_EVENTS = 8;
const FUNNEL_DAYS = 7;

const pctOf = (n: number, total: number) => (total > 0 ? Math.round((n / total) * 100) : 0);

// Estado del sistema a partir de lo que el backend expone: /health/, estaciones KDS,
// eventos de pedidos del día y KPIs globales.
export function useAgentStatus(health: OpsHealth) {
  const [stations, setStations] = useState<TiKdsUser[]>([]);
  const [restaurants, setRestaurants] = useState<TiRestaurant[]>([]);
  const [events, setEvents] = useState<OrderEvent[]>([]);
  const [kpis, setKpis] = useState<GlobalKpis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [st, rs, ev, k] = await Promise.all([
        opsApi.listKdsUsers(),
        opsApi.listRestaurants(),
        opsApi.listEvents(guatemalaDate()),
        opsApi.globalKpis(guatemalaDate(FUNNEL_DAYS - 1), guatemalaDate()),
      ]);
      setStations(st);
      setRestaurants(rs);
      setEvents(ev.events);
      setKpis(k);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo cargar el estado del sistema.");
    }
  }, []);

  useEffect(() => {
    void load();
    const timer = setInterval(() => void load(), REFRESH_MS);
    return () => clearInterval(timer);
  }, [load]);

  const { isDown, apiReachable, dbConnected, samples, lastOkAt, checked } = health;
  const lastMs = apiReachable ? ([...samples].reverse().find((s) => s.ms !== null)?.ms ?? null) : null;

  const cards: HealthCard[] = useMemo(() => {
    const connected = stations.filter((s) => s.connected).length;
    const active = stations.filter((s) => s.active).length;
    const lastEvent = events[0];
    return [
      {
        name: "API del backend",
        value: !checked ? "Verificando…" : lastMs === null ? "Sin respuesta" : `${lastMs} ms`,
        detail: isDown ? `Último OK a las ${lastOkAt ? clock(lastOkAt) : "—"}` : "GET /health/ responde 200",
        status: !checked ? "info" : isDown ? "error" : "success",
        statusLabel: !checked ? "…" : isDown ? "Caída" : "Operativa",
      },
      {
        name: "MongoDB",
        value: !apiReachable ? "Desconocido" : dbConnected ? "Conectada" : "Sin conexión",
        detail: apiReachable ? "Reportado por /health/" : "No se puede consultar: la API no responde",
        status: !checked ? "info" : dbConnected ? "success" : "error",
        statusLabel: !checked ? "…" : dbConnected ? "Operativa" : "Caída",
      },
      {
        name: "Estaciones KDS",
        value: `${connected} de ${stations.length} conectadas`,
        detail: `${active} activas · ${restaurants.length} restaurantes`,
        status: stations.length === 0 ? "info" : connected === 0 ? "warning" : "success",
        statusLabel: stations.length === 0 ? "Sin estaciones" : connected === 0 ? "Ninguna conectada" : "En línea",
      },
      {
        name: "Eventos de pedidos hoy",
        value: String(events.length),
        detail: lastEvent ? `Último a las ${clock(lastEvent.created_at)}` : "Sin actividad todavía",
        status: events.length > 0 ? "success" : "info",
        statusLabel: events.length > 0 ? "Con actividad" : "Sin actividad",
      },
    ];
  }, [stations, restaurants, events, isDown, apiReachable, dbConnected, lastMs, lastOkAt, checked]);

  const latency: LatencyPoint[] = useMemo(
    () =>
      samples.map((s) => ({
        // Una muestra sin respuesta se dibuja al tope en ámbar.
        pct: s.ms === null ? 100 : Math.max(4, Math.round((Math.min(s.ms, LATENCY_CEILING_MS) / LATENCY_CEILING_MS) * 100)),
        warn: s.ms === null || s.ms > LATENCY_WARN_MS,
      })),
    [samples],
  );

  const ok = samples.filter((s) => s.ms !== null).map((s) => s.ms!).sort((a, b) => a - b);
  const percentile = (p: number) => (ok.length ? ok[Math.min(ok.length - 1, Math.floor(p * ok.length))]! : null);

  const funnel: FunnelStat[] = kpis
    ? [
        { name: "Pedidos entregados y pagados", value: `${kpis.resumen.pedidos_exitosos} de ${kpis.resumen.solicitudes}`, pct: pctOf(kpis.resumen.pedidos_exitosos, kpis.resumen.solicitudes), color: "bg-green-600" },
        { name: "Rechazados por cocina", value: String(kpis.abandono.rechazados_por_cocina), pct: pctOf(kpis.abandono.rechazados_por_cocina, kpis.resumen.solicitudes), color: "bg-amber-500" },
        { name: "Abandonados (sin pago)", value: `${kpis.abandono.abandonados} de ${kpis.abandono.aceptados} aceptados`, pct: pctOf(kpis.abandono.abandonados, kpis.abandono.aceptados), color: "bg-amber-500" },
        { name: "Ventas del período", value: `Q${kpis.ventas.total.toFixed(2)}`, pct: 100, color: "bg-brand-primary" },
      ]
    : [];

  const names = new Map(restaurants.map((r) => [r.id, r.name]));
  const recentEvents: EventRow[] = events.slice(0, RECENT_EVENTS).map((e) => {
    const d = describeEvent(e.event);
    return {
      time: clock(e.created_at, true),
      event: d.label,
      restaurant: e.restaurant_id ? (names.get(e.restaurant_id) ?? "—") : "—",
      message: e.message,
      result: d.result,
    };
  });

  return {
    cards,
    latency,
    latencyNote: !checked ? "Verificando…" : isDown ? "API sin respuesta" : "Estable",
    latencyStats: [
      `p50 ${percentile(0.5) ?? "—"} ms`,
      `p95 ${percentile(0.95) ?? "—"} ms`,
      `${samples.length} muestras (cada 15 s)`,
    ],
    funnel,
    funnelNote: kpis
      ? `Últimos ${FUNNEL_DAYS} días, todos los restaurantes. Tasa de abandono: ${(kpis.abandono.tasa * 100).toFixed(1)}%.`
      : "Cargando indicadores…",
    recentEvents,
    error,
    reload: load,
  };
}
