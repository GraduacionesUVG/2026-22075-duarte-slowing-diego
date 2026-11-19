/// <reference types="vite/client" />
import { apiRequest } from "../client";
import type { AdminKdsUser, OpeningHours } from "./admin";

// Endpoints del panel Dev/TI (solo token de superadmin).

export interface TiRestaurant {
  id: string;
  name: string;
  location: string | null;
  active: boolean;
  opening_hours: OpeningHours;
  admins: number;
  kds_users: number;
}

export interface TiAdminUser {
  id: string;
  email: string;
  username: string | null;
  role: string;
  restaurant_id: string | null;
  restaurant_name: string | null;
  must_change_password: boolean;
  // true = todavía no ha definido su contraseña (no abrió el correo de bienvenida).
  password_pending: boolean;
  last_login_at: string | null;
  created_at: string | null;
}

export interface TiKdsUser extends AdminKdsUser {
  restaurant_id: string | null;
  restaurant_name: string | null;
  connected_since: string | null;
}

export interface TiCreateRestaurantInput {
  restaurant_name: string;
  admin_username: string;
  admin_email: string;
  location?: string | null;
}

export interface TiCreateAdminInput {
  restaurant_id: string;
  username: string;
  email: string;
  password?: string;
}

export interface TiCreateRestaurantResult {
  restaurant: { id: string; name: string };
  admin: TiAdminUser;
  // false = el restaurante se creó pero el correo de bienvenida no salió: reenviar el acceso.
  email_sent: boolean;
}

export interface OrderEvent {
  id: string;
  seq: number;
  event: string;
  restaurant_id: string | null;
  kds_user_ids: string[];
  order_id: string | null;
  request_number: number | null;
  order_number: number | null;
  pipeline_status: string | null;
  payment_status: string | null;
  message: string;
  created_at: string;
}

export interface EventsDay {
  date: string;
  live: boolean;
  events: OrderEvent[];
}

export interface HealthStatus {
  status: string;
  environment: string;
  project_name: string;
  database_connected: boolean;
}

// --- Salud de integraciones externas (GET /health/integrations, solo superadmin) ---

// operational = todo bien · degraded = funciona con problemas · down = caído o llave inválida
// unknown = no se pudo verificar (la página de estado no respondió o cambió de formato)
export type IntegrationStatus = "operational" | "degraded" | "down" | "unknown";

export interface IntegrationCheck {
  status: IntegrationStatus;
  detail: string | null;
  latency_ms: number | null;
  // Extra de la verificación: componentes de OpenAI, servicios de Meta, calidad del número, etc.
  data: Record<string, unknown> | null;
}

export interface IntegrationHealth {
  // El peor de platform y credentials.
  status: IntegrationStatus;
  // Lo que reporta la página de estado pública del proveedor.
  platform: IntegrationCheck;
  // Sondeo con NUESTRAS llaves. null si se pidió con probe=false.
  credentials: IntegrationCheck | null;
}

export interface IntegrationsHealth {
  checked_at: string;
  status: IntegrationStatus;
  openai: IntegrationHealth;
  whatsapp: IntegrationHealth;
}

export const opsApi = {
  // Sin token. Sirve para saber si la API y MongoDB responden.
  health: () => apiRequest<HealthStatus>("/health/"),

  listRestaurants: () => apiRequest<TiRestaurant[]>("/api/ti/restaurants"),
  createRestaurant: (input: TiCreateRestaurantInput) =>
    apiRequest<TiCreateRestaurantResult>("/api/ti/restaurants", { method: "POST", body: input }),

  listAdmins: () => apiRequest<TiAdminUser[]>("/api/ti/restaurant-users"),
  // Crea un administrador para un restaurante existente. Sin `password`, le llega el enlace por correo.
  createAdmin: (input: TiCreateAdminInput) =>
    apiRequest<TiAdminUser>("/api/ti/restaurant-users", { method: "POST", body: input }),
  // Reenvía el enlace para crear o cambiar la contraseña del administrador.
  sendPasswordReset: (adminId: string) =>
    apiRequest<{ detail: string; email: string }>(`/api/ti/restaurant-users/${adminId}/password-reset`, {
      method: "POST",
    }),

  listKdsUsers: () => apiRequest<TiKdsUser[]>("/api/ti/kds-users"),

  // Consola general de eventos de un día (YYYY-MM-DD). `restaurantId` vacío = todos.
  listEvents: (date: string, restaurantId?: string) =>
    apiRequest<EventsDay>("/api/ti/events", { params: { date, restaurant_id: restaurantId || "all" } }),

  // Salud de OpenAI y de la WhatsApp Cloud API. El backend cachea 60 s; `refresh` ignora el caché
  // y `probe: false` salta el sondeo con llaves (solo las páginas de estado públicas).
  integrationsHealth: (opts: { probe?: boolean; refresh?: boolean } = {}) =>
    apiRequest<IntegrationsHealth>("/health/integrations", {
      params: { probe: opts.probe ?? true, refresh: opts.refresh ?? false },
    }),

  // KPIs de todo el sistema.
  globalKpis: (from: string, to: string) =>
    apiRequest<GlobalKpis>("/api/metrics/kpis", { params: { scope: "global", from, to } }),
};

export interface GlobalKpis {
  resumen: { solicitudes: number; pedidos_exitosos: number; ticket_promedio: number };
  ventas: { total: number };
  abandono: { tasa: number; abandonados: number; aceptados: number; rechazados_por_cocina: number };
}
