import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import AcceptanceKDS from "../../views/AcceptanceKDS";
import { boardArgs, nav, pendingOrdersFixture } from "../fixtures";

const meta = {
  title: "KDS/Pantallas/Aceptación",
  component: AcceptanceKDS,
  parameters: { layout: "fullscreen" },
  args: {
    ...boardArgs,
    nav: nav("acceptance"),
    orders: pendingOrdersFixture,
    onAccept: fn(),
    onReject: fn(),
    onSimulatePayment: fn(),
  },
} satisfies Meta<typeof AcceptanceKDS>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithPendingOrders: Story = {};
export const Empty: Story = { args: { orders: [] } };
export const AcceptingOrder: Story = { args: { busyIds: [pendingOrdersFixture[0]!.id] } };
