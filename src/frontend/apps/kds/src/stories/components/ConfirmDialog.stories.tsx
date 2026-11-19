import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import ConfirmDialog from "../../components/ConfirmDialog";

const meta = {
  title: "KDS/ConfirmDialog",
  component: ConfirmDialog,
  parameters: { layout: "fullscreen" },
  args: {
    open: true,
    title: "Cerrar sesión",
    message: "¿Seguro que quieres cerrar la sesión de esta estación?",
    onConfirm: fn(),
    onCancel: fn(),
  },
} satisfies Meta<typeof ConfirmDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Danger: Story = {
  args: { danger: true, title: "Rechazar pedido", message: "El cliente recibirá un aviso.", confirmLabel: "Rechazar" },
};
