import type { Meta, StoryObj } from "@storybook/react-vite";
import LoginAdmin from "../../views/LoginAdmin";
import ChangePassword from "../../views/ChangePassword";
import { useAdminAuth } from "../../hooks/useAdminAuth";
import { adminBackend, DEMO_EMAIL, DEMO_PASSWORD, MUST_CHANGE_STORAGE, NEW_ACCOUNT_EMAIL } from "../mockBackend";

// Usan el hook real de sesión: se puede escribir y enviar el formulario contra el backend falso.
function LoginDemo() {
  const auth = useAdminAuth();
  if (auth.isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 text-sm font-semibold text-gray-900">
        Sesión iniciada como {auth.adminName} ✓
        <button type="button" onClick={auth.logout} className="ml-4 rounded-full px-3 py-1.5 text-xs text-brand-primary ring-1 ring-brand-primary">
          Salir
        </button>
      </div>
    );
  }
  return <LoginAdmin auth={auth} />;
}

function ChangePasswordDemo() {
  const auth = useAdminAuth();
  return <ChangePassword auth={auth} />;
}

const meta = {
  title: "Admin/Pantallas/Acceso",
  parameters: { layout: "fullscreen", mockApi: { routes: () => adminBackend(), resetStorage: true } },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Login: Story = {
  name: `Login (prueba con ${DEMO_EMAIL} / ${DEMO_PASSWORD})`,
  render: () => <LoginDemo />,
};

export const LoginTemporaryPassword: Story = {
  name: `Login con contraseña temporal (usa ${NEW_ACCOUNT_EMAIL} / ${DEMO_PASSWORD})`,
  render: () => <LoginDemo />,
};

export const ChangePasswordRequired: Story = {
  name: `Cambio de contraseña obligatorio (actual: ${DEMO_PASSWORD})`,
  render: () => <ChangePasswordDemo />,
  parameters: { mockApi: { routes: () => adminBackend(), resetStorage: true, storage: MUST_CHANGE_STORAGE } },
};
