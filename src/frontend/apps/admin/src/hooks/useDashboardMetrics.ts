import { useCallback, useEffect, useMemo, useState } from "react";
import { adminApi, type AdminOrder, type KpiResponse } from "@repo/api-client";

export type TrendTone = "success" | "error" | "muted";

export type KPI = {
  label: string;
  value: string;
  trend: string;
  trendTone: TrendTone;
};

export type HourlyPoint = {
  hour: string;
  value: number;
  pct: number;
  peak: boolean;
};

export type DishDemand = {
  name: string;
  count: number;
  pct: number;
};

export type OrderRow = {
  id: string;
  // Pedido, cliente, total y estado (en ese orden: ver ORDERS_HEADER en DashboardHome).
  cells: [string, string, string, string];
};

export type RangeKey = "today" | "week" | "month";

export const RANGES: { key: RangeKey; label: string; days: number }[] = [
  { key: "today", label: "Hoy", days: 1 },
  { key: "week", label: "7 días", days: 7 },
  { key: "month", label: "30 días", days: 30 },
];

const RECENT_ORDERS = 8;

// Las fechas del backend son hora de Guatemala (UTC-6, sin horario de verano).
const GT_OFFSET_MS = -6 * 3600_000;

function guatemalaDate(offsetDays = 0): string {
  return new Date(Date.now() + GT_OFFSET_MS - offsetDays * 86_400_000).toISOString().slice(0, 10);
}

const money = (n: number) => `Q${n.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function minutesLabel(minutes: number | null): string {
  if (minutes === null) return "—";
  const total = Math.round(minutes * 60);
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

function buildKpis(data: KpiResponse, rangeLabel: string): KPI[] {
  const { resumen, ventas, tiempo_preparacion_min: prep, abandono } = data;
  return [
    {
      label: `Ventas totales — ${rangeLabel}`,
      value: money(ventas.total),
      trend: `${resumen.pedidos_exitosos} pedidos entregados y pagados`,
      trendTone: "muted",
    },
    {
      label: "Pedidos completados",
      value: String(resumen.pedidos_exitosos),
      trend: `${resumen.solicitudes} solicitudes · ${abandono.rechazados_por_cocina} rechazadas por cocina`,
      trendTone: "muted",
    },
    {
      label: "Ticket promedio",
      value: money(resumen.ticket_promedio),
      trend: abandono.aceptados > 0 ? `Abandono de pago: ${(abandono.tasa * 100).toFixed(1)}%` : "Sin pedidos aceptados",
      trendTone: abandono.tasa > 0.2 ? "error" : "muted",
    },
    {
      label: "Tiempo promedio de preparación",
      value: minutesLabel(prep.promedio),
      trend: prep.muestras > 0 ? `p90: ${minutesLabel(prep.p90)} · ${prep.muestras} pedidos` : "Sin datos todavía",
      trendTone: "muted",
    },
  ];
}

const ORDER_STATUS_LABEL: Record<string, string> = {
  pending_acceptance: "Por aceptar",
  accepted: "Aceptado",
  in_preparation: "En preparación",
  ready_for_pickup: "Listo para entrega",
  delivered: "Entregado",
  rejected: "Rechazado",
  cancelled: "Cancelado",
};

function toRow(order: AdminOrder): OrderRow {
  const number = order.order_number ?? order.request_number;
  return {
    id: order.id,
    cells: [
      number !== null ? `#${number}` : "—",
      order.student_id,
      money(order.total_amount),
      ORDER_STATUS_LABEL[order.pipeline_status] ?? order.status_label,
    ],
  };
}

export function useDashboardMetrics() {
  const [range, setRange] = useState<RangeKey>("today");
  const [data, setData] = useState<KpiResponse | null>(null);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const days = RANGES.find((r) => r.key === range)!.days;
    setLoading(true);
    try {
      const [kpis, today] = await Promise.all([
        adminApi.kpis(guatemalaDate(days - 1), guatemalaDate()),
        adminApi.listOrders(guatemalaDate()),
      ]);
      setData(kpis);
      setOrders(today);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudieron cargar las métricas.");
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    void load();
  }, [load]);

  return useMemo(() => {
    const rangeLabel = RANGES.find((r) => r.key === range)!.label;

    const byHour = data?.hora_pico.total_por_hora ?? [];
    const maxHourly = Math.max(1, ...byHour.map((h) => h.pedidos));
    const hourly: HourlyPoint[] = byHour.map((h) => ({
      hour: `${String(h.hora).padStart(2, "0")}:00`,
      value: h.pedidos,
      pct: Math.round((h.pedidos / maxHourly) * 100),
      peak: h.pedidos === maxHourly,
    }));

    const ranking = data?.plato_mas_pedido?.ranking.slice(0, 5) ?? [];
    const maxDish = Math.max(1, ...ranking.map((d) => d.cantidad));
    const topDishes: DishDemand[] = ranking.map((d) => ({
      name: d.nombre,
      count: d.cantidad,
      pct: Math.round((d.cantidad / maxDish) * 100),
    }));

    const peak = data?.hora_pico.hora_pico_global;
    const recentOrders = [...orders]
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .slice(0, RECENT_ORDERS)
      .map(toRow);

    return {
      range,
      setRange,
      rangeLabel,
      loading,
      // Primera carga: todavía no hay datos que mostrar (se pintan skeletons).
      initialLoading: loading && data === null,
      error,
      reload: load,
      kpis: data ? buildKpis(data, rangeLabel) : [],
      hourly,
      peakLabel: data?.hora_pico.hora_pico_filtrado
        ? `Pico ${data.hora_pico.hora_pico_filtrado.etiqueta}`
        : "Sin pedidos en el período",
      topDishes,
      staffingNote: peak
        ? `Hora pico histórica: ${peak.etiqueta} (≈${peak.promedio_por_dia} pedidos por día). Considera reforzar personal de cocina en ese horario.`
        : "Aún no hay suficiente historial para recomendar refuerzo de personal.",
      recentOrders,
    };
  }, [data, orders, range, loading, error, load]);
}
