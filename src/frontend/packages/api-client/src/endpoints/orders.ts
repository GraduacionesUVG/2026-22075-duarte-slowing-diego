/// <reference types="vite/client" />
import { apiRequest } from "../client";
import type { Order, OrderItem, OrderPaymentStatus, OrderPipelineStatus, RejectReason } from "../types";

// Forma de OrderResponse en el backend (solo los campos que usa el KDS).
interface OrderDto {
  id: string;
  student_id: string;
  items: {
    menu_item_id?: string | null;
    product_name: string;
    quantity: number;
    notes?: string | null;
    category_icon?: string | null;
    modifiers?: { name: string }[];
  }[];
  pipeline_status: OrderPipelineStatus;
  payment_status: OrderPaymentStatus;
  requested_ready_time?: string | null;
  prep_start_time?: string | null;
  ready_at?: string | null;
  otp_code?: string | null;
  payment_reference?: string | null;
  request_number?: number | null;
  order_number?: number | null;
  accepted_at?: string | null;
  created_at: string;
}

function toOrder(dto: OrderDto): Order {
  const items: OrderItem[] = dto.items.map((item, i) => {
    const modifiers = (item.modifiers ?? []).map((m) => m.name).filter(Boolean);
    return {
      id: `${dto.id}-${i}`,
      menuItemId: item.menu_item_id ?? undefined,
      name: item.product_name,
      quantity: item.quantity,
      modifiers: modifiers.length > 0 ? modifiers : undefined,
      note: item.notes || undefined,
      categoryIcon: item.category_icon || undefined,
    };
  });

  return {
    id: dto.id,
    // Las solicitudes solo tienen request_number; al pagarse se les asigna order_number.
    orderNumber: String(dto.order_number ?? dto.request_number ?? "—"),
    // El backend no guarda nombre de cliente: se muestra el carné.
    customerName: dto.student_id,
    // Todos los pedidos de WhatsApp se recogen en mostrador.
    orderType: "takeout",
    createdAt: dto.created_at,
    items,
    pipelineStatus: dto.pipeline_status,
    paymentStatus: dto.payment_status,
    paymentLink: dto.payment_reference ?? undefined,
    acceptedAt: dto.accepted_at ?? undefined,
    requestedReadyTime: dto.requested_ready_time ?? undefined,
    prepStartTime: dto.prep_start_time ?? undefined,
    readyAt: dto.ready_at ?? undefined,
    deliveryCode: dto.otp_code ?? "",
  };
}

export const ordersApi = {
  // Cola de la estación del token: solicitudes ofrecidas + órdenes asignadas.
  listActive: async (): Promise<Order[]> =>
    (await apiRequest<OrderDto[]>("/api/orders/active")).map(toOrder),

  updateStatus: async (orderId: string, pipelineStatus: OrderPipelineStatus): Promise<Order> =>
    toOrder(
      await apiRequest<OrderDto>(`/api/orders/${orderId}/status`, {
        method: "PUT",
        body: { pipeline_status: pipelineStatus },
      }),
    ),

  // Rechazo con motivo (solo KDS/administración). Con out_of_stock hay que mandar al menos un
  // producto del pedido; con kitchen_load no se manda ninguno.
  reject: async (orderId: string, reason: RejectReason, outOfStockItemIds: string[] = []): Promise<Order> =>
    toOrder(
      await apiRequest<OrderDto>(`/api/orders/${orderId}/reject`, {
        method: "POST",
        body: { reason, out_of_stock_item_ids: reason === "out_of_stock" ? outOfStockItemIds : [] },
      }),
    ),

  // Entrega en mostrador. El backend responde 400 si el código es incorrecto.
  validateOtp: (orderId: string, otpCode: string) =>
    apiRequest<{ detail: string }>(`/api/orders/${orderId}/validate-otp`, {
      method: "POST",
      body: { otp_code: otpCode },
    }),

  // SOLO DESARROLLO: el backend simula el webhook de BAC (no hay sandbox real todavía).
  simulatePayment: (orderId: string, status: "success" | "failed" = "success") =>
    apiRequest<unknown>("/webhooks/bac-payment", {
      method: "POST",
      body: { order_id: orderId, status },
    }),
};
