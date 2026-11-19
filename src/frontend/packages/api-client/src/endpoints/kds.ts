/// <reference types="vite/client" />
import { apiRequest } from "../client";
import type { KdsMenuItem, KdsSession, KdsStationState, MenuOffMode } from "../types";
import type { CurrentShift, ShiftListItem, ShiftSummary, StartShiftResult } from "./shifts";

interface StationDto {
  kds_user_id: string;
  username: string;
  active: boolean;
}

const toStationState = (dto: StationDto): KdsStationState => ({
  kdsUserId: dto.kds_user_id,
  username: dto.username,
  active: dto.active ?? true,
});

interface LoginDto {
  access_token: string;
  kds_user_id: string;
  username: string;
  restaurant_id: string | null;
  restaurant_name: string;
}

interface MenuItemDto {
  id: string;
  name: string;
  category: string;
  category_icon?: string | null;
  price: number;
  // Valor crudo: un producto apagado "por hoy" sigue con available = true.
  available: boolean;
  // Disponibilidad efectiva e indicador de cómo está apagado (los calcula el backend).
  active?: boolean;
  inactive_mode?: MenuOffMode | null;
}

const toMenuItem = (dto: MenuItemDto): KdsMenuItem => ({
  id: dto.id,
  name: dto.name,
  category: dto.category,
  categoryIcon: dto.category_icon || undefined,
  price: dto.price,
  available: dto.active ?? dto.available,
  inactiveMode: dto.inactive_mode ?? null,
});

export const kdsApi = {
  login: async (username: string, pin: string): Promise<KdsSession> => {
    const dto = await apiRequest<LoginDto>("/auth/kds/login", {
      method: "POST",
      body: { username, pin },
    });
    return {
      accessToken: dto.access_token,
      kdsUserId: dto.kds_user_id,
      username: dto.username,
      restaurantId: dto.restaurant_id,
      restaurantName: dto.restaurant_name,
    };
  },

  // Estado de la estación autenticada (incluye si está en pausa).
  getMe: async (): Promise<KdsStationState> => toStationState(await apiRequest<StationDto>("/api/kds/me")),

  // PUT /api/kds/me/active: pausa (false) o reanuda (true) la recepción de pedidos. El backend
  // avisa por WebSocket a todas las pantallas con esta sesión ({ type: "station_status" }).
  setActive: async (active: boolean): Promise<KdsStationState> =>
    toStationState(await apiRequest<StationDto>("/api/kds/me/active", { method: "PUT", body: { active } })),

  // Items del restaurante de la estación, encendidos y apagados.
  listMenu: async (): Promise<KdsMenuItem[]> =>
    (await apiRequest<MenuItemDto[]>("/api/kds/menu")).map(toMenuItem),

  // PATCH /api/kds/menu/{id}/availability. Encender: { active: true }. Apagar: { active: false, mode }
  // (el backend responde 422 si falta `mode` al apagar).
  setMenuAvailability: async (itemId: string, active: boolean, mode?: MenuOffMode): Promise<KdsMenuItem> =>
    toMenuItem(
      await apiRequest<MenuItemDto>(`/api/kds/menu/${itemId}/availability`, {
        method: "PATCH",
        body: active ? { active: true } : { active: false, mode: mode ?? "daily" },
      }),
    ),

  // Turnos de la estación (docs/HANDOFF_TURNOS_KDS.md).
  currentShift: () => apiRequest<CurrentShift>("/api/kds/shift/current"),
  startShift: () => apiRequest<StartShiftResult>("/api/kds/shift/start", { method: "POST" }),
  endShift: () => apiRequest<ShiftSummary>("/api/kds/shift/end", { method: "POST" }),
  listShifts: (date?: string) => apiRequest<ShiftListItem[]>("/api/kds/shifts", { params: { date } }),
  getShift: (shiftId: string) => apiRequest<ShiftSummary>(`/api/kds/shifts/${shiftId}`),
};
