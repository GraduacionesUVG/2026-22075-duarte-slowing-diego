import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import RejectOrderDialog from "../../components/RejectOrderDialog";
import { pendingOrdersFixture } from "../fixtures";

const meta = {
  title: "KDS/RejectOrderDialog",
  component: RejectOrderDialog,
  parameters: { layout: "fullscreen" },
  args: { order: pendingOrdersFixture[1]!, onCancel: fn(), onConfirm: fn() },
} satisfies Meta<typeof RejectOrderDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

// Elige un motivo; con "Producto agotado" aparece la lista de lo que pidió el cliente.
export const Default: Story = {};
export const SingleProduct: Story = { name: "Pedido con un solo producto", args: { order: pendingOrdersFixture[0]! } };
export const WithoutProductIds: Story = {
  name: "Pedido sin ids de producto (backend viejo)",
  args: {
    order: {
      ...pendingOrdersFixture[0]!,
      items: pendingOrdersFixture[0]!.items.map((item) => ({ ...item, menuItemId: undefined })),
    },
  },
};
