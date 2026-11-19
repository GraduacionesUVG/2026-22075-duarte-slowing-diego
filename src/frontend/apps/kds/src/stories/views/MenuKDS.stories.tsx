import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { reply } from "@repo/config/storybook/mockApi";
import MenuKDS from "../../views/MenuKDS";
import { boardArgs, nav } from "../fixtures";
import { kdsBackend } from "../mockBackend";

const { localName, isPaused, togglePaused, onLogout } = boardArgs;

const meta = {
  title: "KDS/Pantallas/Menú",
  component: MenuKDS,
  parameters: { layout: "fullscreen", mockApi: { routes: () => kdsBackend() } },
  args: { localName, isPaused, togglePaused, onLogout, nav: nav("menu"), onUnauthorized: fn() },
} satisfies Meta<typeof MenuKDS>;

export default meta;
type Story = StoryObj<typeof meta>;

// Interactivo: al apagar un producto el mock lo guarda (con la latencia simulada).
export const Default: Story = {};
export const Empty: Story = {
  parameters: { mockApi: { routes: () => [{ path: "/api/kds/menu", respond: () => [] }] } },
};
export const ServerError: Story = {
  parameters: {
    mockApi: { routes: () => [{ path: "/api/kds/menu", respond: () => reply(500, { detail: "Error interno" }) }] },
  },
};
