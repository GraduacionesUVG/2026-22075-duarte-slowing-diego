import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import DeliveryCodeKDS from "../../views/DeliveryCodeKDS";
import { ordersFixture } from "../fixtures";

const meta = {
  title: "KDS/Pantallas/Código de entrega",
  component: DeliveryCodeKDS,
  parameters: { layout: "fullscreen" },
  args: { order: ordersFixture[2], onBack: fn() },
} satisfies Meta<typeof DeliveryCodeKDS>;

export default meta;
type Story = StoryObj<typeof meta>;

// El código correcto es 9024; el mock rechaza cualquier otro.
export const CodeAccepted: Story = { args: { onConfirm: async (_id, code) => code === "9024" } };
export const CodeRejected: Story = { args: { onConfirm: async () => false } };
