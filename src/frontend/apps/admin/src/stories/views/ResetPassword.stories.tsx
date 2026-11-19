import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import ResetPassword from "../../views/ResetPassword";
import { adminBackend } from "../mockBackend";

// La pantalla recibe el token del enlace del correo. En el mock: valid-token, welcome-token,
// expired-token y used-token. Para probarla en la app real, abre /reset-password?token=...
const meta = {
  title: "Admin/Pantallas/Restablecer contraseña",
  component: ResetPassword,
  parameters: { layout: "fullscreen", mockApi: { routes: () => adminBackend(), resetStorage: true } },
  args: { token: "valid-token", onBackToLogin: fn() },
} satisfies Meta<typeof ResetPassword>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: "Formulario (escribe una contraseña de 8+ caracteres)" };
export const NewAccount: Story = { name: "Cuenta nueva (define su contraseña inicial)", args: { token: "welcome-token" } };
export const ExpiredLink: Story = { name: "Enlace vencido", args: { token: "expired-token" } };
export const UsedLink: Story = { name: "Enlace ya usado", args: { token: "used-token" } };
export const MissingToken: Story = { name: "Enlace sin token", args: { token: null } };
