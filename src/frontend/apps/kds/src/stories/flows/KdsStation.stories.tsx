import type { Meta, StoryObj } from "@storybook/react-vite";
import App from "../../App";
import { kdsBackend, DEMO_PIN, DEMO_USER } from "../mockBackend";

const meta = {
  title: "KDS/Flujos/Estación completa",
  component: App,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `App real del KDS contra un backend falso en memoria. Ingresa con usuario **${DEMO_USER}** y PIN **${DEMO_PIN}**; el código de entrega de cada pedido está en el fixture (ej. #43 → 9024).`,
      },
    },
  },
} satisfies Meta<typeof App>;

export default meta;
type Story = StoryObj<typeof meta>;

// Login → tablero de entrega → avanzar pedidos → código de entrega → menú → aceptación.
export const FromLogin: Story = {
  name: "Desde el login",
  parameters: { mockApi: { routes: () => kdsBackend({ withPending: true }), resetStorage: true } },
};

// Sesión con turno abierto donde, a los ~10 s, llegan dos pedidos nuevos: suenan los avisos de
// Aceptación y de Entrega. Sube el volumen y toca la pantalla una vez (el navegador exige un toque
// antes de dejar sonar audio).
export const NewOrdersArrive: Story = {
  name: "Llegan pedidos nuevos (suenan los avisos)",
  parameters: {
    mockApi: {
      routes: () => kdsBackend({ withPending: true, shiftOpen: true, arrivalsAfterMs: 8000 }),
      resetStorage: true,
      storage: {
        qorder_auth_token: "demo-token",
        kds_username: DEMO_USER,
        kds_restaurant_id: "r1",
        kds_restaurant_name: "Cafetería Central",
      },
    },
  },
};

// Sesión ya iniciada: arranca directo en el tablero.
export const SignedIn: Story = {
  name: "Con la sesión iniciada",
  parameters: {
    mockApi: {
      routes: () => kdsBackend({ withPending: true }),
      resetStorage: true,
      storage: {
        qorder_auth_token: "demo-token",
        kds_username: DEMO_USER,
        kds_restaurant_id: "r1",
        kds_restaurant_name: "Cafetería Central",
      },
    },
  },
};
