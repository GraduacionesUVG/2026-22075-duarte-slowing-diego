// Backend falso de turnos (docs/HANDOFF_TURNOS_KDS.md) para las stories del KDS y del admin.
// Mantiene el estado en memoria: iniciar, pausar, reanudar y finalizar turno funcionan como en el backend.
import { reply, type MockRoute } from "./mockApi";

const TODAY = new Date(Date.now() - 6 * 3600_000).toISOString().slice(0, 10);
const [Y, M, D] = TODAY.split("-");
const LABEL_DATE = `${D}/${M}/${Y}`;

const pad = (n: number) => String(n).padStart(2, "0");
const hhmm = (d: Date) => {
  const g = new Date(d.getTime() - 6 * 3600_000);
  return `${pad(g.getUTCHours())}:${pad(g.getUTCMinutes())}`;
};
const iso = (d: Date) => d.toISOString();
const minutesBetween = (a: Date, b: Date) => Math.round(((b.getTime() - a.getTime()) / 60_000) * 10) / 10;

type Actor = { type: "kds" | "admin" | "system"; id: string | null; username: string | null };
type Pause = { start: Date; end: Date | null; by: Actor };
type MockShift = {
  id: string;
  kdsUserId: string;
  username: string;
  no: number;
  start: Date;
  end: Date | null;
  pauses: Pause[];
  tickets: number;
  money: number;
  rejected: number;
};

const KDS_ACTOR: Actor = { type: "kds", id: "u1", username: "cocina1" };

const resultLabels: Record<string, string> = {
  entregada: "Entregada",
  rechazada_carga: "Rechazada por carga",
  rechazada_stock: "Rechazada por falta de stock",
  sin_respuesta: "Sin respuesta",
  no_pagada: "No pagada",
};

function toShiftDto(s: MockShift, now = new Date()) {
  const end = s.end ?? now;
  const pauseMin = s.pauses.reduce((sum, p) => sum + minutesBetween(p.start, p.end ?? now), 0);
  const duration = minutesBetween(s.start, end);
  const open = s.pauses.find((p) => p.end === null);
  return {
    id: s.id,
    restaurant_id: "r1",
    kds_user_id: s.kdsUserId,
    kds_username: s.username,
    local_date: TODAY,
    shift_no: s.no,
    label: `Turno ${s.no} · ${LABEL_DATE}`,
    status: s.end ? "closed" : "open",
    started_at: iso(s.start),
    ended_at: s.end ? iso(s.end) : null,
    hora_inicio: hhmm(s.start),
    hora_fin: s.end ? hhmm(s.end) : null,
    duracion_min: duration,
    tiempo_activo_min: Math.round((duration - pauseMin) * 10) / 10,
    pausas: {
      cantidad: s.pauses.length,
      tiempo_total_min: Math.round(pauseMin * 10) / 10,
      en_pausa: Boolean(open) && !s.end,
      detalle: s.pauses.map((p) => ({
        started_at: iso(p.start),
        ended_at: p.end ? iso(p.end) : null,
        hora_inicio: hhmm(p.start),
        hora_fin: p.end ? hhmm(p.end) : null,
        duracion_min: minutesBetween(p.start, p.end ?? now),
        started_by: p.by,
        ended_by: p.end ? p.by : null,
      })),
    },
    stale: false,
    end_adjusted: false,
    started_by: KDS_ACTOR,
    ended_by: s.end ? KDS_ACTOR : null,
  };
}

function toKpis(s: MockShift) {
  const accepted = s.tickets - s.rejected;
  const pct = (n: number) => (s.tickets === 0 ? 0 : Math.round((n / s.tickets) * 1000) / 10);
  const carga = Math.ceil(s.rejected / 2);
  const stock = s.rejected - carga;
  return {
    total_tickets: s.tickets,
    aceptadas: accepted,
    rechazadas: s.rejected,
    rechazadas_carga: carga,
    rechazadas_stock: stock,
    rechazadas_sin_respuesta: 0,
    rechazadas_sin_motivo: 0,
    pendientes: 0,
    esperando_pago: 0,
    en_curso: 0,
    entregadas: accepted,
    no_pagadas: 0,
    canceladas: 0,
    ordenes_pagadas: accepted,
    total_dinero: s.money,
    ticket_promedio: accepted === 0 ? 0 : Math.round((s.money / accepted) * 100) / 100,
    pct_aceptadas: pct(accepted),
    pct_rechazadas: pct(s.rejected),
    pct_rechazadas_carga: pct(carga),
    pct_rechazadas_stock: pct(stock),
    pct_rechazadas_sin_respuesta: 0,
    tiempo_preparacion_promedio_min: accepted === 0 ? null : 11.4,
  };
}

const CUSTOMERS = ["Ana Pérez", "Luis Morales", "Carla Gómez", "Diego Ramírez", "Sofía Castillo", "Pedro Lima"];
const ITEMS = ["2x Hamburguesa + Café", "Burrito de pollo", "Ensalada César + Limonada", "3x Papas fritas", "Combo pizza"];

function toTickets(s: MockShift) {
  return Array.from({ length: s.tickets }, (_, i) => {
    const rejected = i >= s.tickets - s.rejected;
    const at = new Date(s.start.getTime() + (i + 1) * 9 * 60_000);
    const resultado = rejected ? (i % 2 === 0 ? "rechazada_carga" : "rechazada_stock") : "entregada";
    return {
      order_id: `${s.id}-t${i}`,
      request_number: 1000 + i,
      order_number: rejected ? null : 2000 + i,
      created_at: iso(at),
      hora: hhmm(at),
      items: ITEMS[i % ITEMS.length],
      total_amount: rejected ? 0 : Math.round((s.money / Math.max(1, s.tickets - s.rejected)) * 100) / 100,
      pipeline_status: rejected ? "rejected" : "delivered",
      payment_status: rejected ? "pending" : "paid",
      status_label: rejected ? "Rechazado" : "Entregado",
      resultado,
      resultado_label: resultLabels[resultado],
      aceptada: !rejected,
      reject_reason: rejected ? (resultado === "rechazada_carga" ? "kitchen_load" : "out_of_stock") : null,
      out_of_stock_items: resultado === "rechazada_stock" ? [{ menu_item_id: "m4", name: "Papas fritas" }] : [],
      kds_user_id: s.kdsUserId,
      kds_username: s.username,
      customer_name: CUSTOMERS[i % CUSTOMERS.length],
      turno: null as null | { shift_id: string; shift_no: number; label: string },
    };
  });
}

function previousShift(): MockShift {
  const start = new Date(Date.now() - 6 * 3600_000);
  return {
    id: "s-prev",
    kdsUserId: "u1",
    username: "cocina1",
    no: 1,
    start,
    end: new Date(start.getTime() + 3 * 3600_000),
    pauses: [{ start: new Date(start.getTime() + 70 * 60_000), end: new Date(start.getTime() + 85 * 60_000), by: KDS_ACTOR }],
    tickets: 12,
    money: 486,
    rejected: 3,
  };
}

type KdsShiftOptions = {
  // Arranca con un turno ya abierto (si no, la estación llega a "Iniciar turno").
  open?: boolean;
  // Solicitudes por aceptar / órdenes en curso: salen de la cola de pedidos de la story.
  pendingCount?: () => number;
  inProgressCount?: () => number;
};

export function kdsShiftRoutes({ open = false, pendingCount = () => 0, inProgressCount = () => 0 }: KdsShiftOptions = {}): MockRoute[] {
  const shifts: MockShift[] = [previousShift()];
  let stationActive = false;
  let seq = 1;

  const openShift = () => shifts.find((s) => s.end === null) ?? null;
  const startShift = () => {
    const created: MockShift = {
      id: `s-${seq++}`,
      kdsUserId: "u1",
      username: "cocina1",
      no: shifts.length + 1,
      start: new Date(),
      end: null,
      pauses: [],
      tickets: 0,
      money: 0,
      rejected: 0,
    };
    shifts.push(created);
    stationActive = true;
    return created;
  };
  if (open) startShift();

  const noOpen = () =>
    reply(409, { detail: { message: "No hay un turno abierto. Inicia un turno primero.", code: "no_open_shift" } });
  const pending = () => ({ por_aceptar: pendingCount(), en_curso: inProgressCount() });

  return [
    {
      path: "/api/kds/shift/current",
      respond: () => {
        const s = openShift();
        return {
          shift: s ? toShiftDto(s) : null,
          station_active: stationActive,
          pendientes: pending(),
          kpis: s ? toKpis(s) : null,
        };
      },
    },
    {
      method: "POST",
      path: "/api/kds/shift/start",
      respond: () => {
        const current = openShift();
        if (current) {
          return reply(409, {
            detail: { message: "Ya hay un turno abierto.", code: "shift_already_open", shift: toShiftDto(current) },
          });
        }
        return reply(201, { shift: toShiftDto(startShift()), station_active: true, previous_shift_closed: null });
      },
    },
    {
      method: "POST",
      path: "/api/kds/shift/end",
      respond: () => {
        const s = openShift();
        if (!s) return noOpen();
        if (pendingCount() > 0) {
          return reply(409, {
            detail: {
              message: `Tienes ${pendingCount()} solicitud(es) por aceptar o rechazar.`,
              code: "pending_requests",
              por_aceptar: pendingCount(),
            },
          });
        }
        const now = new Date();
        const open = s.pauses.find((p) => p.end === null);
        if (open) open.end = now;
        // Un turno recién abierto no tiene tickets: se simula una jornada para ver el resumen completo.
        if (s.tickets === 0) {
          s.tickets = 9;
          s.rejected = 2;
          s.money = 318.5;
        }
        s.end = now;
        stationActive = false;
        return { shift: toShiftDto(s), kpis: toKpis(s), tickets: toTickets(s), pendientes: pending() };
      },
    },
    {
      method: "PUT",
      path: "/api/kds/me/active",
      respond: ({ body }) => {
        const s = openShift();
        if (!s) return noOpen();
        const now = new Date();
        const open = s.pauses.find((p) => p.end === null);
        if (body.active) {
          if (open) open.end = now;
        } else if (!open) {
          s.pauses.push({ start: now, end: null, by: KDS_ACTOR });
        }
        stationActive = Boolean(body.active);
        return { kds_user_id: "u1", active: stationActive };
      },
    },
    {
      path: "/api/kds/shifts",
      respond: () => shifts.map((s) => ({ shift: toShiftDto(s), kpis: toKpis(s) })),
    },
    {
      path: /^\/api\/kds\/shifts\/([^/]+)$/,
      respond: ({ match }) => {
        const s = shifts.find((x) => x.id === match[1]);
        if (!s) return reply(404, { detail: "Turno no encontrado" });
        return { shift: toShiftDto(s), kpis: toKpis(s), tickets: toTickets(s) };
      },
    },
  ];
}

// Resumen del día del admin: dos estaciones, tres turnos y un ticket fuera de turno.
// `many`: agrega 14 turnos más (de dos estaciones) para ver la paginación de turnos y de tickets.
export function adminShiftRoutes({ many = false }: { many?: boolean } = {}): MockRoute[] {
  const base = new Date(Date.now() - 6 * 3600_000);
  const at = (h: number, m = 0) => new Date(base.getTime() + h * 3600_000 + m * 60_000);
  const shifts: MockShift[] = [
    {
      id: "a1", kdsUserId: "u1", username: "cocina1", no: 1, start: at(0), end: at(4),
      pauses: [{ start: at(1, 10), end: at(1, 25), by: KDS_ACTOR }],
      tickets: 18, money: 702, rejected: 4,
    },
    {
      id: "a2", kdsUserId: "u2", username: "cocina-fria", no: 1, start: at(0, 30), end: at(5),
      pauses: [],
      tickets: 9, money: 215.5, rejected: 1,
    },
    {
      id: "a3", kdsUserId: "u1", username: "cocina1", no: 2, start: at(5), end: null,
      pauses: [{ start: at(5, 40), end: at(5, 52), by: { type: "admin", id: "ad1", username: "Admin Cafetería" } }],
      tickets: 6, money: 190, rejected: 1,
    },
  ];
  if (many) {
    for (let n = 0; n < 14; n++) {
      const station = n % 2 === 0 ? { id: "u1", name: "cocina1" } : { id: "u2", name: "cocina-fria" };
      shifts.push({
        id: `m${n}`, kdsUserId: station.id, username: station.name, no: 3 + Math.floor(n / 2),
        start: at(6 + n * 0.5), end: at(6.4 + n * 0.5),
        pauses: n % 3 === 0 ? [{ start: at(6.1 + n * 0.5), end: at(6.2 + n * 0.5), by: KDS_ACTOR }] : [],
        tickets: 4 + (n % 5), money: 90 + n * 11, rejected: n % 3,
      });
    }
  }
  const sum = (key: "tickets" | "money" | "rejected") => shifts.reduce((n, s) => n + s[key], 0);
  const total: MockShift = { ...shifts[0]!, tickets: sum("tickets"), money: sum("money"), rejected: sum("rejected") };

  return [
    {
      path: "/api/admin/shifts",
      respond: ({ query }) => {
        const station = query.get("kds_user_id");
        const list = station ? shifts.filter((s) => s.kdsUserId === station) : shifts;
        const tickets = list.flatMap((s) =>
          toTickets(s).map((t) => ({
            ...t,
            turno: { shift_id: s.id, shift_no: s.no, label: `Turno ${s.no} · ${LABEL_DATE}` },
          })),
        );
        const orphan = { ...toTickets({ ...shifts[0]!, tickets: 1, rejected: 0 })[0]!, order_id: "orphan", turno: null };
        return {
          date: query.get("date") ?? TODAY,
          restaurant_id: "r1",
          kds_user_id: station,
          kpis: { ...toKpis(station ? list[0]! : total), sin_turno: station ? 0 : 1 },
          turnos: list.map((s) => ({ shift: toShiftDto(s), kpis: toKpis(s) })),
          tickets: station ? tickets : [...tickets, orphan],
        };
      },
    },
    {
      path: /^\/api\/admin\/shifts\/([^/]+)$/,
      respond: ({ match }) => {
        const s = shifts.find((x) => x.id === match[1]);
        if (!s) return reply(404, { detail: "Turno no encontrado" });
        return { shift: toShiftDto(s), kpis: toKpis(s), tickets: toTickets(s) };
      },
    },
  ];
}
