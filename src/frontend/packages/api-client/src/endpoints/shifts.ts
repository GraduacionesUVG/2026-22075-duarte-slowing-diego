import { ApiError } from "../client";

// Turnos del KDS (docs/HANDOFF_TURNOS_KDS.md). Las horas `started_at`/`ended_at`/`created_at` traen el
// offset de Guatemala; `hora_inicio`, `hora_fin` y `hora` ya vienen como HH:MM.

export interface ShiftActor {
  type: "kds" | "admin" | "system";
  id: string | null;
  username: string | null;
}

export interface ShiftPause {
  started_at: string;
  // null mientras la pausa sigue abierta.
  ended_at: string | null;
  hora_inicio: string;
  hora_fin: string | null;
  duracion_min: number;
  started_by: ShiftActor | null;
  ended_by: ShiftActor | null;
}

export interface ShiftPauses {
  cantidad: number;
  tiempo_total_min: number;
  en_pausa: boolean;
  detalle: ShiftPause[];
}

export interface Shift {
  id: string;
  restaurant_id: string;
  kds_user_id: string;
  kds_username: string;
  local_date: string;
  shift_no: number;
  // "Turno 2 · 14/10/2026"
  label: string;
  status: "open" | "closed";
  started_at: string;
  ended_at: string | null;
  hora_inicio: string;
  hora_fin: string | null;
  duracion_min: number;
  tiempo_activo_min: number;
  pausas: ShiftPauses;
  // Sigue abierto desde un día anterior.
  stale: boolean;
  // Se cerró después de su día: la hora final es la de cierre del restaurante.
  end_adjusted: boolean;
  started_by: ShiftActor | null;
  ended_by: ShiftActor | null;
}

export interface ShiftKpis {
  total_tickets: number;
  aceptadas: number;
  rechazadas: number;
  rechazadas_carga: number;
  rechazadas_stock: number;
  rechazadas_sin_respuesta: number;
  rechazadas_sin_motivo: number;
  pendientes: number;
  esperando_pago: number;
  en_curso: number;
  entregadas: number;
  no_pagadas: number;
  canceladas: number;
  ordenes_pagadas: number;
  total_dinero: number;
  ticket_promedio: number;
  pct_aceptadas: number;
  pct_rechazadas: number;
  pct_rechazadas_carga: number;
  pct_rechazadas_stock: number;
  pct_rechazadas_sin_respuesta: number;
  tiempo_preparacion_promedio_min: number | null;
  // Solo en el resumen del día del admin.
  sin_turno?: number;
}

export type TicketResult =
  | "entregada"
  | "en_curso"
  | "esperando_pago"
  | "pendiente"
  | "no_pagada"
  | "cancelada"
  | "rechazada_carga"
  | "rechazada_stock"
  | "sin_respuesta"
  | "rechazada_otro";

export interface ShiftTicket {
  order_id: string;
  request_number: number | null;
  order_number: number | null;
  created_at: string;
  hora: string;
  items: string;
  total_amount: number;
  pipeline_status: string;
  payment_status: string;
  status_label: string;
  resultado: TicketResult;
  resultado_label: string;
  aceptada: boolean;
  reject_reason: string | null;
  out_of_stock_items: { menu_item_id: string; name: string }[];
  kds_user_id: string;
  kds_username: string;
  // Quién hizo el pedido, si el backend lo manda; si no, el admin lo cruza con /api/admin/orders.
  customer_name?: string | null;
  // Solo en /api/admin/shifts.
  turno: { shift_id: string; shift_no: number; label: string } | null;
}

export interface ShiftPending {
  por_aceptar: number;
  en_curso: number;
}

export interface CurrentShift {
  shift: Shift | null;
  station_active: boolean;
  pendientes: ShiftPending;
  kpis: ShiftKpis | null;
}

export interface StartShiftResult {
  shift: Shift;
  station_active: boolean;
  previous_shift_closed: Shift | null;
}

export interface ShiftSummary {
  shift: Shift;
  kpis: ShiftKpis;
  tickets: ShiftTicket[];
  // Solo lo trae el cierre del turno.
  pendientes?: ShiftPending;
}

export interface ShiftListItem {
  shift: Shift;
  kpis: ShiftKpis;
}

export interface AdminShiftsDay {
  date: string;
  restaurant_id: string;
  kds_user_id: string | null;
  kpis: ShiftKpis;
  turnos: ShiftListItem[];
  tickets: ShiftTicket[];
}

// Mensajes del WebSocket del KDS que no traen pedidos.
export type ShiftSocketEvent =
  | { type: "shift_status"; kds_user_id: string; status: "open" | "closed"; shift: Shift; restaurant_id: string }
  | { type: "station_status"; kds_user_id: string; active: boolean; restaurant_id: string };

// Los 409 de turnos traen `detail = { message, code, ... }`.
export function shiftErrorCode(e: unknown): string | null {
  if (!(e instanceof ApiError)) return null;
  const detail = e.detail;
  if (detail && typeof detail === "object" && "code" in detail) return String((detail as { code: unknown }).code);
  return null;
}
