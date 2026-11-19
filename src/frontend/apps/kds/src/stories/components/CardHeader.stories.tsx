import type { Meta, StoryObj } from "@storybook/react-vite";
import CardHeader from "../../components/CardHeader";

const meta = {
  title: "KDS/CardHeader",
  component: CardHeader,
  args: { tone: "ontime", orderNumber: "42", customerName: "20240123", elapsedLabel: "00:03:12" },
  argTypes: { tone: { control: "inline-radio", options: ["ontime", "warning", "late", "payment"] } },
  // La cabecera se posiciona de forma absoluta dentro de la tarjeta.
  decorators: [(Story) => <div className="relative h-[110px] w-[302px] rounded-[30px] bg-white"><Story /></div>],
} satisfies Meta<typeof CardHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const OnTime: Story = {};
export const Warning: Story = { args: { tone: "warning", elapsedLabel: "00:07:40" } };
export const Late: Story = { args: { tone: "late", elapsedLabel: "00:14:05" } };
export const AwaitingPayment: Story = { args: { tone: "payment", elapsedLabel: "00:01:20" } };
export const Paid: Story = { name: "Pagado (Entrega)", args: { tone: "late", elapsedLabel: "00:24:06", paid: true } };
