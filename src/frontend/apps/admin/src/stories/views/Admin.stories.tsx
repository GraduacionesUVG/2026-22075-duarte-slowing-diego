import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { reply } from "@repo/config/storybook/mockApi";
import DashboardHome from "../../views/DashboardHome";
import MenuPricing from "../../views/MenuPricing";
import Categories from "../../views/Categories";
import CatalogImport from "../../views/CatalogImport";
import RestaurantSettings from "../../views/RestaurantSettings";
import ShiftsSummary from "../../views/ShiftsSummary";
import AdminShell from "../../components/AdminShell";
import { adminBackend, SIGNED_IN_STORAGE } from "../mockBackend";

// Todas las pantallas de contenido se muestran dentro del AdminShell, como en la app real.
const NAV_ITEMS = [
  { label: "Dashboard" },
  { label: "Menús y Precios" },
  { label: "Categorías" },
  { label: "Importación de catálogos" },
  { label: "Configuración" },
  { label: "Resumen de turnos" },
];

const mockApi = { routes: () => adminBackend(), storage: SIGNED_IN_STORAGE };

const meta = {
  title: "Admin/Pantallas/Contenido",
  parameters: { layout: "fullscreen", mockApi },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const shell = (index: number, title: string, content: React.ReactNode) => (
  <AdminShell
    navItems={NAV_ITEMS}
    activeIndex={index}
    onSelect={fn()}
    title={title}
    userName="María López · Cafetería Central"
    onLogout={fn()}
  >
    {content}
  </AdminShell>
);

export const Dashboard: Story = { render: () => shell(0, "Dashboard", <DashboardHome />) };

export const DashboardServerError: Story = {
  render: () => shell(0, "Dashboard", <DashboardHome />),
  parameters: { mockApi: { ...mockApi, routes: () => [{ path: "/api/metrics/kpis", respond: () => reply(500, { detail: "Error interno" }) }] } },
};

export const MenuAndPrices: Story = {
  name: "Menús y Precios",
  render: () => shell(1, "Menús y Precios", <MenuPricing localName="Cafetería Central" onGoToImport={fn()} onGoToCategories={fn()} />),
};

export const CategoriesView: Story = {
  name: "Categorías",
  render: () => shell(2, "Categorías", <Categories localName="Cafetería Central" />),
};

export const CategoriesLoading: Story = {
  name: "Categorías (cargando)",
  render: () => shell(2, "Categorías", <Categories localName="Cafetería Central" />),
  parameters: { mockApi: { ...mockApi, delay: 60_000, routes: () => adminBackend() } },
};

export const MenuAndPricesLoading: Story = {
  name: "Menús y Precios (cargando)",
  render: () =>
    shell(1, "Menús y Precios", <MenuPricing localName="Cafetería Central" onGoToImport={fn()} onGoToCategories={fn()} />),
  parameters: { mockApi: { ...mockApi, delay: 60_000, routes: () => adminBackend() } },
};

export const MenuAndPricesManyItems: Story = {
  name: "Menús y Precios (muchos platillos, con paginación)",
  render: () => shell(1, "Menús y Precios", <MenuPricing localName="Cafetería Central" onGoToImport={fn()} onGoToCategories={fn()} />),
  parameters: { mockApi: { ...mockApi, routes: () => adminBackend({ manyItems: true }) } },
};

export const CatalogImports: Story = {
  name: "Importación de catálogos",
  render: () => shell(3, "Importación de catálogos", <CatalogImport />),
};

export const MenuAndPricesSaveFails: Story = {
  name: "Menús y Precios (falla al guardar)",
  render: () => shell(1, "Menús y Precios", <MenuPricing localName="Cafetería Central" onGoToImport={fn()} onGoToCategories={fn()} />),
  parameters: { mockApi: { ...mockApi, routes: () => adminBackend({ failSaves: true }) } },
};

export const Settings: Story = {
  name: "Configuración del restaurante",
  render: () => shell(4, "Configuración", <RestaurantSettings localName="Cafetería Central" />),
};

export const SettingsKdsStations: Story = {
  name: "Configuración · Estaciones KDS",
  render: () => shell(4, "Configuración", <RestaurantSettings localName="Cafetería Central" initialTab="Estaciones KDS" />),
};

export const DashboardLoading: Story = {
  name: "Dashboard (cargando)",
  render: () => shell(0, "Dashboard", <DashboardHome />),
  parameters: { mockApi: { ...mockApi, delay: 60_000, routes: () => adminBackend() } },
};

export const SettingsLoading: Story = {
  name: "Configuración (cargando)",
  render: () => shell(4, "Configuración", <RestaurantSettings localName="Cafetería Central" />),
  parameters: { mockApi: { ...mockApi, delay: 60_000, routes: () => adminBackend() } },
};

export const SettingsKdsStationsLoading: Story = {
  name: "Configuración · Estaciones KDS (cargando)",
  render: () => shell(4, "Configuración", <RestaurantSettings localName="Cafetería Central" initialTab="Estaciones KDS" />),
  parameters: { mockApi: { ...mockApi, delay: 60_000, routes: () => adminBackend() } },
};

export const Shifts: Story = {
  name: "Resumen de turnos",
  render: () => shell(5, "Resumen de turnos", <ShiftsSummary />),
};

export const ShiftsLoading: Story = {
  name: "Resumen de turnos (cargando)",
  render: () => shell(5, "Resumen de turnos", <ShiftsSummary />),
  parameters: { mockApi: { ...mockApi, delay: 60_000, routes: () => adminBackend() } },
};

export const ShiftsManyWithPagination: Story = {
  name: "Resumen de turnos (muchos turnos, con paginación)",
  render: () => shell(5, "Resumen de turnos", <ShiftsSummary />),
  parameters: { mockApi: { ...mockApi, routes: () => adminBackend({ manyShifts: true }) } },
};
