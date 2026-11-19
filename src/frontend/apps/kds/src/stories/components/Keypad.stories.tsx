import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import Keypad from "../../components/Keypad";

const meta = {
  title: "KDS/Keypad",
  component: Keypad,
  args: { onDigit: fn(), onClear: fn(), onBackspace: fn() },
} satisfies Meta<typeof Keypad>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
