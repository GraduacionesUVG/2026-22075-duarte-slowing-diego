import type { Meta, StoryObj } from "@storybook/react-vite";
import PageShell from "../../components/PageShell";

const meta = {
  title: "Register/PageShell",
  component: PageShell,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof PageShell>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <>
        <h1 className="text-xl font-bold text-gray-900">Registro</h1>
        <p className="text-sm text-gray-500">Contenido de ejemplo dentro del contenedor de la página.</p>
      </>
    ),
  },
};
