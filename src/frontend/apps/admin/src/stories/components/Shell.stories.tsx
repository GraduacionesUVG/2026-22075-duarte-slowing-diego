import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import AdminShell from "../../components/AdminShell";
import Sidebar from "../../components/Sidebar";
import TopBar from "../../components/TopBar";

const NAV_ITEMS = [
  { label: "Dashboard" },
  { label: "Menús y Precios" },
  { label: "Categorías" },
  { label: "Importación de catálogos" },
  { label: "Configuración" },
];

const meta = {
  title: "Admin/Layout",
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const SidebarOnly: Story = {
  name: "Sidebar",
  render: () => (
    <div className="h-[420px]">
      <Sidebar items={NAV_ITEMS} activeIndex={1} onSelect={fn()} />
    </div>
  ),
};

export const TopBarOnly: Story = {
  name: "TopBar",
  render: () => <TopBar title="Menús y Precios" userName="María López · Cafetería Central" onLogout={fn()} />,
};

export const Shell: Story = {
  name: "AdminShell",
  render: () => (
    <AdminShell navItems={NAV_ITEMS} activeIndex={0} onSelect={fn()} title="Dashboard" userName="María López · Cafetería Central" onLogout={fn()}>
      <p className="text-sm text-gray-500">Contenido de la página</p>
    </AdminShell>
  ),
};
