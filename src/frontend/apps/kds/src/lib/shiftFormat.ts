import type { ShiftTicket, TicketResult } from "@repo/api-client";

// "2026-10-14" -> "14/10/2026"
export function formatLocalDate(date: string): string {
  const [y, m, d] = date.split("-");
  return y && m && d ? `${d}/${m}/${y}` : date;
}

// 365 -> "6 h 5 min"; 25 -> "25 min"
export function formatMinutes(minutes: number | null | undefined): string {
  if (minutes === null || minutes === undefined) return "—";
  const total = Math.round(minutes);
  if (total < 60) return `${total} min`;
  const rest = total % 60;
  return rest === 0 ? `${Math.floor(total / 60)} h` : `${Math.floor(total / 60)} h ${rest} min`;
}

export const formatMoney = (n: number) =>
  `Q${n.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const formatPct = (n: number) => `${n.toFixed(1)}%`;

export function ticketNumber(t: ShiftTicket): string {
  if (t.order_number !== null) return `Orden #${t.order_number}`;
  if (t.request_number !== null) return `Solicitud #${t.request_number}`;
  return "—";
}

// Chip de resultado: fondo/texto por tipo de resultado (ver handoff 3.3).
export const RESULT_CHIP: Record<TicketResult, string> = {
  entregada: "bg-green-100 text-green-800",
  en_curso: "bg-blue-100 text-blue-800",
  esperando_pago: "bg-sky-100 text-sky-800",
  pendiente: "bg-gray-100 text-gray-700",
  no_pagada: "bg-orange-100 text-orange-800",
  cancelada: "bg-gray-300 text-gray-800",
  rechazada_carga: "bg-red-100 text-red-800",
  rechazada_stock: "bg-red-100 text-red-800",
  sin_respuesta: "bg-red-100 text-red-800",
  rechazada_otro: "bg-red-100 text-red-800",
};

export type TicketFilter = "all" | "accepted" | "rejected";

export function matchesFilter(t: ShiftTicket, filter: TicketFilter): boolean {
  if (filter === "all") return true;
  if (filter === "accepted") return t.aceptada;
  return t.resultado.startsWith("rechazada") || t.resultado === "sin_respuesta";
}
