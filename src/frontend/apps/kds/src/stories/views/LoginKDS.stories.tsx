import type { Meta, StoryObj } from "@storybook/react-vite";
import LoginKDS from "../../views/LoginKDS";
import { useKdsAuth } from "../../hooks/useKdsAuth";
import { kdsBackend, DEMO_PIN, DEMO_USER } from "../mockBackend";

// Usa el hook real: se puede teclear el usuario y el PIN. Mock: PIN correcto = DEMO_PIN.
function LoginDemo() {
  const auth = useKdsAuth();
  if (auth.isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center bg-white text-lg font-semibold text-gray-900">
        Sesión iniciada en {auth.localName} ✓
        <button type="button" onClick={auth.logout} className="ml-4 rounded-full bg-kds-sidebar px-5 py-2 text-white">
          Salir
        </button>
      </div>
    );
  }
  return <LoginKDS auth={auth} />;
}

const meta = {
  title: "KDS/Pantallas/Login",
  component: LoginKDS,
  parameters: { layout: "fullscreen", mockApi: { routes: () => kdsBackend(), resetStorage: true } },
  args: { auth: undefined as never },
  render: () => <LoginDemo />,
} satisfies Meta<typeof LoginKDS>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FirstLogin: Story = {
  name: `Primer ingreso (prueba con ${DEMO_USER} / ${DEMO_PIN})`,
};

export const SavedUser: Story = {
  name: `Usuario guardado (solo PIN: ${DEMO_PIN})`,
  parameters: { mockApi: { routes: () => kdsBackend(), resetStorage: true, storage: { kds_username: DEMO_USER } } },
};
