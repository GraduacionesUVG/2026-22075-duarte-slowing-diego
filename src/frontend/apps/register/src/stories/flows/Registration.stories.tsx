import type { Meta, StoryObj } from "@storybook/react-vite";
import App from "../../App";
import { registerBackend, CONFLICT_EMAIL, DEMO_OTP } from "../mockBackend";

const meta = {
  title: "Register/Flujos/Registro completo",
  component: App,
  parameters: {
    layout: "fullscreen",
    mockApi: { routes: () => registerBackend(), resetStorage: true },
    docs: {
      description: {
        component: `App real de registro contra un backend falso. Llena el formulario con cualquier dato y el código OTP es **${DEMO_OTP}**. Con el correo **${CONFLICT_EMAIL}** aparece la pantalla de "ya registrado" (al confirmar el cambio, continúa al OTP).`,
      },
    },
  },
} satisfies Meta<typeof App>;

export default meta;
type Story = StoryObj<typeof meta>;

// Formulario → código OTP → registro exitoso (o conflicto de correo ya vinculado).
export const FullFlow: Story = { name: "Flujo completo" };
