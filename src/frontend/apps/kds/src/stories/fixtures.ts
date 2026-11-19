import type { Order } from "@repo/api-client";
import type { ViewNav } from "../components/BoardLayout";

const minutesAgo = (m: number) => new Date(Date.now() - m * 60_000).toISOString();
const minutesAhead = (m: number) => new Date(Date.now() + m * 60_000).toISOString();

const base = {
  orderType: "takeout" as const,
  paymentStatus: "paid" as const,
  deliveryCode: "4821",
};

export const ordersFixture: Order[] = [
  {
    ...base,
    id: "o1",
    orderNumber: "41",
    customerName: "20240123",
    createdAt: minutesAgo(2),
    pipelineStatus: "accepted",
    items: [
      { id: "o1-0", menuItemId: "m1", categoryIcon: "hamburguesas", name: "Hamburguesa clásica", quantity: 2, modifiers: ["Sin cebolla"] },
      { id: "o1-1", menuItemId: "m4", categoryIcon: "papas", name: "Papas fritas", quantity: 1 },
    ],
  },
  {
    ...base,
    id: "o2",
    orderNumber: "42",
    customerName: "20231876",
    createdAt: minutesAgo(8),
    pipelineStatus: "in_preparation",
    deliveryCode: "1357",
    items: [{ id: "o2-0", menuItemId: "m2", categoryIcon: "burritos", name: "Burrito de pollo", quantity: 1, modifiers: ["Extra queso"] }],
  },
  {
    ...base,
    id: "o3",
    orderNumber: "43",
    customerName: "20225511",
    createdAt: minutesAgo(15),
    pipelineStatus: "ready_for_pickup",
    deliveryCode: "9024",
    items: [
      { id: "o3-0", menuItemId: "m3", categoryIcon: "ensaladas", name: "Ensalada César", quantity: 1 },
      { id: "o3-1", menuItemId: "m5", categoryIcon: "jugos", name: "Limonada", quantity: 2 },
    ],
  },
  {
    ...base,
    id: "o4",
    orderNumber: "44",
    customerName: "20240999",
    createdAt: minutesAgo(1),
    pipelineStatus: "accepted",
    requestedReadyTime: minutesAhead(40),
    prepStartTime: minutesAhead(25),
    deliveryCode: "6610",
    items: [{ id: "o4-0", menuItemId: "m6", categoryIcon: "pizza", name: "Combo pizza personal", quantity: 1 }],
  },
];

// Pedido grande: muchos productos, varios con modificadores (el backend los une en `note`).
export const heavyOrderFixture: Order = {
  ...base,
  id: "h1",
  orderNumber: "45",
  customerName: "20240555",
  createdAt: minutesAgo(11),
  pipelineStatus: "in_preparation",
  items: [
    { id: "h1-0", menuItemId: "m1", categoryIcon: "hamburguesas", name: "Hamburguesa doble", quantity: 3, modifiers: ["Sin cebolla", "Extra queso", "Término medio"], note: "Alergia a las nueces" },
    { id: "h1-1", menuItemId: "m4", categoryIcon: "papas", name: "Papas fritas grandes", quantity: 2, modifiers: ["Sin sal"] },
    { id: "h1-2", menuItemId: "m2", categoryIcon: "burritos", name: "Burrito de pollo", quantity: 1, modifiers: ["Sin crema", "Salsa aparte"] },
    { id: "h1-3", menuItemId: "m3", categoryIcon: "ensaladas", name: "Ensalada César", quantity: 2, modifiers: ["Aderezo aparte"] },
    { id: "h1-4", menuItemId: "m5", categoryIcon: "jugos", name: "Limonada", quantity: 4, modifiers: ["Sin azúcar"] },
    { id: "h1-5", menuItemId: "m9", categoryIcon: "bebidas", name: "Té helado", quantity: 2 },
    { id: "h1-6", menuItemId: "m7", categoryIcon: "sandwiches", name: "Sándwich de pavo", quantity: 1, modifiers: ["Pan integral", "Sin tomate", "Con mostaza"] },
    { id: "h1-7", menuItemId: "m6", categoryIcon: "pizza", name: "Combo pizza personal", quantity: 2, modifiers: ["Extra pepperoni"] },
    { id: "h1-8", menuItemId: "m10", categoryIcon: "postres", name: "Brownie con helado", quantity: 3 },
  ],
};

// Tablero de muestra para la tablet de 10": pedidos normales más el pedido grande.
export const tabletOrdersFixture: Order[] = [
  ...ordersFixture.slice(0, 3),
  heavyOrderFixture,
  {
    ...base,
    id: "t5",
    orderNumber: "46",
    customerName: "20241234",
    createdAt: minutesAgo(4),
    pipelineStatus: "accepted",
    items: [{ id: "t5-0", menuItemId: "m3", categoryIcon: "ensaladas", name: "Ensalada César", quantity: 1, modifiers: ["Sin crutones"] }],
  },
];

// Pedidos nuevos que la cocina todavía no acepta (vista de Aceptación).
export const pendingOrdersFixture: Order[] = [
  {
    ...base,
    id: "p1",
    orderNumber: "—",
    customerName: "20241001",
    createdAt: minutesAgo(1),
    pipelineStatus: "pending_acceptance",
    paymentStatus: "pending",
    items: [{ id: "p1-0", menuItemId: "m7", categoryIcon: "sandwiches", name: "Sándwich de pavo", quantity: 2 }],
  },
  {
    ...base,
    id: "p2",
    orderNumber: "—",
    customerName: "20230777",
    createdAt: minutesAgo(6),
    pipelineStatus: "pending_acceptance",
    paymentStatus: "pending",
    requestedReadyTime: minutesAhead(30),
    items: [
      { id: "p2-0", menuItemId: "m8", categoryIcon: "vegetariano", name: "Wrap vegetariano", quantity: 1, modifiers: ["Sin aguacate"] },
      { id: "p2-1", menuItemId: "m9", categoryIcon: "bebidas", name: "Té helado", quantity: 1 },
    ],
  },
];

export const nav = (active: ViewNav["active"], waitingCount = 0): ViewNav => ({
  active,
  allowed: ["acceptance", "delivery", "menu"],
  onChange: () => {},
  counts: { acceptance: pendingOrdersFixture.length, delivery: 3 },
  waiting: { count: waitingCount, open: false, onToggle: () => {} },
});

// Props comunes de las vistas con BoardLayout.
export const boardArgs = {
  localName: "Cafetería Central",
  error: null,
  isPaused: false,
  togglePaused: () => {},
  reload: () => {},
  onLogout: () => {},
};
