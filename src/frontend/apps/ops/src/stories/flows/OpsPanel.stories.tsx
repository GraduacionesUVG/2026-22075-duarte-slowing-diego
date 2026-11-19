import type { Meta, StoryObj } from "@storybook/react-vite";
import App from "../../App";
import { opsBackend, DEMO_EMAIL, DEMO_PASSWORD, RESTAURANT_ADMIN_EMAIL, SIGNED_IN_STORAGE } from "../mockBackend";

const meta = {
  title: "Ops/Flujos/Panel completo",
  component: App,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `App real del panel Dev/TI contra un backend falso en memoria. Correo **${DEMO_EMAIL}** y contraseña **${DEMO_PASSWORD}**; con **${RESTAURANT_ADMIN_EMAIL}** se rechaza por no ser superadmin. Dar de alta un restaurante lo agrega a la lista mientras no recargues.`,
      },
    },
  },
} satisfies Meta<typeof App>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FromLogin: Story = {
  name: "Desde el login",
  parameters: { mockApi: { routes: () => opsBackend(), resetStorage: true } },
};

export const SignedIn: Story = {
  name: "Con la sesión iniciada",
  parameters: { mockApi: { routes: () => opsBackend(), resetStorage: true, storage: SIGNED_IN_STORAGE } },
};

export const SignedInWithIncident: Story = {
  name: "Con la sesión iniciada y MongoDB caída",
  parameters: { mockApi: { routes: () => opsBackend({ health: "db-down" }), resetStorage: true, storage: SIGNED_IN_STORAGE } },
};
