import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import AcceptanceCard from "../../components/AcceptanceCard";
import { pendingOrdersFixture } from "../fixtures";

const meta = {
  title: "KDS/AcceptanceCard",
  component: AcceptanceCard,
  args: { order: pendingOrdersFixture[0], tier: "ontime", elapsedLabel: "00:01:10", onAccept: fn(), onReject: fn() },
  // Las tarjetas son fluidas: se muestran con el ancho de una columna del tablero.
  decorators: [(Story) => <div className="w-[302px]"><Story /></div>],
  argTypes: { tier: { control: "inline-radio", options: ["ontime", "warning", "late"] } },
} satisfies Meta<typeof AcceptanceCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const New: Story = {};
export const WithNotesAndPickupTime: Story = { args: { order: pendingOrdersFixture[1], tier: "warning", elapsedLabel: "00:06:00" } };
export const Waiting: Story = { args: { tier: "late", elapsedLabel: "00:13:45" } };
