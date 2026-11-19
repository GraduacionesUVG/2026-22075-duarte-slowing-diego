import type { Order } from "@repo/api-client";
import { reply, type MockRoute } from "@repo/config/storybook/mockApi";
import { kdsShiftRoutes } from "@repo/config/storybook/shiftsMock";
import { ordersFixture, pendingOrdersFixture } from "./fixtures";

export const DEMO_PIN = "1234";
export const DEMO_USER = "cocina1";

// null = encendido · daily = apagado solo por hoy · permanent = apagado hasta encenderlo.
type MenuMode = "daily" | "permanent" | null;

export const menuFixture = [
  { id: "m1", name: "Hamburguesa clásica", category: "Platos fuertes", category_icon: "hamburguesas", price: 38, mode: null as MenuMode },
  { id: "m2", name: "Burrito de pollo", category: "Platos fuertes", category_icon: "burritos", price: 32, mode: null as MenuMode },
  { id: "m3", name: "Ensalada César", category: "Ligeros", category_icon: "ensaladas", price: 28, mode: "permanent" as MenuMode },
  { id: "m4", name: "Papas fritas", category: "Acompañamientos", category_icon: "papas", price: 15, mode: "daily" as MenuMode },
  { id: "m5", name: "Limonada", category: "Bebidas", category_icon: "jugos", price: 12, mode: null as MenuMode },
  { id: "m6", name: "Combo pizza personal", category: "Platos fuertes", category_icon: "pizza", price: 45, mode: null as MenuMode },
  { id: "m7", name: "Sándwich de pavo", category: "Ligeros", category_icon: "sandwiches", price: 30, mode: null as MenuMode },
  { id: "m8", name: "Wrap vegetariano", category: "Ligeros", category_icon: "vegetariano", price: 29, mode: null as MenuMode },
  { id: "m9", name: "Té helado", category: "Bebidas", category_icon: "bebidas", price: 11, mode: null as MenuMode },
];

// Inverso de toOrder (api-client/endpoints/orders.ts): el mock habla en el formato del backend.
const toDto = (o: Order) => ({
  id: o.id,
  student_id: o.customerName,
  items: o.items.map((i) => ({ menu_item_id: i.menuItemId ?? null, product_name: i.name, category_icon: i.categoryIcon ?? null, quantity: i.quantity, notes: i.note ?? null, modifiers: (i.modifiers ?? []).map((name) => ({ name })) })),
  pipeline_status: o.pipelineStatus,
  payment_status: o.paymentStatus,
  requested_ready_time: o.requestedReadyTime ?? null,
  prep_start_time: o.prepStartTime ?? null,
  ready_at: o.readyAt ?? null,
  otp_code: o.deliveryCode,
  payment_reference: o.paymentLink ?? null,
  request_number: Number(o.orderNumber) || 1,
  order_number: Number(o.orderNumber) || null,
  accepted_at: o.acceptedAt ?? null,
  created_at: o.createdAt,
});

type Dto = ReturnType<typeof toDto>;

// Backend en memoria de la estación KDS: login, cola de pedidos y menú.
// `shiftOpen`: la estación ya tiene un turno abierto (si no, llega a la pantalla "Iniciar turno").
// `arrivalsAfterMs`: pasado ese tiempo desde la primera consulta de la cola "llegan" dos pedidos nuevos
// (una solicitud por aceptar y un pedido ya pagado), para probar los sonidos de aviso.
export function kdsBackend(opts: { withPending?: boolean; shiftOpen?: boolean; arrivalsAfterMs?: number } = {}): MockRoute[] {
  const orders: Dto[] = [...ordersFixture, ...(opts.withPending ? pendingOrdersFixture : [])].map(toDto);
  const menu = menuFixture.map((m) => ({ ...m }));
  const station = { active: true };
  // Misma forma que la respuesta del backend: `available` es el valor crudo (apagado por hoy sigue en
  // true), `active` la disponibilidad efectiva e `inactive_mode` el motivo.
  const toMenuDto = (m: (typeof menu)[number]) => ({
    id: m.id,
    name: m.name,
    category: m.category,
    category_icon: m.category_icon,
    price: m.price,
    available: m.mode !== "permanent",
    active: m.mode === null,
    inactive_mode: m.mode,
  });
  const find = (id: string) => orders.find((o) => o.id === id);
  let firstPollAt: number | null = null;
  let arrived = false;

  return [
    ...kdsShiftRoutes({
      open: opts.shiftOpen,
      pendingCount: () => orders.filter((o) => o.pipeline_status === "pending_acceptance").length,
      inProgressCount: () => orders.filter((o) => ["accepted", "in_preparation", "ready_for_pickup"].includes(o.pipeline_status)).length,
    }),
    {
      method: "POST",
      path: "/auth/kds/login",
      respond: ({ body }) =>
        body.pin === DEMO_PIN
          ? {
              access_token: "demo-token",
              kds_user_id: "u1",
              username: body.username,
              restaurant_id: "r1",
              restaurant_name: "Cafetería Central",
            }
          : reply(401, { detail: "Credenciales inválidas" }),
    },
    {
      path: "/api/orders/active",
      respond: () => {
        if (opts.arrivalsAfterMs !== undefined) {
          firstPollAt ??= Date.now();
          if (!arrived && Date.now() - firstPollAt >= opts.arrivalsAfterMs) {
            arrived = true;
            const now = new Date().toISOString();
            orders.push(
              toDto({
                ...pendingOrdersFixture[0]!,
                id: "arr-pending",
                orderNumber: "—",
                customerName: "20250001",
                createdAt: now,
                items: [{ id: "arr-pending-0", menuItemId: "m1", name: "Hamburguesa clásica", quantity: 1 }],
              }),
              toDto({
                ...ordersFixture[0]!,
                id: "arr-paid",
                orderNumber: "77",
                customerName: "20250002",
                createdAt: now,
                pipelineStatus: "accepted",
                paymentStatus: "paid",
                items: [{ id: "arr-paid-0", menuItemId: "m4", name: "Papas fritas", quantity: 2 }],
              }),
            );
          }
        }
        return orders;
      },
    },
    {
      method: "PUT",
      path: /^\/api\/orders\/([^/]+)\/status$/,
      respond: ({ match, body }) => {
        const order = find(match[1] ?? "");
        if (!order) return reply(404, { detail: "Pedido no encontrado" });
        order.pipeline_status = body.pipeline_status;
        if (body.pipeline_status === "accepted") order.payment_reference = "https://pago.demo/qorder";
        if (body.pipeline_status === "rejected") orders.splice(orders.indexOf(order), 1);
        return order;
      },
    },
    {
      // Rechazo con motivo. Como en el backend: out_of_stock exige productos del pedido y los apaga
      // del menú; kitchen_load no admite productos. (Aquí hay una sola estación: se rechaza del todo.)
      method: "POST",
      path: /^\/api\/orders\/([^/]+)\/reject$/,
      respond: ({ match, body }) => {
        const order = find(match[1] ?? "");
        if (!order) return reply(404, { detail: "Pedido no encontrado" });
        const ids: string[] = body.out_of_stock_item_ids ?? [];
        if (body.reason === "out_of_stock") {
          const unknown = ids.filter((id) => !order.items.some((i) => i.menu_item_id === id));
          if (ids.length === 0) return reply(422, { detail: "Con out_of_stock se debe enviar al menos un producto." });
          if (unknown.length > 0) return reply(422, { detail: "Hay productos que no pertenecen al pedido." });
          ids.forEach((id) => {
            const item = menu.find((m) => m.id === id);
            // Como el backend: el rechazo por falta de stock apaga el producto solo por hoy.
            if (item) item.mode = "daily";
          });
        } else if (ids.length > 0) {
          return reply(422, { detail: "out_of_stock_item_ids solo se envía con out_of_stock." });
        }
        orders.splice(orders.indexOf(order), 1);
        return { ...order, pipeline_status: "rejected", reject_reason: body.reason };
      },
    },
    {
      method: "POST",
      path: /^\/api\/orders\/([^/]+)\/validate-otp$/,
      respond: ({ match, body }) => {
        const order = find(match[1] ?? "");
        if (!order) return reply(404, { detail: "Pedido no encontrado" });
        if (order.otp_code !== body.otp_code) return reply(400, { detail: "Código incorrecto" });
        orders.splice(orders.indexOf(order), 1);
        return { detail: "Pedido entregado" };
      },
    },
    {
      method: "POST",
      path: "/webhooks/bac-payment",
      respond: ({ body }) => {
        const order = find(body.order_id);
        if (order) order.payment_status = body.status === "success" ? "paid" : "failed";
        return { ok: true };
      },
    },
    { path: "/api/kds/me", respond: () => ({ kds_user_id: "kds-1", username: "gh-uvg", active: station.active }) },
    {
      // PUT /api/kds/me/active: pausa o reanuda la estación.
      method: "PUT",
      path: "/api/kds/me/active",
      respond: ({ body }) => {
        station.active = Boolean(body.active);
        return { kds_user_id: "kds-1", username: "gh-uvg", active: station.active };
      },
    },
    { path: "/api/kds/menu", respond: () => menu.map(toMenuDto) },
    {
      // PATCH /api/kds/menu/{id}/availability: { active: true } o { active: false, mode: "daily" | "permanent" }.
      method: "PATCH",
      path: /^\/api\/kds\/menu\/([^/]+)\/availability$/,
      respond: ({ match, body }) => {
        const item = menu.find((m) => m.id === match[1]);
        if (!item) return reply(404, { detail: "Item no encontrado." });
        if (!body.active && !["daily", "permanent"].includes(body.mode)) {
          return reply(422, { detail: "Al desactivar se debe indicar mode: permanent o daily." });
        }
        item.mode = body.active ? null : body.mode;
        return toMenuDto(item);
      },
    },
  ];
}
