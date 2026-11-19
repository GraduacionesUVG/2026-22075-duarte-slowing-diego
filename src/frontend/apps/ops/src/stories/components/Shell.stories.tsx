import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import OpsShell from "../../components/OpsShell";
import Sidebar from "../../components/Sidebar";
import TopBar from "../../components/TopBar";

const NAV_ITEMS = [{ label: "Estado del sistema" }, { label: "Restaurantes" }, { label: "Eventos" }];

const meta = {
  title: "Ops/Layout",
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const SidebarOnly: Story = {
  name: "Sidebar",
  render: () => (
    <div className="h-[420px]">
      <Sidebar items={NAV_ITEMS} activeIndex={0} onSelect={fn()} />
    </div>
  ),
};

export const TopBarOnly: Story = {
  name: "TopBar",
  render: () => <TopBar title="QOrder / Restaurantes" userName="Equipo TI · Superadmin" onLogout={fn()} />,
};

export const Shell: Story = {
  name: "OpsShell",
  render: () => (
    <OpsShell navItems={NAV_ITEMS} activeIndex={0} onSelect={fn()} title="QOrder / Estado del sistema" userName="Equipo TI · Superadmin" onLogout={fn()}>
      <p className="text-sm text-gray-500">Contenido de la página</p>
    </OpsShell>
  ),
};
