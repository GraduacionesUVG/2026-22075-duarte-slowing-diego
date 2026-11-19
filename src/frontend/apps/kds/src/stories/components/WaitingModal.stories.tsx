import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import WaitingModal from "../../components/WaitingModal";
import { ordersFixture } from "../fixtures";

const waiting = (n: number) => ({
  ...ordersFixture[3]!,
  id: `w${n}`,
  orderNumber: String(50 + n),
  prepStartTime: new Date(Date.now() + (20 + n * 15) * 60_000).toISOString(),
  requestedReadyTime: new Date(Date.now() + (35 + n * 15) * 60_000).toISOString(),
});

const meta = {
  title: "KDS/WaitingModal",
  component: WaitingModal,
  parameters: { layout: "fullscreen" },
  args: { orders: ordersFixture, now: Date.now(), onClose: fn() },
} satisfies Meta<typeof WaitingModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: "Con pedidos en espera" };
export const Many: Story = { name: "Varios pedidos", args: { orders: [1, 2, 3, 4, 5].map(waiting) } };
export const Empty: Story = { name: "Sin pedidos en espera", args: { orders: [] } };
