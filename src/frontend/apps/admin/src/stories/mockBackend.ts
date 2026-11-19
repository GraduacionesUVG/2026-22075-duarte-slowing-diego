import type {
  AdminKdsUser,
  AdminMenuItem,
  AdminOrder,
  AdminRestaurant,
  ImportResult,
  KpiResponse,
  OpeningHours,
  WeekDayKey,
} from "@repo/api-client";
import { suggestCategoryIcon } from "@repo/category-icons";
import { reply, xlsxFile, type MockRoute } from "@repo/config/storybook/mockApi";
import { adminShiftRoutes } from "@repo/config/storybook/shiftsMock";
import { CALENDAR_TEMPLATE_XLSX, MENU_TEMPLATE_XLSX } from "./sampleFiles";

export const DEMO_EMAIL = "maria@cafeteria.edu";
export const DEMO_PASSWORD = "demo1234";
// Un correo que contenga "nuevo" entra con contraseña temporal (debe cambiarla).
export const NEW_ACCOUNT_EMAIL = "nuevo@cafeteria.edu";

// Claves de localStorage de useAdminAuth.
export const SIGNED_IN_STORAGE = {
  qorder_auth_token: "demo-token",
  qorder_admin_name: "María López",
  qorder_admin_local: "Cafetería Central",
  qorder_admin_must_change: "0",
};
export const MUST_CHANGE_STORAGE = { ...SIGNED_IN_STORAGE, qorder_admin_must_change: "1" };

const item = (n: number, over: Partial<AdminMenuItem>): AdminMenuItem => ({
  id: `m${n}`,
  code: `P-${100 + n}`,
  name: "Producto",
  category: "Platos fuertes",
  description: null,
  price: 30,
  available: true,
  schedule_type: "always",
  day_of_week: null,
  serve_date: null,
  meal_period: null,
  prep_time_minutes: 5,
  ready_from: null,
  order_cutoff: null,
  daily_stock: null,
  dine_in_only: false,
  modifiers: [],
  ...over,
});

export const menuFixture: AdminMenuItem[] = [
  item(1, {
    name: "Hamburguesa clásica",
    description: "Carne de res, queso, lechuga y tomate.",
    price: 38,
    meal_period: "almuerzo",
    modifiers: [
      { id: "mod1", group: "Extras", name: "Tocino", price: 6 },
      { id: "mod2", group: "Extras", name: "Queso extra", price: 4 },
      { id: "mod3", group: "Quitar", name: "Sin cebolla", price: 0 },
    ],
  }),
  item(2, { name: "Burrito de pollo", price: 32, description: "Tortilla de harina, pollo y frijoles.", meal_period: "almuerzo" }),
  item(3, { name: "Ensalada César", category: "Ligeros", price: 28, available: false }),
  item(4, { name: "Papas fritas", category: "Acompañamientos", price: 15 }),
  item(5, { name: "Limonada", category: "Bebidas", price: 12 }),
  item(7, { name: "Pancakes con miel", category: "Desayunos", price: 28, meal_period: "desayuno" }),
  item(6, { name: "Almuerzo del día", category: "Menú semanal", price: 35, schedule_type: "weekly", day_of_week: "monday" }),
];

const hours = (open: string, close: string): OpeningHours => {
  const day = { closed: false, open, close };
  const days: WeekDayKey[] = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
  return Object.fromEntries(days.map((d) => [d, d === "sunday" ? { closed: true, open: null, close: null } : day])) as OpeningHours;
};

const kdsUsersFixture: AdminKdsUser[] = [
  {
    kds_user_id: "k1",
    username: "cocina1",
    connected: true,
    last_seen: new Date().toISOString(),
    priority: 1,
    active: true,
    menu_filter: { mode: "all", item_ids: [], categories: [] },
  },
  {
    kds_user_id: "k2",
    username: "parrilla",
    connected: false,
    last_seen: null,
    priority: 2,
    active: true,
    menu_filter: { mode: "custom", item_ids: [], categories: ["Platos fuertes"] },
  },
];

const ordersFixture: AdminOrder[] = [
  { id: "a1", student_id: "20240123", items: [{ product_name: "Hamburguesa clásica", quantity: 2 }], pipeline_status: "delivered", payment_status: "paid", total_amount: 76, request_number: 1, order_number: 101, status_label: "Entregado", created_at: new Date().toISOString() },
  { id: "a2", student_id: "20231876", items: [{ product_name: "Burrito de pollo", quantity: 1 }], pipeline_status: "in_preparation", payment_status: "paid", total_amount: 32, request_number: 2, order_number: 102, status_label: "En preparación", created_at: new Date().toISOString() },
  { id: "a3", student_id: "20225511", items: [{ product_name: "Limonada", quantity: 3 }], pipeline_status: "rejected", payment_status: "pending", total_amount: 36, request_number: 3, order_number: null, status_label: "Rechazado", created_at: new Date().toISOString() },
];

export const kpisFixture: KpiResponse = {
  resumen: { solicitudes: 142, pedidos_exitosos: 118, ticket_promedio: 41.5 },
  ventas: { total: 4897 },
  tiempo_preparacion_min: { promedio: 9.4, mediana: 8, p90: 15, muestras: 118 },
  hora_pico: {
    hora_pico_global: { etiqueta: "12:00 – 13:00", promedio_por_dia: 24 },
    hora_pico_filtrado: { etiqueta: "12:00 – 13:00", pedidos: 31 },
    total_por_hora: [8, 9, 10, 11, 12, 13, 14, 15].map((hora, i) => ({ hora, pedidos: [3, 6, 11, 19, 31, 22, 9, 4][i] ?? 0 })),
  },
  abandono: { tasa: 0.17, abandonados: 24, aceptados: 118, rechazados_por_cocina: 9 },
  plato_mas_pedido: {
    ranking: [
      { nombre: "Hamburguesa clásica", cantidad: 46 },
      { nombre: "Burrito de pollo", cantidad: 31 },
      { nombre: "Papas fritas", cantidad: 28 },
    ],
  },
};

const restaurantFixture: AdminRestaurant = {
  id: "r1",
  name: "Cafetería Central",
  location: "Edificio A, planta baja",
  active: true,
  opening_hours: hours("07:00", "16:00"),
  is_open_now: true,
};

// Backend en memoria del panel de administración de un restaurante.
type AdminBackendOptions = {
  // Agrega muchos platillos para probar la paginación del menú.
  manyItems?: boolean;
  // Hace que crear o editar un platillo falle, para ver el aviso de error.
  failSaves?: boolean;
  // Agrega muchos turnos para probar la paginación del resumen de turnos.
  manyShifts?: boolean;
};

export function adminBackend({ failSaves = false, manyItems = false, manyShifts = false }: AdminBackendOptions = {}): MockRoute[] {
  const menu = menuFixture.map((m) => ({ ...m, modifiers: [...m.modifiers] }));
  if (manyItems) {
    const categories = ["Platos fuertes", "Bebidas", "Ligeros", "Postres"];
    for (let n = 1; n <= 37; n++) {
      menu.push(item(100 + n, { name: `Platillo de ejemplo ${n}`, category: categories[n % categories.length] ?? "Bebidas", price: 10 + (n % 9) * 3 }));
    }
  }
  const createdCategories: string[] = [];
  // Iconos elegidos a mano (clave = nombre en minúsculas); el resto usa el sugerido por el nombre.
  const categoryIcons: Record<string, string> = {};
  const allCategories = () => [...new Set([...menu.map((m) => m.category), ...createdCategories])];
  const kdsUsers = kdsUsersFixture.map((u) => ({ ...u }));
  const restaurant = { ...restaurantFixture };
  let nextId = 100;

  const findKds = (id: string | undefined) => kdsUsers.find((u) => u.kds_user_id === id);

  return [
    ...adminShiftRoutes({ many: manyShifts }),
    {
      method: "POST",
      path: "/auth/admin/login",
      respond: ({ body }) =>
        body.password === DEMO_PASSWORD
          ? {
              access_token: "demo-token",
              role: "admin",
              must_change_password: String(body.email).includes("nuevo"),
              restaurant_id: "r1",
              restaurant_name: "Cafetería Central",
              username: "María López",
            }
          : reply(401, { detail: "Correo o contraseña incorrectos" }),
    },
    {
      method: "POST",
      path: "/auth/admin/change-password",
      respond: ({ body }) =>
        body.current_password === DEMO_PASSWORD ? reply(204) : reply(400, { detail: "La contraseña actual no es correcta" }),
    },
    { method: "POST", path: "/auth/password-reset/request", respond: () => reply(204) },
    {
      // Tokens de prueba: valid-token, welcome-token, expired-token y used-token (como los errores del backend).
      path: "/auth/password-reset/validate",
      respond: ({ query }) => {
        const token = query.get("token");
        if (token === "expired-token") return reply(400, { detail: "El enlace expiró. Solicita uno nuevo." });
        if (token === "used-token") return reply(400, { detail: "El enlace no es válido o ya se usó. Solicita uno nuevo." });
        if (token === "valid-token" || token === "welcome-token") {
          return {
            valid: true,
            email: DEMO_EMAIL,
            purpose: token === "welcome-token" ? "welcome" : "reset",
            expires_at: new Date(Date.now() + 60 * 60_000).toISOString(),
          };
        }
        return reply(400, { detail: "El enlace no es válido o ya se usó. Solicita uno nuevo." });
      },
    },
    {
      method: "POST",
      path: "/auth/password-reset/confirm",
      respond: ({ body }) => {
        if (!["valid-token", "welcome-token"].includes(body.token)) {
          return reply(400, { detail: "El enlace no es válido o ya se usó. Solicita uno nuevo." });
        }
        if (String(body.new_password).length < 8) return reply(422, { detail: "La contraseña debe tener al menos 8 caracteres." });
        return reply(204);
      },
    },

    { path: "/api/metrics/kpis", respond: () => kpisFixture },
    { path: "/api/admin/orders", respond: () => ordersFixture },

    { path: "/api/admin/menu", respond: () => menu },
    { path: "/api/admin/menu/categories", respond: () => allCategories() },
    {
      // Como el backend: nombre, icono guardado (o el sugerido por el nombre) y cantidad de platillos.
      path: "/api/admin/menu/categories/details",
      respond: () =>
        allCategories().map((name) => ({
          name,
          icon: categoryIcons[name.toLowerCase()] ?? suggestCategoryIcon(name),
          products_count: menu.filter((m) => m.category === name).length,
        })),
    },
    {
      // Como el backend: 409 si ya existe (sin distinguir mayúsculas), 422 si viene vacía.
      method: "POST",
      path: "/api/admin/menu/categories",
      respond: ({ body }) => {
        const name = String(body.name ?? "").trim();
        if (!name) return reply(422, { detail: "El nombre de la categoría es obligatorio." });
        const existing = allCategories().find((c) => c.toLowerCase() === name.toLowerCase());
        if (existing) return reply(409, { detail: `La categoría '${existing}' ya existe.` });
        createdCategories.push(name);
        const icon = body.icon ? String(body.icon) : suggestCategoryIcon(name);
        categoryIcons[name.toLowerCase()] = icon;
        return reply(201, { name, icon });
      },
    },
    {
      // Cambiar icono y/o renombrar (en cascada sobre los platillos).
      method: "PATCH",
      path: /^\/api\/admin\/menu\/categories\/([^/]+)$/,
      respond: ({ match, body }) => {
        const current = allCategories().find((c) => c.toLowerCase() === decodeURIComponent(match[1] ?? "").toLowerCase());
        if (!current) return reply(404, { detail: "Categoría no encontrada." });
        const newName = body.name === undefined ? current : String(body.name).trim();
        if (!newName) return reply(422, { detail: "El nombre de la categoría es obligatorio." });
        const clash = allCategories().find((c) => c.toLowerCase() === newName.toLowerCase() && c !== current);
        if (clash) return reply(409, { detail: `La categoría '${clash}' ya existe.` });
        const icon = body.icon ? String(body.icon) : (categoryIcons[current.toLowerCase()] ?? suggestCategoryIcon(current));
        delete categoryIcons[current.toLowerCase()];
        categoryIcons[newName.toLowerCase()] = icon;
        if (newName !== current) {
          menu.forEach((m) => {
            if (m.category === current) m.category = newName;
          });
          const at = createdCategories.indexOf(current);
          if (at >= 0) createdCategories[at] = newName;
        }
        return { name: newName, icon };
      },
    },
    {
      // 409 con la lista de platillos si la categoría todavía tiene alguno.
      method: "DELETE",
      path: /^\/api\/admin\/menu\/categories\/([^/]+)$/,
      respond: ({ match }) => {
        const current = allCategories().find((c) => c.toLowerCase() === decodeURIComponent(match[1] ?? "").toLowerCase());
        if (!current) return reply(404, { detail: "Categoría no encontrada." });
        const products = menu.filter((m) => m.category === current);
        if (products.length > 0) {
          return reply(409, {
            detail: {
              message: `Aún quedan ${products.length} productos con la categoría '${current}'.`,
              category: current,
              products_count: products.length,
              products: products.map((p) => ({ id: p.id, code: p.code, name: p.name })),
            },
          });
        }
        const at = createdCategories.indexOf(current);
        if (at >= 0) createdCategories.splice(at, 1);
        delete categoryIcons[current.toLowerCase()];
        return reply(204);
      },
    },
    {
      method: "POST",
      path: "/api/admin/menu",
      respond: ({ body }) => {
        if (failSaves) return reply(500, { detail: "Error interno del servidor." });
        const created = item(nextId++, { ...body, modifiers: body.modifiers ?? [] });
        menu.push(created);
        return created;
      },
    },
    {
      method: "PUT",
      path: /^\/api\/admin\/menu\/([^/]+)$/,
      respond: ({ match, body }) => {
        if (failSaves) return reply(500, { detail: "Error interno del servidor." });
        const found = menu.find((m) => m.id === match[1]);
        if (!found) return reply(404, { detail: "Producto no encontrado" });
        Object.assign(found, body);
        return found;
      },
    },
    {
      method: "DELETE",
      path: /^\/api\/admin\/menu\/([^/]+)$/,
      respond: ({ match }) => {
        const index = menu.findIndex((m) => m.id === match[1]);
        if (index >= 0) menu.splice(index, 1);
        return reply(204);
      },
    },

    // Importación por Excel: valida sin guardar (dry_run) o "guarda" en memoria.
    {
      method: "POST",
      path: /^\/api\/admin\/menu(\/calendar)?\/import$/,
      respond: ({ query }): ImportResult => ({
        dry_run: query.get("dry_run") === "true",
        created: 4,
        updated: 2,
        replaced_dates: [],
        warnings: [],
        items: menu.slice(0, 3),
      }),
    },
    {
      // Plantillas reales del backend: se pueden abrir en Excel para comprobar la descarga.
      path: /^\/api\/admin\/menu(\/calendar)?\/(template|export)$/,
      respond: ({ match }) =>
        match[1]
          ? xlsxFile(CALENDAR_TEMPLATE_XLSX, match[2] === "template" ? "plantilla_calendario.xlsx" : "calendario.xlsx")
          : xlsxFile(MENU_TEMPLATE_XLSX, match[2] === "template" ? "plantilla_menu.xlsx" : "menu.xlsx"),
    },

    { path: "/api/admin/restaurant", respond: () => restaurant },
    {
      method: "PUT",
      path: "/api/admin/restaurant/opening-hours",
      respond: ({ body }) => Object.assign(restaurant, { opening_hours: body }),
    },
    {
      method: "PUT",
      path: "/api/admin/restaurant/location",
      respond: ({ body }) => Object.assign(restaurant, { location: body.location }),
    },

    { path: "/api/admin/kds-users", respond: () => kdsUsers },
    {
      method: "POST",
      path: "/api/admin/kds-users",
      respond: ({ body }) => {
        const created: AdminKdsUser = {
          kds_user_id: `k${nextId++}`,
          username: body.username,
          connected: false,
          last_seen: null,
          priority: body.priority ?? kdsUsers.length + 1,
          active: true,
          menu_filter: { mode: "all", item_ids: [], categories: [] },
        };
        kdsUsers.push(created);
        return created;
      },
    },
    { method: "PUT", path: /^\/api\/admin\/kds-users\/([^/]+)\/pin$/, respond: ({ match }) => findKds(match[1]) ?? reply(404) },
    {
      method: "PUT",
      path: /^\/api\/admin\/kds-users\/([^/]+)\/priority$/,
      respond: ({ match, body }) => {
        const user = findKds(match[1]);
        if (!user) return reply(404);
        user.priority = body.priority;
        return user;
      },
    },
    {
      method: "PUT",
      path: /^\/api\/admin\/kds-users\/([^/]+)\/active$/,
      respond: ({ match, body }) => {
        const user = findKds(match[1]);
        if (!user) return reply(404);
        user.active = body.active;
        return user;
      },
    },
    {
      method: "PUT",
      path: /^\/api\/admin\/kds-users\/([^/]+)\/menu-filter$/,
      respond: ({ match, body }) => {
        const user = findKds(match[1]);
        if (!user) return reply(404);
        user.menu_filter = body;
        return user;
      },
    },
  ];
}
