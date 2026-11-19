import StatusBadge from "../components/StatusBadge";
import IntegrationsPanel from "../components/IntegrationsPanel";
import { useAgentStatus } from "../hooks/useAgentStatus";
import { useIntegrationsHealth } from "../hooks/useIntegrationsHealth";
import type { OpsHealth } from "../hooks/useOpsIncident";

const EVENTS_HEADER = ["Hora", "Evento", "Restaurante", "Detalle", "Resultado"];

export default function AgentStatus({ health: opsHealth }: { health: OpsHealth }) {
  const { cards, latency, latencyNote, latencyStats, funnel, funnelNote, recentEvents, error } = useAgentStatus(opsHealth);
  const integrations = useIntegrationsHealth();

  return (
    <>
      {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-xs font-medium text-red-700">{error}</p>}
      <div className="flex flex-row flex-wrap gap-5">
        {cards.map((card) => (
          <div key={card.name} className="flex w-64 flex-shrink-0 flex-col gap-3 rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
            <div className="flex flex-row items-center gap-2">
              <span className="flex-grow text-xs font-semibold text-gray-500">{card.name}</span>
              <StatusBadge status={card.status} label={card.statusLabel} />
            </div>
            <span className="text-sm font-bold text-gray-900">{card.value}</span>
            <span className="text-xs text-gray-500">{card.detail}</span>
          </div>
        ))}
      </div>

      <IntegrationsPanel
        data={integrations.data}
        loading={integrations.loading}
        refreshing={integrations.refreshing}
        error={integrations.error}
        onRefresh={() => void integrations.refresh()}
      />

      <div className="flex flex-row items-stretch gap-6">
        <div className="flex min-w-0 flex-grow flex-col gap-5 rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
          <div className="flex flex-row items-center gap-3">
            <span className="flex-grow text-sm font-semibold text-gray-900">
              Latencia de la API — Últimas mediciones
            </span>
            <span className="whitespace-nowrap text-xs text-gray-500">{latencyNote}</span>
          </div>
          <div className="flex h-40 flex-row items-end gap-1.5">
            {latency.map((point, i) => (
              <div
                key={i}
                className={`flex-grow basis-0 rounded-t ${point.warn ? "bg-amber-500" : "bg-brand-sidebar"}`}
                style={{ height: `${point.pct}%` }}
              />
            ))}
          </div>
          <div className="flex flex-row gap-6 text-xs text-gray-500">
            {latencyStats.map((stat) => (
              <span key={stat}>{stat}</span>
            ))}
          </div>
        </div>

        <div className="flex w-80 flex-shrink-0 flex-col gap-4 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <span className="text-sm font-semibold text-gray-900">Embudo de pedidos</span>
          {funnel.map((g) => (
            <div key={g.name} className="flex flex-col gap-2">
              <div className="flex flex-row gap-3">
                <span className="flex-grow text-xs font-medium text-gray-900">{g.name}</span>
                <span className="whitespace-nowrap text-xs font-bold text-gray-900">{g.value}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                <div className={`h-1.5 rounded-full ${g.color}`} style={{ width: `${g.pct}%` }} />
              </div>
            </div>
          ))}
          <p className="mt-auto border-t border-gray-100 pt-4 text-xs leading-relaxed text-gray-500">
            {funnelNote}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
        <span className="text-sm font-semibold text-gray-900">Eventos de pedidos — Más recientes de hoy</span>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500">
                {EVENTS_HEADER.map((h) => (
                  <th key={h} className="py-2 pr-4 font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentEvents.map((row, i) => (
                <tr key={i} className="border-b border-gray-100 text-gray-900 last:border-0">
                  <td className="py-3 pr-4">{row.time}</td>
                  <td className="py-3 pr-4">{row.event}</td>
                  <td className="py-3 pr-4">{row.restaurant}</td>
                  <td className="py-3 pr-4">{row.message}</td>
                  <td className="py-3 pr-4">{row.result}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {recentEvents.length === 0 && <p className="py-6 text-center text-xs text-gray-500">Sin eventos hoy.</p>}
        </div>
      </div>
    </>
  );
}
