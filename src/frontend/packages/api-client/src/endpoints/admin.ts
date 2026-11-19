/// <reference types="vite/client" />
import { apiDownload, apiRequest } from "../client";
import type { AdminShiftsDay, ShiftSummary } from "./shifts";

// --- Tipos (forma del backend, ver /docs) ---------------------------------------------------

export interface AdminSession {
  accessToken: string;
  role: string;
  mustChangePassword: boolean;
  restaurantId: string | null;
  restaurantName: string | null;
  username: string | null;
}

export interface AdminMenuModifier {
  id?: string | null;
  group?: string | null;
  name: string;
  price: number;
}

export interface AdminMenuItem {
  id: string;
  code: string | null;
  name: string;
  category: string;
  description: string | null;
  price: number;
  available: boolean;
  schedule_type: string;
  day_of_week: string | null;
  serve_date: string | null;
  meal_period: string | null;
  prep_time_minutes: number;
  // HH:MM. "Listo aprox. desde" que se le avisa al estudiante.
  ready_from: string | null;
  // HH:MM. Después de esa hora ya no se ofrece el platillo ese día.
  order_cutoff: string | null;
  daily_stock: number | null;
  dine_in_only: boolean;
  // Clave del icono de su categoría (el KDS lo muestra; el panel no lo pinta en el platillo).
  category_icon?: string | null;
  modifiers: AdminMenuModifier[];
}

// GET /api/admin/menu/categories/details
export interface AdminCategory {
  name: string;
  // Clave del icono (guardada o sugerida por el nombre). Los dibujos viven en @repo/category-icons.
  icon: string;
  products_count: number;
}

// Respuesta de GET /auth/password-reset/validate (el enlace del correo sigue vigente).
export interface PasswordResetInfo {
  valid: boolean;
  email: string;
  // "reset" = olvidó su contraseña · "welcome" = cuenta nueva que define su contraseña inicial.
  purpose: "reset" | "welcome" | string;
  expires_at: string;
}

export type MealPeriod = "desayuno" | "almuerzo" | "cena";

export interface AdminMenuItemInput {
  // Identificador del producto en el restaurante (ej. HAMB-01). Vacío = el backend lo genera.
  code?: string | null;
  name: string;
  category: string;
  description?: string | null;
  price: number;
  available?: boolean;
  // "always" = siempre en el menú; "weekly" = un día de la semana; "date" = una fecha concreta.
  schedule_type?: "always" | "weekly" | "date";
  day_of_week?: string | null;
  serve_date?: string | null; // YYYY-MM-DD
  // Momento del día en que se ofrece. null = sin definir.
  meal_period?: MealPeriod | null;
  // Minutos para preparar una unidad.
  prep_time_minutes?: number;
  ready_from?: string | null; // HH:MM
  order_cutoff?: string | null; // HH:MM
  // Porciones disponibles por día; null = sin límite.
  daily_stock?: number | null;
  dine_in_only?: boolean;
  modifiers?: AdminMenuModifier[];
}

export interface DayHours {
  closed: boolean;
  open: string | null;
  close: string | null;
}

export type WeekDayKey = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
export type OpeningHours = Record<WeekDayKey, DayHours>;

export interface AdminRestaurant {
  id: string;
  name: string;
  location: string | null;
  active: boolean;
  opening_hours: OpeningHours;
  is_open_now: boolean;
}

export interface MenuFilter {
  mode: "all" | "custom";
  item_ids: string[];
  categories: string[];
}

export interface AdminKdsUser {
  kds_user_id: string;
  username: string;
  connected: boolean;
  last_seen: string | null;
  priority: number;
  active: boolean;
  menu_filter: MenuFilter;
}

export interface AdminOrder {
  id: string;
  student_id: string;
  items: { product_name: string; quantity: number }[];
  pipeline_status: string;
  payment_status: string;
  total_amount: number;
  request_number: number | null;
  order_number: number | null;
  status_label: string;
  created_at: string;
}

// Solo los campos de /api/metrics/kpis que usa el dashboard.
export interface KpiResponse {
  resumen: { solicitudes: number; pedidos_exitosos: number; ticket_promedio: number };
  ventas: { total: number };
  tiempo_preparacion_min: { promedio: number | null; mediana: number | null; p90: number | null; muestras: number };
  hora_pico: {
    hora_pico_global: { etiqueta: string; promedio_por_dia: number } | null;
    hora_pico_filtrado: { etiqueta: string; pedidos: number } | null;
    total_por_hora: { hora: number; pedidos: number }[];
  };
  abandono: { tasa: number; abandonados: number; aceptados: number; rechazados_por_cocina: number };
  plato_mas_pedido?: { ranking: { nombre: string; cantidad: number }[] };
}

export interface ImportRowError {
  sheet: string | null;
  row: number | null;
  column: string | null;
  error: string;
}

export interface ImportResult {
  dry_run: boolean;
  created: number;
  updated: number;
  replaced_dates: string[];
  warnings: Record<string, unknown>[];
  items: AdminMenuItem[];
}

export type ImportKind = "menu" | "calendar";

// --- Endpoints ------------------------------------------------------------------------------

interface LoginDto {
  access_token: string;
  role: string;
  must_change_password: boolean;
  restaurant_id: string | null;
  restaurant_name: string | null;
  username: string | null;
}

const importPath = (kind: ImportKind) => (kind === "menu" ? "/api/admin/menu" : "/api/admin/menu/calendar");

export const adminApi = {
  login: async (email: string, password: string): Promise<AdminSession> => {
    const dto = await apiRequest<LoginDto>("/auth/admin/login", { method: "POST", body: { email, password } });
    return {
      accessToken: dto.access_token,
      role: dto.role,
      mustChangePassword: dto.must_change_password,
      restaurantId: dto.restaurant_id,
      restaurantName: dto.restaurant_name,
      username: dto.username,
    };
  },

  changePassword: (currentPassword: string, newPassword: string) =>
    apiRequest<void>("/auth/admin/change-password", {
      method: "POST",
      body: { current_password: currentPassword, new_password: newPassword },
    }),

  // 400 si el enlace no existe, ya se usó o venció (el mensaje viene en español del backend).
  validatePasswordReset: (token: string) =>
    apiRequest<PasswordResetInfo>("/auth/password-reset/validate", { params: { token } }),
  // Un solo uso. La contraseña nueva debe tener al menos 8 caracteres.
  confirmPasswordReset: (token: string, newPassword: string) =>
    apiRequest<void>("/auth/password-reset/confirm", { method: "POST", body: { token, new_password: newPassword } }),

  // Siempre responde 202, exista o no el correo.
  requestPasswordReset: (email: string) =>
    apiRequest<void>("/auth/password-reset/request", { method: "POST", body: { email } }),

  // Métricas. `from`/`to` son fechas YYYY-MM-DD (hora de Guatemala).
  kpis: (from: string, to: string) =>
    apiRequest<KpiResponse>("/api/metrics/kpis", { params: { scope: "restaurant", from, to } }),

  listOrders: (date: string) => apiRequest<AdminOrder[]>("/api/admin/orders", { params: { date } }),

  // Menú
  listMenu: () => apiRequest<AdminMenuItem[]>("/api/admin/menu", { params: { include_unavailable: true } }),
  createMenuItem: (input: AdminMenuItemInput) =>
    apiRequest<AdminMenuItem>("/api/admin/menu", { method: "POST", body: input }),
  updateMenuItem: (id: string, input: Partial<AdminMenuItemInput>) =>
    apiRequest<AdminMenuItem>(`/api/admin/menu/${id}`, { method: "PUT", body: input }),
  deleteMenuItem: (id: string) => apiRequest<void>(`/api/admin/menu/${id}`, { method: "DELETE" }),
  listCategories: () => apiRequest<string[]>("/api/admin/menu/categories"),
  // Categorías con icono y cantidad de productos.
  listCategoryDetails: () => apiRequest<AdminCategory[]>("/api/admin/menu/categories/details"),
  // 409 si la categoría ya existe (no distingue mayúsculas). Sin `icon` el backend sugiere uno.
  createCategory: (name: string, icon?: string | null) =>
    apiRequest<{ name: string; icon: string }>("/api/admin/menu/categories", {
      method: "POST",
      body: icon ? { name, icon } : { name },
    }),
  // Cambia el icono y/o renombra. Renombrar actualiza en cascada los platillos y los filtros de KDS.
  // 409 si el nombre nuevo ya existe, 422 si el icono no existe, 404 si la categoría no existe.
  updateCategory: (name: string, patch: { name?: string; icon?: string }) =>
    apiRequest<{ name: string; icon: string }>(`/api/admin/menu/categories/${encodeURIComponent(name)}`, {
      method: "PATCH",
      body: patch,
    }),
  // 409 si aún tiene platillos (detail.products los lista).
  deleteCategory: (name: string) =>
    apiRequest<void>(`/api/admin/menu/categories/${encodeURIComponent(name)}`, { method: "DELETE" }),

  // Importación por Excel. `dryRun` valida sin guardar. Errores: 422 (detail.errors),
  // y para el calendario 409 (detail.warnings) si hay fechas con menú: repetir con acceptWarnings.
  downloadTemplate: (kind: ImportKind) =>
    apiDownload(kind === "menu" ? "/api/admin/menu/template" : "/api/admin/menu/calendar/template"),
  exportMenu: (kind: ImportKind) =>
    apiDownload(kind === "menu" ? "/api/admin/menu/export" : "/api/admin/menu/calendar/export"),
  importFile: (kind: ImportKind, file: File, opts: { dryRun: boolean; acceptWarnings?: boolean }) => {
    const form = new FormData();
    form.append("file", file);
    return apiRequest<ImportResult>(`${importPath(kind)}/import`, {
      method: "POST",
      body: form,
      params: {
        dry_run: opts.dryRun,
        accept_warnings: kind === "calendar" ? (opts.acceptWarnings ?? false) : undefined,
      },
    });
  },

  // Restaurante
  getRestaurant: () => apiRequest<AdminRestaurant>("/api/admin/restaurant"),
  updateOpeningHours: (hours: OpeningHours) =>
    apiRequest<AdminRestaurant>("/api/admin/restaurant/opening-hours", { method: "PUT", body: hours }),
  updateLocation: (location: string) =>
    apiRequest<AdminRestaurant>("/api/admin/restaurant/location", { method: "PUT", body: { location } }),

  // Estaciones KDS. El PIN nunca se puede leer: solo se define al crear o al cambiarlo.
  listKdsUsers: () => apiRequest<AdminKdsUser[]>("/api/admin/kds-users"),
  createKdsUser: (input: { username: string; pin: string; priority?: number }) =>
    apiRequest<AdminKdsUser>("/api/admin/kds-users", { method: "POST", body: input }),
  setKdsPin: (id: string, pin: string) =>
    apiRequest<AdminKdsUser>(`/api/admin/kds-users/${id}/pin`, { method: "PUT", body: { pin } }),
  setKdsPriority: (id: string, priority: number) =>
    apiRequest<AdminKdsUser>(`/api/admin/kds-users/${id}/priority`, { method: "PUT", body: { priority } }),
  setKdsActive: (id: string, active: boolean) =>
    apiRequest<AdminKdsUser>(`/api/admin/kds-users/${id}/active`, { method: "PUT", body: { active } }),
  setKdsMenuFilter: (id: string, filter: MenuFilter) =>
    apiRequest<AdminKdsUser>(`/api/admin/kds-users/${id}/menu-filter`, { method: "PUT", body: filter }),

  // Resumen de turnos del día (facturación de las estaciones). 
  listShifts: (date: string, kdsUserId?: string) =>
    apiRequest<AdminShiftsDay>("/api/admin/shifts", { params: { date, kds_user_id: kdsUserId } }),
  getShift: (shiftId: string) => apiRequest<ShiftSummary>(`/api/admin/shifts/${shiftId}`),
};
