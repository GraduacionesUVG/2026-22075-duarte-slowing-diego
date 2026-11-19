import { useState } from "react";
import OpsShell from "./components/OpsShell";
import IncidentBanner from "./components/IncidentBanner";
import AgentStatus from "./views/AgentStatus";
import Restaurants from "./views/Restaurants";
import Debugging from "./views/Debugging";
import LoginOps from "./views/LoginOps";
import OpsChangePassword from "./views/OpsChangePassword";
import { useOpsAuth } from "./hooks/useOpsAuth";
import { useOpsIncident } from "./hooks/useOpsIncident";
import { clock } from "./lib/format";

const NAV_ITEMS = [{ label: "Estado del sistema" }, { label: "Restaurantes" }, { label: "Eventos" }];

export default function App() {
  const auth = useOpsAuth();

  if (!auth.isAuthenticated) return <LoginOps auth={auth} />;
  if (auth.mustChangePassword) return <OpsChangePassword auth={auth} />;
  return <OpsApp userName={auth.userName} onLogout={auth.logout} />;
}

// Se monta solo con sesión: así el monitoreo de salud no corre en la pantalla de login.
function OpsApp({ userName, onLogout }: { userName: string; onLogout: () => void }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const health = useOpsIncident();

  const activeItem = NAV_ITEMS[activeIndex] ?? NAV_ITEMS[0]!;

  return (
    <OpsShell
      navItems={NAV_ITEMS}
      activeIndex={activeIndex}
      onSelect={setActiveIndex}
      title={`QOrder / ${activeItem.label}`}
      userName={`${userName} · Superadmin`}
      onLogout={onLogout}
    >
      {health.isDown && (
        <IncidentBanner
          since={health.downSince ? clock(health.downSince) : null}
          apiReachable={health.apiReachable}
          retrying={health.retrying}
          onRetry={() => void health.retryConnection()}
          onViewDiagnostics={() => setActiveIndex(2)}
        />
      )}
      {activeIndex === 0 && <AgentStatus health={health} />}
      {activeIndex === 1 && <Restaurants />}
      {activeIndex === 2 && <Debugging />}
    </OpsShell>
  );
}
