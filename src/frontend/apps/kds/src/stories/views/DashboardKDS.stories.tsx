import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import DashboardKDS from "../../views/DashboardKDS";
import { boardArgs, nav, ordersFixture, tabletOrdersFixture } from "../fixtures";

const meta = {
  title: "KDS/Pantallas/Entrega (tablero)",
  component: DashboardKDS,
  parameters: { layout: "fullscreen" },
  args: { ...boardArgs, nav: nav("delivery", 1), orders: ordersFixture, advanceStage: fn(), onOpenCode: fn() },
} satisfies Meta<typeof DashboardKDS>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Empty: Story = { args: { orders: [] } };
export const Paused: Story = { args: { isPaused: true } };
export const WithError: Story = { args: { error: "Sin conexión con el servidor." } };

// Tablet de 10 pulgadas: mismo tablero en las dimensiones reales de la pantalla (incluye un pedido grande).
export const Tablet10: Story = {
  name: "Tablet 10 pulgadas horizontal (1280x800)",
  args: { orders: tabletOrdersFixture },
  globals: { viewport: { value: "tablet10", isRotated: false } },
};
export const Tablet10Portrait: Story = {
  name: "Tablet 10 pulgadas vertical (800x1280)",
  args: { orders: tabletOrdersFixture },
  globals: { viewport: { value: "tablet10Portrait", isRotated: false } },
};
