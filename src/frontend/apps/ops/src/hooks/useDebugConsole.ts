import { useCallback, useEffect, useMemo, useState } from "react";
import { opsApi, type OrderEvent, type TiAdminUser, type TiKdsUser, type TiRestaurant } from "@repo/api-client";
import type { BadgeStatus } from "../components/StatusBadge";
import { clock, guatemalaDate } from "../lib/format";
import { describeEvent, EVENT_GROUPS, LEVEL_STATUS, type EventGroup, type EventLevel } from "../lib/events";

export type StationRow = {
  id: string;
  name: string;
  detail: string;
  status: BadgeStatus;
  statusLabel: string;
};

export type LogEntry = {
  id: string;
  time: string;
  level: EventLevel;
  status: BadgeStatus;
  service: string;
  message: string;
};

export const LOG_FILTERS = ["Todos", ...EVENT_GROUPS] as const;
export type LogFilter = (typeof LOG_FILTERS)[number];

const REFRESH_MS = 20_000;

export function useDebugConsole() {
  const [date, setDate] = useState(() => guatemalaDate());
  const [restaurantId, setRestaurantId] = useState("");
  const [logFilter, setLogFilter] = useState<LogFilter>("Todos");
  const [restaurants, setRestaurants] = useState<TiRestaurant[]>([]);
  const [stations, setStations] = useState<TiKdsUser[]>([]);
  const [admins, setAdmins] = useState<TiAdminUser[]>([]);
  const [events, setEvents] = useState<OrderEvent[]>([]);
  const [live, setLive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Restaurantes, estaciones y administradores no dependen del día elegido.
  const loadStatic = useCallback(async () => {
    try {
      const [rs, st, ad] = await Promise.all([opsApi.listRestaurants(), opsApi.listKdsUsers(), opsApi.listAdmins()]);
      setRestaurants(rs);
      setStations(st);
      setAdmins(ad);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo cargar el estado de las estaciones.");
    }
  }, []);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    try {
      const day = await opsApi.listEvents(date, restaurantId);
      setEvents(day.events);
      setLive(day.live);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudieron cargar los eventos.");
    } finally {
      setLoading(false);
    }
  }, [date, restaurantId]);

  useEffect(() => {
    void loadStatic();
  }, [loadStatic]);

  // Hoy se refresca solo; los días pasados no cambian.
  useEffect(() => {
    void loadEvents();
    if (date !== guatemalaDate()) return;
    const timer = setInterval(() => void loadEvents(), REFRESH_MS);
    return () => clearInterval(timer);
  }, [loadEvents, date]);

  const reload = useCallback(() => {
    void loadStatic();
    void loadEvents();
  }, [loadStatic, loadEvents]);

  const restaurantNames = useMemo(() => new Map(restaurants.map((r) => [r.id, r.name])), [restaurants]);

  const stationRows: StationRow[] = useMemo(
    () =>
      stations.map((s) => ({
        id: s.kds_user_id,
        name: s.username,
        detail: `${s.restaurant_name ?? "—"} · prioridad ${s.priority}${
          s.connected && s.connected_since ? ` · conectada desde ${clock(s.connected_since)}` : s.last_seen ? ` · visto ${clock(s.last_seen)}` : ""
        }`,
        status: !s.active ? "warning" : s.connected ? "success" : "info",
        statusLabel: !s.active ? "Pausada" : s.connected ? "Conectada" : "Sin conexión",
      })),
    [stations],
  );

  const filteredLogs: LogEntry[] = useMemo(() => {
    const entries = events.map((e) => {
      const info = describeEvent(e.event);
      return { event: e, info };
    });
    const visible = logFilter === "Todos" ? entries : entries.filter(({ info }) => info.groups.includes(logFilter as EventGroup));
    return visible
      .sort((a, b) => b.event.created_at.localeCompare(a.event.created_at))
      .slice(0, 200)
      .map(({ event: e, info }) => ({
        id: e.id,
        time: clock(e.created_at, true),
        level: info.level,
        status: LEVEL_STATUS[info.level],
        service: e.restaurant_id ? (restaurantNames.get(e.restaurant_id) ?? "—") : "—",
        message: `${info.label}${e.order_number ?? e.request_number ? ` #${e.order_number ?? e.request_number}` : ""} · ${e.message}`,
      }));
  }, [events, logFilter, restaurantNames]);

  const sessions = [
    { label: "Estaciones KDS conectadas", value: `${stations.filter((s) => s.connected).length} de ${stations.length}` },
    { label: "Restaurantes registrados", value: String(restaurants.length) },
    { label: "Administradores sin contraseña", value: String(admins.filter((a) => a.password_pending).length) },
    { label: `Eventos del ${date}`, value: String(events.length) },
  ];

  return {
    date,
    setDate,
    restaurantId,
    setRestaurantId,
    restaurants,
    live,
    loading,
    error,
    reload,
    stationRows,
    logFilter,
    setLogFilter,
    filteredLogs,
    sessions,
  };
}
