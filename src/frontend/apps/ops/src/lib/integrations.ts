import type { IntegrationStatus } from "@repo/api-client";
import type { BadgeStatus } from "../components/StatusBadge";

export const INTEGRATION_BADGE: Record<IntegrationStatus, { status: BadgeStatus; label: string }> = {
  operational: { status: "success", label: "Operativa" },
  degraded: { status: "warning", label: "Degradada" },
  down: { status: "error", label: "Caída" },
  unknown: { status: "info", label: "Sin datos" },
};

// Estados crudos de status.openai.com (Statuspage) -> texto para el equipo.
const OPENAI_COMPONENT: Record<string, { status: BadgeStatus; label: string }> = {
  operational: { status: "success", label: "Operativo" },
  degraded_performance: { status: "warning", label: "Rendimiento degradado" },
  partial_outage: { status: "warning", label: "Caída parcial" },
  under_maintenance: { status: "warning", label: "En mantenimiento" },
  major_outage: { status: "error", label: "Caída total" },
};

export function openaiComponentBadge(raw: unknown): { status: BadgeStatus; label: string } {
  return OPENAI_COMPONENT[String(raw)] ?? { status: "info", label: String(raw ?? "Sin datos") };
}

// metastatus.com solo usa "No known issues" para decir que todo está bien; el resto es un incidente.
export function metaServiceBadge(raw: unknown): { status: BadgeStatus; label: string } {
  const text = String(raw ?? "");
  return text.trim().toLowerCase() === "no known issues"
    ? { status: "success", label: "Sin incidentes" }
    : { status: "warning", label: text || "Sin datos" };
}

// Calidad del número de WhatsApp que reporta la Graph API.
const QUALITY: Record<string, { status: BadgeStatus; label: string }> = {
  GREEN: { status: "success", label: "Alta" },
  YELLOW: { status: "warning", label: "Media" },
  RED: { status: "error", label: "Baja" },
  UNKNOWN: { status: "info", label: "Sin calificar" },
};

export function qualityBadge(raw: unknown): { status: BadgeStatus; label: string } {
  return QUALITY[String(raw).toUpperCase()] ?? { status: "info", label: String(raw ?? "Sin datos") };
}

export const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" ? (value as Record<string, unknown>) : {};

export const asString = (value: unknown): string | null =>
  typeof value === "string" && value.trim() !== "" ? value : null;
