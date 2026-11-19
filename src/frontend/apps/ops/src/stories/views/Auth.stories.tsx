import type { Meta, StoryObj } from "@storybook/react-vite";
import LoginOps from "../../views/LoginOps";
import OpsChangePassword from "../../views/OpsChangePassword";
import { useOpsAuth } from "../../hooks/useOpsAuth";
import { opsBackend, DEMO_EMAIL, DEMO_PASSWORD, MUST_CHANGE_STORAGE, NEW_ACCOUNT_EMAIL, RESTAURANT_ADMIN_EMAIL } from "../mockBackend";

// Usan el hook real de sesión: se puede escribir y enviar el formulario contra el backend falso.
function LoginDemo() {
  const auth = useOpsAuth();
  if (auth.isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 text-sm font-semibold text-gray-900">
        Sesión iniciada como {auth.userName} ✓
        <button type="button" onClick={auth.logout} className="ml-4 rounded-full px-3 py-1.5 text-xs text-brand-primary ring-1 ring-brand-primary">
          Salir
        </button>
      </div>
    );
  }
  return <LoginOps auth={auth} />;
}

function ChangePasswordDemo() {
  const auth = useOpsAuth();
  return <OpsChangePassword auth={auth} />;
}

const meta = {
  title: "Ops/Pantallas/Acceso",
  parameters: { layout: "fullscreen", mockApi: { routes: () => opsBackend(), resetStorage: true } },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Login: Story = {
  name: `Login (prueba con ${DEMO_EMAIL} / ${DEMO_PASSWORD})`,
  render: () => <LoginDemo />,
};

export const LoginRestaurantAccountRejected: Story = {
  name: `Login con cuenta de restaurante (usa ${RESTAURANT_ADMIN_EMAIL}: se rechaza)`,
  render: () => <LoginDemo />,
};

export const LoginTemporaryPassword: Story = {
  name: `Login con contraseña temporal (usa ${NEW_ACCOUNT_EMAIL})`,
  render: () => <LoginDemo />,
};

export const ChangePasswordRequired: Story = {
  name: `Cambio de contraseña obligatorio (actual: ${DEMO_PASSWORD})`,
  render: () => <ChangePasswordDemo />,
  parameters: { mockApi: { routes: () => opsBackend(), resetStorage: true, storage: MUST_CHANGE_STORAGE } },
};
