import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import ConfirmDialog from "../../components/ConfirmDialog";

const meta = {
  title: "Ops/ConfirmDialog",
  component: ConfirmDialog,
  parameters: { layout: "fullscreen" },
  args: {
    open: true,
    title: "Desactivar restaurante",
    message: "El restaurante dejará de recibir pedidos hasta que se vuelva a activar.",
    confirmLabel: "Desactivar",
    onConfirm: fn(),
    onCancel: fn(),
  },
} satisfies Meta<typeof ConfirmDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
