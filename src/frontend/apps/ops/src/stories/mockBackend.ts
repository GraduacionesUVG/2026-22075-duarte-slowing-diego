import type { GlobalKpis, IntegrationsHealth, OpeningHours, OrderEvent, TiAdminUser, TiKdsUser, TiRestaurant, WeekDayKey } from "@repo/api-client";
import { reply, type MockRoute } from "@repo/config/storybook/mockApi";

export const DEMO_EMAIL = "ti@qorder.dev";
export const DEMO_PASSWORD = "demo1234";
// Un correo que contenga "nuevo" entra con contraseña temporal (debe cambiarla).
export const NEW_ACCOUNT_EMAIL = "nuevo@qorder.dev";
// Una cuenta de restaurante (no superadmin) es rechazada por el panel Ops.
export const RESTAURANT_ADMIN_EMAIL = "maria@cafeteria.edu";

// Claves de localStorage de useOpsAuth.
export const SIGNED_IN_STORAGE = {
  qorder_auth_token: "demo-token",
  qorder_ops_name: "Equipo TI",
  qorder_ops_must_change: "0",
};
export const MUST_CHANGE_STORAGE = { ...SIGNED_IN_STORAGE, qorder_ops_must_change: "1" };

const minutesAgo = (m: number) => new Date(Date.now() - m * 60_000).toISOString();

const hours = (): OpeningHours => {
  const days: WeekDayKey[] = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
  return Object.fromEntries(
    days.map((d) => [d, d === "sunday" ? { closed: true, open: null, close: null } : { closed: false, open: "07:00", close: "16:00" }]),
  ) as OpeningHours;
};

const restaurantsFixture: TiRestaurant[] = [
  { id: "r1", name: "Cafetería Central", location: "Edificio A", active: true, opening_hours: hours(), admins: 1, kds_users: 2 },
  { id: "r2", name: "Rincón del Sabor", location: "Edificio C", active: true, opening_hours: hours(), admins: 1, kds_users: 1 },
  { id: "r3", name: "Snack Bar Biblioteca", location: "Biblioteca, nivel 1", active: true, opening_hours: hours(), admins: 1, kds_users: 0 },
];

const adminsFixture: TiAdminUser[] = [
  { id: "a1", email: "maria@cafeteria.edu", username: "María López", role: "admin", restaurant_id: "r1", restaurant_name: "Cafetería Central", must_change_password: false, password_pending: false, last_login_at: minutesAgo(35), created_at: minutesAgo(60 * 24 * 30) },
  { id: "a2", email: "carlos@rincon.edu", username: "Carlos Pérez", role: "admin", restaurant_id: "r2", restaurant_name: "Rincón del Sabor", must_change_password: true, password_pending: false, last_login_at: null, created_at: minutesAgo(60 * 24 * 3) },
  { id: "a3", email: "ana@snackbar.edu", username: "Ana Gómez", role: "admin", restaurant_id: "r3", restaurant_name: "Snack Bar Biblioteca", must_change_password: true, password_pending: true, last_login_at: null, created_at: minutesAgo(60 * 24) },
];

const station = (id: string, username: string, rid: string, rname: string, connected: boolean): TiKdsUser => ({
  kds_user_id: id,
  username,
  connected,
  last_seen: connected ? minutesAgo(1) : minutesAgo(180),
  connected_since: connected ? minutesAgo(95) : null,
  priority: 1,
  active: true,
  menu_filter: { mode: "all", item_ids: [], categories: [] },
  restaurant_id: rid,
  restaurant_name: rname,
});

const stationsFixture: TiKdsUser[] = [
  station("k1", "cocina1", "r1", "Cafetería Central", true),
  station("k2", "parrilla", "r1", "Cafetería Central", false),
  station("k3", "barra", "r2", "Rincón del Sabor", true),
];

const event = (seq: number, type: string, minutes: number, message: string, over: Partial<OrderEvent> = {}): OrderEvent => ({
  id: `e${seq}`,
  seq,
  event: type,
  restaurant_id: "r1",
  kds_user_ids: ["k1"],
  order_id: `ord-${Math.ceil(seq / 3)}`,
  request_number: Math.ceil(seq / 3),
  order_number: null,
  pipeline_status: null,
  payment_status: null,
  message,
  created_at: minutesAgo(minutes),
  ...over,
});

const eventsFixture: OrderEvent[] = [
  event(9, "order_delivered", 2, "Pedido entregado con código OTP", { order_number: 101 }),
  event(8, "otp_failed", 4, "Código OTP incorrecto en mostrador"),
  event(7, "order_ready", 6, "Pedido listo para entrega"),
  event(6, "order_paid", 12, "Pago confirmado por BAC"),
  event(5, "payment_link_sent", 15, "Link de pago enviado por WhatsApp"),
  event(4, "order_accepted", 16, "Aceptado por cocina1"),
  event(3, "order_payment_failed", 40, "El banco rechazó el pago", { restaurant_id: "r2", kds_user_ids: ["k3"] }),
  event(2, "order_offered", 41, "Ofrecido a la estación cocina1"),
  event(1, "order_created", 42, "Solicitud creada desde WhatsApp"),
];

const kpisFixture: GlobalKpis = {
  resumen: { solicitudes: 412, pedidos_exitosos: 331, ticket_promedio: 39.2 },
  ventas: { total: 12975 },
  abandono: { tasa: 0.19, abandonados: 78, aceptados: 331, rechazados_por_cocina: 21 },
};

export type IntegrationsScenario =
  | "ok"
  | "openai-incident"
  | "whatsapp-token-expired"
  | "whatsapp-low-quality"
  | "status-pages-unreachable"
  | "forbidden"
  | "not-deployed";

const okCheck = (latency_ms: number, data: Record<string, unknown> | null = null) => ({
  status: "operational" as const,
  detail: null,
  latency_ms,
  data,
});

// Respuestas de GET /health/integrations (mismo formato que el backend real).
function integrationsFixture(scenario: IntegrationsScenario): IntegrationsHealth {
  const openai: IntegrationsHealth["openai"] = {
    status: "operational",
    platform: okCheck(180, {
      components: { "Chat Completions": "operational", Audio: "operational" },
      incidents: [],
    }),
    credentials: okCheck(240, { model: "gpt-4o-mini" }),
  };
  const whatsapp: IntegrationsHealth["whatsapp"] = {
    status: "operational",
    platform: okCheck(150, { services: { "Cloud API": "No known issues" } }),
    credentials: okCheck(310, {
      display_phone_number: "+502 5555 1234",
      verified_name: "QOrder UVG",
      quality_rating: "GREEN",
      status: "CONNECTED",
    }),
  };

  if (scenario === "openai-incident") {
    openai.status = "degraded";
    openai.platform = {
      status: "degraded",
      detail: "Elevated error rates on Chat Completions",
      latency_ms: 190,
      data: {
        components: { "Chat Completions": "partial_outage", Audio: "operational" },
        incidents: ["Elevated error rates on Chat Completions"],
      },
    };
  }
  if (scenario === "whatsapp-token-expired") {
    whatsapp.status = "down";
    whatsapp.credentials = {
      status: "down",
      detail: "El token de WhatsApp venció o es inválido (error 190).",
      latency_ms: 212,
      data: null,
    };
  }
  if (scenario === "whatsapp-low-quality") {
    whatsapp.status = "degraded";
    whatsapp.credentials = {
      status: "degraded",
      detail: "El número tiene calidad baja o no está conectado.",
      latency_ms: 298,
      data: { display_phone_number: "+502 5555 1234", verified_name: "QOrder UVG", quality_rating: "RED", status: "CONNECTED" },
    };
  }
  if (scenario === "status-pages-unreachable") {
    const unknown = (detail: string) => ({ status: "unknown" as const, detail, latency_ms: 8000, data: null });
    openai.status = "unknown";
    openai.platform = unknown("No se pudo leer status.openai.com: ConnectTimeout");
    whatsapp.status = "unknown";
    whatsapp.platform = unknown("metastatus.com no trae el servicio Cloud API (¿cambió el formato?).");
  }

  const worst = [openai.status, whatsapp.status].includes("down")
    ? "down"
    : [openai.status, whatsapp.status].includes("degraded")
      ? "degraded"
      : [openai.status, whatsapp.status].includes("unknown")
        ? "unknown"
        : "operational";
  return { checked_at: new Date().toISOString(), status: worst, openai, whatsapp };
}

type OpsBackendOptions = {
  // Escenario de GET /health/integrations (OpenAI y WhatsApp).
  integrations?: IntegrationsScenario;
  // "ok" = API y MongoDB responden; "db-down" = API responde pero MongoDB no; "api-down" = sin respuesta.
  health?: "ok" | "db-down" | "api-down";
};

// Backend en memoria del panel Dev/TI.
export function opsBackend({ health = "ok", integrations = "ok" }: OpsBackendOptions = {}): MockRoute[] {
  const restaurants = restaurantsFixture.map((r) => ({ ...r }));
  const admins = adminsFixture.map((a) => ({ ...a }));
  let nextId = 100;

  return [
    {
      method: "POST",
      path: "/auth/admin/login",
      respond: ({ body }) => {
        if (body.password !== DEMO_PASSWORD) return reply(401, { detail: "Correo o contraseña incorrectos" });
        const isRestaurantAdmin = body.email === RESTAURANT_ADMIN_EMAIL;
        return {
          access_token: "demo-token",
          role: isRestaurantAdmin ? "admin" : "superadmin",
          must_change_password: String(body.email).includes("nuevo"),
          restaurant_id: isRestaurantAdmin ? "r1" : null,
          restaurant_name: isRestaurantAdmin ? "Cafetería Central" : null,
          username: "Equipo TI",
        };
      },
    },
    {
      method: "POST",
      path: "/auth/admin/change-password",
      respond: ({ body }) =>
        body.current_password === DEMO_PASSWORD ? reply(204) : reply(400, { detail: "La contraseña actual no es correcta" }),
    },

    {
      path: "/health/",
      respond: () => {
        if (health === "api-down") return reply(503, { detail: "Service Unavailable" });
        return { status: health === "ok" ? "OK" : "DEGRADED", environment: "production", project_name: "GP-Agent-Backend", database_connected: health === "ok" };
      },
    },
    {
      path: "/health/integrations",
      respond: () => {
        if (integrations === "forbidden") return reply(403, { detail: "Solo el equipo Dev/TI puede hacer esta acción." });
        if (integrations === "not-deployed") return reply(404, { detail: "Not Found" });
        return integrationsFixture(integrations);
      },
    },
    { path: "/api/ti/restaurants", respond: () => restaurants },
    {
      method: "POST",
      path: "/api/ti/restaurants",
      respond: ({ body }) => {
        const id = `r${nextId++}`;
        restaurants.push({ id, name: body.restaurant_name, location: body.location ?? null, active: true, opening_hours: hours(), admins: 1, kds_users: 0 });
        const admin: TiAdminUser = {
          id: `a${nextId++}`,
          email: body.admin_email,
          username: body.admin_username,
          role: "admin",
          restaurant_id: id,
          restaurant_name: body.restaurant_name,
          must_change_password: true,
          password_pending: true,
          last_login_at: null,
          created_at: new Date().toISOString(),
        };
        admins.push(admin);
        return { restaurant: { id, name: body.restaurant_name }, admin, email_sent: true };
      },
    },
    { path: "/api/ti/restaurant-users", respond: () => admins },
    {
      method: "POST",
      path: "/api/ti/restaurant-users",
      respond: ({ body }) => {
        const restaurant = restaurants.find((r) => r.id === body.restaurant_id);
        const admin: TiAdminUser = {
          id: `a${nextId++}`,
          email: body.email,
          username: body.username,
          role: "admin",
          restaurant_id: body.restaurant_id,
          restaurant_name: restaurant?.name ?? null,
          must_change_password: true,
          password_pending: true,
          last_login_at: null,
          created_at: new Date().toISOString(),
        };
        admins.push(admin);
        return admin;
      },
    },
    {
      method: "POST",
      path: /^\/api\/ti\/restaurant-users\/([^/]+)\/password-reset$/,
      respond: ({ match }) => ({ detail: "Enlace enviado", email: admins.find((a) => a.id === match[1])?.email ?? "" }),
    },
    { path: "/api/ti/kds-users", respond: () => stationsFixture },
    { path: "/api/ti/events", respond: () => ({ date: new Date().toISOString().slice(0, 10), live: true, events: eventsFixture }) },
    { path: "/api/metrics/kpis", respond: () => kpisFixture },
  ];
}
