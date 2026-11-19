import type { ShiftTicket, TicketResult } from "@repo/api-client";

export function ticketNumber(t: ShiftTicket): string {
  if (t.order_number !== null) return `Orden #${t.order_number}`;
  if (t.request_number !== null) return `Solicitud #${t.request_number}`;
  return "—";
}

// Cliente del ticket: el que manda el backend o, si no, el cruzado con /api/admin/orders.
export const ticketCustomer = (t: ShiftTicket, customers: Record<string, string>): string | undefined =>
  t.customer_name ?? customers[t.order_id];

export const sumTickets = (tickets: ShiftTicket[]) => tickets.reduce((sum, t) => sum + t.total_amount, 0);

// Chip de resultado: fondo/texto por tipo de resultado.
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

// Filtro de resultado: "" = todos; "accepted" / "rejected" = grupos; otro valor = un `resultado` concreto.
const isRejected = (t: ShiftTicket) => t.resultado.startsWith("rechazada") || t.resultado === "sin_respuesta";

export function matchesResult(t: ShiftTicket, filter: string): boolean {
  if (!filter) return true;
  if (filter === "accepted") return t.aceptada;
  if (filter === "rejected") return isRejected(t);
  return t.resultado === filter;
}

// Filtro de turno: "" = todos; "none" = tickets fuera de turno; otro valor = id del turno.
export function matchesShift(t: ShiftTicket, filter: string): boolean {
  if (!filter) return true;
  if (filter === "none") return t.turno === null;
  return t.turno?.shift_id === filter;
}

// Resultados concretos presentes en los tickets (para no ofrecer opciones vacías): [clave, etiqueta].
export function resultOptionsOf(tickets: ShiftTicket[]): [string, string][] {
  const seen = new Map<string, string>();
  tickets.forEach((t) => seen.set(t.resultado, t.resultado_label));
  return [...seen.entries()];
}

export function resultFilterLabel(filter: string, options: [string, string][]): string | undefined {
  if (filter === "accepted") return "Aceptados";
  if (filter === "rejected") return "Rechazados";
  return options.find(([key]) => key === filter)?.[1];
}
