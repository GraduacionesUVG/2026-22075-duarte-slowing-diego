import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import type { Order } from "@repo/api-client";
import OrderCard from "../../components/OrderCard";

const order: Order = {
  id: "ord-1",
  orderNumber: "42",
  customerName: "20240123",
  orderType: "takeout",
  createdAt: "2026-01-01T12:00:00Z",
  items: [
    { id: "ord-1-0", categoryIcon: "hamburguesas", name: "Hamburguesa clásica", quantity: 2, modifiers: ["Sin cebolla"] },
    { id: "ord-1-1", categoryIcon: "papas", name: "Papas fritas", quantity: 1 },
  ],
  pipelineStatus: "accepted",
  paymentStatus: "paid",
  deliveryCode: "4821",
};

const meta = {
  title: "KDS/OrderCard",
  component: OrderCard,
  args: { order, tier: "ontime", elapsedLabel: "03:12", onAdvance: fn(), onOpenCode: fn() },
  // Las tarjetas son fluidas: se muestran con el ancho de una columna del tablero.
  decorators: [(Story) => <div className="w-[302px]"><Story /></div>],
  argTypes: { tier: { control: "inline-radio", options: ["ontime", "warning", "late"] } },
} satisfies Meta<typeof OrderCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const manyItemsOrder: Order = {
  ...order,
  id: "ord-many",
  orderNumber: "45",
  items: [
    { id: "m-0", categoryIcon: "hamburguesas", name: "Hamburguesa doble", quantity: 3, modifiers: ["Sin cebolla", "Extra queso", "Término medio"], note: "Alergia a las nueces" },
    { id: "m-1", categoryIcon: "papas", name: "Papas fritas grandes", quantity: 2, modifiers: ["Sin sal"] },
    { id: "m-2", categoryIcon: "burritos", name: "Burrito de pollo", quantity: 1, modifiers: ["Sin crema", "Salsa aparte"] },
    { id: "m-3", categoryIcon: "ensaladas", name: "Ensalada César", quantity: 2, modifiers: ["Aderezo aparte"] },
    { id: "m-4", categoryIcon: "jugos", name: "Limonada", quantity: 4, modifiers: ["Sin azúcar"] },
    { id: "m-5", categoryIcon: "bebidas", name: "Té helado", quantity: 2 },
    { id: "m-6", categoryIcon: "sandwiches", name: "Sándwich de pavo", quantity: 1, modifiers: ["Pan integral", "Sin tomate", "Con mostaza"] },
    { id: "m-7", categoryIcon: "pizza", name: "Combo pizza personal", quantity: 2, modifiers: ["Extra pepperoni"] },
    { id: "m-8", categoryIcon: "postres", name: "Brownie con helado", quantity: 3 },
  ],
};

export const Queued: Story = {};
// Número de pedido largo: debe verse completo en su línea (no truncarse como antes).
export const LongOrderNumber: Story = { args: { order: { ...order, orderNumber: "20458", customerName: "20240123" }, elapsedLabel: "00:00:41" } };
// Pedido grande con modificadores: la lista hace scroll dentro de la tarjeta.
export const ManyItemsWithModifiers: Story = { args: { order: manyItemsOrder, tier: "warning", elapsedLabel: "11:20" } };
export const LongModifiers: Story = {
  args: {
    order: {
      ...order,
      items: [
        { id: "l-0", categoryIcon: "hamburguesas", name: "Hamburguesa clásica", quantity: 2, modifiers: ["Sin cebolla", "Sin pepinillos", "Extra queso cheddar", "Término tres cuartos", "Pan sin gluten"] },
        { id: "l-1", categoryIcon: "papas", name: "Papas fritas", quantity: 1, modifiers: ["Sin sal", "Salsa BBQ aparte"] },
      ],
    },
  },
};
export const Preparing: Story = { args: { order: { ...order, pipelineStatus: "in_preparation" }, tier: "warning", elapsedLabel: "09:40" } };
export const Ready: Story = { args: { order: { ...order, pipelineStatus: "ready_for_pickup" }, tier: "late", elapsedLabel: "16:05" } };
