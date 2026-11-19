import type { Meta, StoryObj } from "@storybook/react-vite";
import App from "../../App";
import { adminBackend, DEMO_EMAIL, DEMO_PASSWORD, NEW_ACCOUNT_EMAIL, SIGNED_IN_STORAGE } from "../mockBackend";

const meta = {
  title: "Admin/Flujos/Panel completo",
  component: App,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `App real del panel de administración contra un backend falso en memoria. Correo **${DEMO_EMAIL}** y contraseña **${DEMO_PASSWORD}**. Con **${NEW_ACCOUNT_EMAIL}** se obliga a cambiar la contraseña antes de entrar. Los cambios (menú, horarios, estaciones KDS) se guardan en memoria mientras no recargues.`,
      },
    },
  },
} satisfies Meta<typeof App>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FromLogin: Story = {
  name: "Desde el login",
  parameters: { mockApi: { routes: () => adminBackend(), resetStorage: true } },
};

export const SignedIn: Story = {
  name: "Con la sesión iniciada",
  parameters: { mockApi: { routes: () => adminBackend(), resetStorage: true, storage: SIGNED_IN_STORAGE } },
};
