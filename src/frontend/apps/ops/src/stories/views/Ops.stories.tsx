import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import AgentStatus from "../../views/AgentStatus";
import Restaurants from "../../views/Restaurants";
import Debugging from "../../views/Debugging";
import OpsShell from "../../components/OpsShell";
import IncidentBanner from "../../components/IncidentBanner";
import { useOpsIncident } from "../../hooks/useOpsIncident";
import { opsBackend, SIGNED_IN_STORAGE } from "../mockBackend";

const NAV_ITEMS = [{ label: "Estado del sistema" }, { label: "Restaurantes" }, { label: "Eventos" }];

// Usa el hook real de monitoreo contra el /health/ del backend falso (mismo armado que App.tsx).
function StatusDemo() {
  const health = useOpsIncident();
  return (
    <OpsShell navItems={NAV_ITEMS} activeIndex={0} onSelect={fn()} title="QOrder / Estado del sistema" userName="Equipo TI · Superadmin" onLogout={fn()}>
      {health.isDown && (
        <IncidentBanner
          since={health.downSince ? new Date(health.downSince).toLocaleTimeString("es-GT", { hour: "2-digit", minute: "2-digit" }) : null}
          apiReachable={health.apiReachable}
          retrying={health.retrying}
          onRetry={() => void health.retryConnection()}
          onViewDiagnostics={fn()}
        />
      )}
      <AgentStatus health={health} />
    </OpsShell>
  );
}

const shell = (index: number, content: React.ReactNode) => (
  <OpsShell
    navItems={NAV_ITEMS}
    activeIndex={index}
    onSelect={fn()}
    title={`QOrder / ${NAV_ITEMS[index]?.label}`}
    userName="Equipo TI · Superadmin"
    onLogout={fn()}
  >
    {content}
  </OpsShell>
);

const mockApi = { routes: () => opsBackend(), storage: SIGNED_IN_STORAGE };

const meta = {
  title: "Ops/Pantallas/Contenido",
  parameters: { layout: "fullscreen", mockApi },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const SystemHealthy: Story = { name: "Estado del sistema", render: () => <StatusDemo /> };

export const SystemDatabaseDown: Story = {
  name: "Estado del sistema (MongoDB caída)",
  render: () => <StatusDemo />,
  parameters: { mockApi: { ...mockApi, routes: () => opsBackend({ health: "db-down" }) } },
};

export const SystemApiDown: Story = {
  name: "Estado del sistema (API caída)",
  render: () => <StatusDemo />,
  parameters: { mockApi: { ...mockApi, routes: () => opsBackend({ health: "api-down" }) } },
};

export const SystemWhatsAppTokenExpired: Story = {
  name: "Estado del sistema (token de WhatsApp vencido)",
  render: () => <StatusDemo />,
  parameters: { mockApi: { ...mockApi, routes: () => opsBackend({ integrations: "whatsapp-token-expired" }) } },
};

export const RestaurantsList: Story = { name: "Restaurantes", render: () => shell(1, <Restaurants />) };

export const EventsConsole: Story = { name: "Consola de eventos", render: () => shell(2, <Debugging />) };
