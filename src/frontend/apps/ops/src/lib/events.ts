import type { BadgeStatus } from "../components/StatusBadge";

export type EventLevel = "ERROR" | "WARN" | "INFO" | "OK";

export type EventGroup = "Errores" | "Pagos" | "Entrega";

type EventInfo = { label: string; level: EventLevel; result: string; groups: EventGroup[] };

// Tipos de evento de pedidos del backend (OrderEventType en src/models/order_event.py).
const EVENTS: Record<string, EventInfo> = {
  order_created: { label: "Pedido creado", level: "INFO", result: "Creado", groups: [] },
  order_offered: { label: "Ofrecido a estación", level: "INFO", result: "Ofrecido", groups: [] },
  order_rejected_by_station: { label: "Rechazado por estación", level: "WARN", result: "Reasignado", groups: [] },
  order_rejected: { label: "Rechazado", level: "WARN", result: "Rechazado", groups: ["Errores"] },
  order_accepted: { label: "Aceptado", level: "OK", result: "Aceptado", groups: [] },
  payment_link_sent: { label: "Link de pago enviado", level: "INFO", result: "Enviado", groups: ["Pagos"] },
  order_paid: { label: "Pagado", level: "OK", result: "Pagado", groups: ["Pagos"] },
  order_in_preparation: { label: "En preparación", level: "INFO", result: "En cocina", groups: ["Entrega"] },
  order_ready: { label: "Listo para entrega", level: "OK", result: "Listo", groups: ["Entrega"] },
  customer_notified: { label: "Cliente notificado", level: "INFO", result: "Notificado", groups: ["Entrega"] },
  otp_failed: { label: "Código OTP incorrecto", level: "WARN", result: "OTP inválido", groups: ["Errores", "Entrega"] },
  order_delivered: { label: "Entregado", level: "OK", result: "Entregado", groups: ["Entrega"] },
  order_payment_failed: { label: "Pago fallido", level: "ERROR", result: "Cancelado", groups: ["Errores", "Pagos"] },
  payment_link_expired: { label: "Link de pago vencido", level: "ERROR", result: "Cancelado", groups: ["Errores", "Pagos"] },
  order_cancelled: { label: "Cancelado", level: "WARN", result: "Cancelado", groups: ["Errores"] },
};

export const EVENT_GROUPS: EventGroup[] = ["Errores", "Pagos", "Entrega"];

export function describeEvent(type: string): EventInfo {
  return EVENTS[type] ?? { label: type, level: "INFO", result: "—", groups: [] };
}

export const LEVEL_STATUS: Record<EventLevel, BadgeStatus> = {
  ERROR: "error",
  WARN: "warning",
  INFO: "info",
  OK: "success",
};
