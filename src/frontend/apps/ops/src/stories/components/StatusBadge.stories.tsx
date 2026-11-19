import type { Meta, StoryObj } from "@storybook/react-vite";
import StatusBadge from "../../components/StatusBadge";

const meta = {
  title: "Ops/StatusBadge",
  component: StatusBadge,
  args: { status: "success", label: "Activo" },
  argTypes: { status: { control: "inline-radio", options: ["success", "warning", "error", "info"] } },
} satisfies Meta<typeof StatusBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Success: Story = {};
export const Warning: Story = { args: { status: "warning", label: "Pendiente" } };
export const Error: Story = { args: { status: "error", label: "Inactivo" } };
export const Info: Story = { args: { status: "info", label: "En revisión" } };
