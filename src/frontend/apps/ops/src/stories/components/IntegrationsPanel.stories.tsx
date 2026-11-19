import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import IntegrationsPanel from "../../components/IntegrationsPanel";
import { opsBackend, type IntegrationsScenario } from "../mockBackend";
import { useIntegrationsHealth } from "../../hooks/useIntegrationsHealth";

// Usa el hook real contra el backend falso: cada story es un escenario de GET /health/integrations.
function Live() {
  const { data, loading, refreshing, error, refresh } = useIntegrationsHealth();
  return <IntegrationsPanel data={data} loading={loading} refreshing={refreshing} error={error} onRefresh={() => void refresh()} />;
}

const meta = {
  title: "Ops/Integraciones externas",
  component: IntegrationsPanel,
  parameters: { layout: "padded" },
  args: { data: null, loading: false, refreshing: false, error: null, onRefresh: fn() },
  render: () => <Live />,
} satisfies Meta<typeof IntegrationsPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

const scenario = (integrations: IntegrationsScenario) => ({
  mockApi: { routes: () => opsBackend({ integrations }) },
});

export const AllOperational: Story = { name: "Todo operativo", parameters: scenario("ok") };
export const OpenAiIncident: Story = { name: "Incidente en OpenAI (Chat Completions)", parameters: scenario("openai-incident") };
export const WhatsAppTokenExpired: Story = { name: "Token de WhatsApp vencido", parameters: scenario("whatsapp-token-expired") };
export const WhatsAppLowQuality: Story = { name: "Número de WhatsApp con calidad baja", parameters: scenario("whatsapp-low-quality") };
export const StatusPagesUnreachable: Story = { name: "Páginas de estado sin respuesta", parameters: scenario("status-pages-unreachable") };
export const NotDeployed: Story = { name: "Backend sin el endpoint (404)", parameters: scenario("not-deployed") };
export const Forbidden: Story = { name: "Sin permiso (403)", parameters: scenario("forbidden") };
