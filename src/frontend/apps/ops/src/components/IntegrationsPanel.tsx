import type { ReactNode } from "react";
import type { IntegrationCheck, IntegrationHealth, IntegrationsHealth } from "@repo/api-client";
import StatusBadge from "./StatusBadge";
import { clock } from "../lib/format";
import {
  asRecord,
  asString,
  INTEGRATION_BADGE,
  metaServiceBadge,
  openaiComponentBadge,
  qualityBadge,
} from "../lib/integrations";

type IntegrationsPanelProps = {
  data: IntegrationsHealth | null;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  onRefresh: () => void;
};

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-row items-center gap-3">
      <span className="flex-grow text-xs text-gray-500">{label}</span>
      {children}
    </div>
  );
}

// Una verificación (plataforma o credenciales): estado general, detalle del problema y datos extra.
function Check({
  title,
  hint,
  check,
  children,
}: {
  title: string;
  hint: string;
  check: IntegrationCheck | null;
  children?: ReactNode;
}) {
  const badge = check ? INTEGRATION_BADGE[check.status] : { status: "info" as const, label: "No verificado" };

  return (
    <div className="flex flex-col gap-2.5 rounded-lg bg-gray-50 p-4 ring-1 ring-gray-100">
      <div className="flex flex-row items-center gap-2">
        <div className="flex flex-grow flex-col">
          <span className="text-xs font-semibold text-gray-900">{title}</span>
          <span className="text-xs text-gray-500">{hint}</span>
        </div>
        <StatusBadge status={badge.status} label={badge.label} />
      </div>
      {check?.detail && (
        <p
          className={`rounded-[5px] border px-3 py-2 text-xs font-medium leading-relaxed ${
            check.status === "down"
              ? "border-red-500 bg-red-50 text-red-700"
              : "border-amber-500 bg-amber-50 text-amber-700"
          }`}
        >
          {check.detail}
        </p>
      )}
      {check && children}
      {check?.latency_ms != null && <span className="text-xs text-gray-400">Respondió en {check.latency_ms} ms</span>}
    </div>
  );
}

function OpenAiCard({ health }: { health: IntegrationHealth }) {
  const components = asRecord(health.platform.data?.components);
  const incidents = Array.isArray(health.platform.data?.incidents) ? (health.platform.data?.incidents as string[]) : [];
  const model = asString(health.credentials?.data?.model);

  return (
    <ProviderCard title="OpenAI" subtitle="Agente conversacional y audios" health={health}>
      <Check title="Plataforma" hint="status.openai.com" check={health.platform}>
        {Object.entries(components).map(([name, raw]) => {
          const badge = openaiComponentBadge(raw);
          return (
            <Row key={name} label={name}>
              <StatusBadge status={badge.status} label={badge.label} />
            </Row>
          );
        })}
        {incidents.length > 0 && (
          <ul className="list-disc pl-4 text-xs text-gray-700">
            {incidents.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        )}
      </Check>
      <Check title="Nuestra llave" hint="Sondeo con OPENAI_API_KEY (no gasta tokens)" check={health.credentials}>
        {model && (
          <Row label="Modelo del agente">
            <span className="text-xs font-semibold text-gray-900">{model}</span>
          </Row>
        )}
        <p className="text-xs leading-relaxed text-gray-400">
          Valida la llave y el acceso al modelo. No detecta falta de saldo: eso solo aparece en una llamada real.
        </p>
      </Check>
    </ProviderCard>
  );
}

function WhatsAppCard({ health }: { health: IntegrationHealth }) {
  const services = asRecord(health.platform.data?.services);
  const number = health.credentials?.data;
  const phone = asString(number?.display_phone_number);
  const name = asString(number?.verified_name);
  const connection = asString(number?.status);
  const quality = number?.quality_rating != null ? qualityBadge(number.quality_rating) : null;

  return (
    <ProviderCard title="WhatsApp (Meta)" subtitle="Cloud API: mensajes entrantes y salientes" health={health}>
      <Check title="Plataforma" hint="metastatus.com" check={health.platform}>
        {Object.entries(services).map(([service, raw]) => {
          const badge = metaServiceBadge(raw);
          return (
            <Row key={service} label={service}>
              <StatusBadge status={badge.status} label={badge.label} />
            </Row>
          );
        })}
      </Check>
      <Check title="Nuestro token y número" hint="Sondeo con WHATSAPP_TOKEN" check={health.credentials}>
        {phone && (
          <Row label="Número">
            <span className="text-xs font-semibold text-gray-900">{phone}</span>
          </Row>
        )}
        {name && (
          <Row label="Nombre verificado">
            <span className="text-xs font-semibold text-gray-900">{name}</span>
          </Row>
        )}
        {connection && (
          <Row label="Conexión">
            <StatusBadge
              status={connection === "CONNECTED" ? "success" : "warning"}
              label={connection === "CONNECTED" ? "Conectado" : connection}
            />
          </Row>
        )}
        {quality && (
          <Row label="Calidad del número">
            <StatusBadge status={quality.status} label={quality.label} />
          </Row>
        )}
      </Check>
    </ProviderCard>
  );
}

function ProviderCard({
  title,
  subtitle,
  health,
  children,
}: {
  title: string;
  subtitle: string;
  health: IntegrationHealth;
  children: ReactNode;
}) {
  const badge = INTEGRATION_BADGE[health.status];
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-4 rounded-xl p-5 ring-1 ring-gray-200">
      <div className="flex flex-row items-center gap-3">
        <div className="flex flex-grow flex-col">
          <span className="text-sm font-semibold text-gray-900">{title}</span>
          <span className="text-xs text-gray-500">{subtitle}</span>
        </div>
        <StatusBadge status={badge.status} label={badge.label} />
      </div>
      {children}
    </div>
  );
}

export default function IntegrationsPanel({ data, loading, refreshing, error, onRefresh }: IntegrationsPanelProps) {
  return (
    <section className="flex flex-col gap-4 rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
      <div className="flex flex-row flex-wrap items-center gap-3">
        <span className="flex-grow text-sm font-semibold text-gray-900">Integraciones externas</span>
        {data && (
          <span className="whitespace-nowrap text-xs text-gray-500">
            Última verificación: {clock(data.checked_at, true)} · se actualiza cada minuto
          </span>
        )}
        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          className="whitespace-nowrap rounded-lg px-3.5 py-2 text-xs font-semibold text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {refreshing ? "Verificando…" : "Verificar ahora"}
        </button>
      </div>

      {error && (
        <p role="alert" className="rounded-[5px] border border-red-500 bg-red-50 px-3 py-2 text-xs font-medium leading-relaxed text-red-700">
          {error}
        </p>
      )}

      {loading && !data && <p className="py-6 text-center text-xs text-gray-500">Consultando OpenAI y WhatsApp…</p>}

      {data && (
        <div className="flex flex-row flex-wrap items-stretch gap-5">
          <OpenAiCard health={data.openai} />
          <WhatsAppCard health={data.whatsapp} />
        </div>
      )}
    </section>
  );
}
