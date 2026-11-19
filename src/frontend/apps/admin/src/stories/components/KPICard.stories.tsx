import type { Meta, StoryObj } from "@storybook/react-vite";
import KPICard from "../../components/KPICard";

const meta = {
  title: "Admin/KPICard",
  component: KPICard,
  args: { label: "Pedidos hoy", value: "128", trend: "+12% vs ayer", trendTone: "success" },
  argTypes: { trendTone: { control: "inline-radio", options: ["success", "error", "muted"] } },
} satisfies Meta<typeof KPICard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Positive: Story = {};
export const Negative: Story = { args: { trend: "-8% vs ayer", trendTone: "error" } };
export const Neutral: Story = { args: { trend: "Sin cambios", trendTone: "muted" } };
