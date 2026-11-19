import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import ToggleSwitch from "../../components/ToggleSwitch";

const meta = {
  title: "Admin/ToggleSwitch",
  component: ToggleSwitch,
  args: {
    checked: true,
    label: "Recibir pedidos",
    description: "Permite que los estudiantes hagan pedidos por WhatsApp.",
    onChange: () => {},
  },
  decorators: [(Story) => <div className="w-[420px]"><Story /></div>],
} satisfies Meta<typeof ToggleSwitch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const On: Story = {};
export const Off: Story = { args: { checked: false } };
export const Interactive: Story = {
  render: (args) => {
    const [checked, setChecked] = useState(args.checked);
    return <ToggleSwitch {...args} checked={checked} onChange={setChecked} />;
  },
};
