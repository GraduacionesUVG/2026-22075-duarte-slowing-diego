import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import DisableItemDialog from "../../components/DisableItemDialog";

const meta = {
  title: "KDS/DisableItemDialog",
  component: DisableItemDialog,
  parameters: { layout: "fullscreen" },
  args: { itemName: "Hamburguesa clásica", onChoose: fn(), onCancel: fn() },
} satisfies Meta<typeof DisableItemDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const LongName: Story = { name: "Nombre largo", args: { itemName: "Combo familiar de pizza con papas y bebida grande" } };
