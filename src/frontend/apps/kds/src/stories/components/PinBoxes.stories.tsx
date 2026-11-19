import type { Meta, StoryObj } from "@storybook/react-vite";
import PinBoxes from "../../components/PinBoxes";

const meta = {
  title: "KDS/PinBoxes",
  component: PinBoxes,
  args: { length: 4, value: "" },
} satisfies Meta<typeof PinBoxes>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};
export const Partial: Story = { args: { value: "12" } };
export const Complete: Story = { args: { value: "1234" } };
export const WithError: Story = { args: { value: "1234", error: true } };
