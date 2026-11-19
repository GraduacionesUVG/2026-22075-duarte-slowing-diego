import type { Order } from "@repo/api-client";

// Entrega: solo pedidos que el cliente ya pagó. Lo anterior (por aceptar) vive en la
// versión de Aceptación.
export function isDeliveryOrder(order: Order): boolean {
  return (
    order.paymentStatus === "paid" &&
    (order.pipelineStatus === "accepted" ||
      order.pipelineStatus === "in_preparation" ||
      order.pipelineStatus === "ready_for_pickup")
  );
}

// "En espera": ya pagado pero todavía sin preparar porque aún no llega la hora de empezar
// (el cliente pidió recogerlo más tarde). Pasada prepStartTime entra solo a la cola de Entrega.
export function isScheduledOrder(order: Order, now: number): boolean {
  return (
    order.pipelineStatus === "accepted" &&
    order.paymentStatus === "paid" &&
    order.prepStartTime !== undefined &&
    new Date(order.prepStartTime).getTime() > now
  );
}

// Desde cuándo está el pedido en la sección de Entrega: el momento en que entró a la cola de
// preparación (prepStartTime: al pagar, o la hora agendada si era para más tarde). Así el
// cronómetro arranca al entrar a Entrega y no arrastra el tiempo que pasó esperando aceptación
// o pago (un pedido pedido hace horas no debe aparecer en rojo de una vez).
export function deliveryEnteredAt(order: Order): string {
  return order.prepStartTime ?? order.acceptedAt ?? order.createdAt;
}

// Pedidos de Entrega que ya están en la cola (los agendados para más tarde viven en "En espera").
export function queuedDeliveryOrders(orders: Order[], now: number): Order[] {
  return orders.filter((o) => isDeliveryOrder(o) && !isScheduledOrder(o, now));
}

// Pedidos nuevos por aceptar (sección Aceptación).
export function pendingAcceptanceOrders(orders: Order[]): Order[] {
  return orders.filter((o) => o.pipelineStatus === "pending_acceptance");
}

// Pedidos en espera, el que empieza a prepararse primero va primero.
export function scheduledOrders(orders: Order[], now: number): Order[] {
  return orders
    .filter((o) => isDeliveryOrder(o) && isScheduledOrder(o, now))
    .sort((a, b) => new Date(a.prepStartTime ?? 0).getTime() - new Date(b.prepStartTime ?? 0).getTime());
}
