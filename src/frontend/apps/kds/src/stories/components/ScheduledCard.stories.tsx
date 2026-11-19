import type { Meta, StoryObj } from "@storybook/react-vite";
import ScheduledCard from "../../components/ScheduledCard";
import { ordersFixture } from "../fixtures";

const meta = {
  title: "KDS/ScheduledCard",
  component: ScheduledCard,
  args: { order: ordersFixture[3], now: Date.now() },
  // Las tarjetas son fluidas: se muestran con el ancho de una columna del tablero.
  decorators: [(Story) => <div className="w-[302px]"><Story /></div>],
} satisfies Meta<typeof ScheduledCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WaitingToStart: Story = {};
