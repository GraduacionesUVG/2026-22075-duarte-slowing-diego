import { useCallback, useEffect, useState } from "react";
import {
  adminApi,
  type AdminKdsUser,
  type AdminRestaurant,
  type MenuFilter,
  type OpeningHours,
  type WeekDayKey,
} from "@repo/api-client";
import type { Notifier } from "./useToast";

export const WEEK_DAYS: { key: WeekDayKey; label: string }[] = [
  { key: "monday", label: "Lun" },
  { key: "tuesday", label: "Mar" },
  { key: "wednesday", label: "Mié" },
  { key: "thursday", label: "Jue" },
  { key: "friday", label: "Vie" },
  { key: "saturday", label: "Sáb" },
  { key: "sunday", label: "Dom" },
];

export type DaySchedule = {
  key: WeekDayKey;
  label: string;
  enabled: boolean;
  open: string; // "HH:MM"
  close: string; // "HH:MM"
};

const DEFAULT_OPEN = "08:00";
const DEFAULT_CLOSE = "20:00";

function toSchedule(hours: OpeningHours): DaySchedule[] {
  return WEEK_DAYS.map(({ key, label }) => {
    const day = hours[key];
    return {
      key,
      label,
      enabled: !day.closed,
      open: day.open ?? DEFAULT_OPEN,
      close: day.close ?? DEFAULT_CLOSE,
    };
  });
}

function toOpeningHours(schedule: DaySchedule[]): OpeningHours {
  return Object.fromEntries(
    schedule.map((d) => [
      d.key,
      d.enabled ? { closed: false, open: d.open, close: d.close } : { closed: true, open: null, close: null },
    ]),
  ) as OpeningHours;
}

function errorMessage(e: unknown, fallback: string): string {
  return e instanceof Error && e.message ? e.message : fallback;
}

// `notify` muestra el aviso flotante: toda operación termina en un aviso de éxito o de error.
export function useRestaurantSettings(notify: Notifier) {
  const [restaurant, setRestaurant] = useState<AdminRestaurant | null>(null);
  const [schedule, setSchedule] = useState<DaySchedule[]>([]);
  const [location, setLocationText] = useState("");
  const [kdsUsers, setKdsUsers] = useState<AdminKdsUser[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  // Solo del primer cargado: lo que falla al guardar se avisa con el aviso flotante.
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const applyRestaurant = useCallback((r: AdminRestaurant) => {
    setRestaurant(r);
    setSchedule(toSchedule(r.opening_hours));
    setLocationText(r.location ?? "");
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [r, users, cats] = await Promise.all([
        adminApi.getRestaurant(),
        adminApi.listKdsUsers(),
        adminApi.listCategories(),
      ]);
      applyRestaurant(r);
      setKdsUsers(users);
      setCategories(cats);
      setError(null);
    } catch (e) {
      setError(errorMessage(e, "No se pudo cargar la configuración."));
    } finally {
      setLoading(false);
    }
  }, [applyRestaurant]);

  useEffect(() => {
    void load();
  }, [load]);

  // Ejecuta una operación contra el backend y avisa del resultado. Devuelve lo que regrese la
  // operación, o null si falló.
  const run = useCallback(
    async <T,>(action: () => Promise<T>, successMessage: string, failureMessage: string): Promise<T | null> => {
      setSaving(true);
      try {
        const result = await action();
        notify.success(successMessage);
        return result;
      } catch (e) {
        notify.error(`${failureMessage}: ${errorMessage(e, "error desconocido")}`);
        return null;
      } finally {
        setSaving(false);
      }
    },
    [notify],
  );

  const updateDay = useCallback((key: WeekDayKey, patch: Partial<DaySchedule>) => {
    setSchedule((prev) => prev.map((d) => (d.key === key ? { ...d, ...patch } : d)));
  }, []);

  const saveSchedule = useCallback(
    () =>
      run(
        async () => applyRestaurant(await adminApi.updateOpeningHours(toOpeningHours(schedule))),
        "Horario guardado.",
        "No se pudo guardar el horario",
      ),
    [run, schedule, applyRestaurant],
  );

  const setLocation = useCallback((value: string) => setLocationText(value), []);

  const saveLocation = useCallback(
    () =>
      run(
        async () => applyRestaurant(await adminApi.updateLocation(location.trim())),
        "Ubicación guardada.",
        "No se pudo guardar la ubicación",
      ),
    [run, location, applyRestaurant],
  );

  const replaceKdsUser = useCallback((updated: AdminKdsUser) => {
    setKdsUsers((prev) => prev.map((u) => (u.kds_user_id === updated.kds_user_id ? updated : u)));
  }, []);

  // Devuelve la estación creada (para seleccionarla) o null si falló.
  const addKdsUser = useCallback(
    (username: string, pin: string, priority: number) =>
      run(
        async () => {
          const created = await adminApi.createKdsUser({ username: username.trim(), pin, priority });
          setKdsUsers((prev) => [...prev, created]);
          return created;
        },
        `Estación "${username.trim()}" creada.`,
        `No se pudo crear la estación "${username.trim()}"`,
      ),
    [run],
  );

  const changeKdsPin = useCallback(
    (id: string, pin: string) =>
      run(
        async () => replaceKdsUser(await adminApi.setKdsPin(id, pin)),
        "PIN actualizado. La estación deberá volver a iniciar sesión.",
        "No se pudo cambiar el PIN",
      ),
    [run, replaceKdsUser],
  );

  const changeKdsPriority = useCallback(
    (id: string, priority: number) =>
      run(
        async () => replaceKdsUser(await adminApi.setKdsPriority(id, priority)),
        "Prioridad actualizada.",
        "No se pudo cambiar la prioridad",
      ),
    [run, replaceKdsUser],
  );

  const toggleKdsActive = useCallback(
    (user: AdminKdsUser) =>
      run(
        async () => replaceKdsUser(await adminApi.setKdsActive(user.kds_user_id, !user.active)),
        user.active ? `Estación "${user.username}" pausada.` : `Estación "${user.username}" activada.`,
        user.active ? "No se pudo pausar la estación" : "No se pudo activar la estación",
      ),
    [run, replaceKdsUser],
  );

  const changeKdsMenuFilter = useCallback(
    (id: string, filter: MenuFilter) =>
      run(
        async () => replaceKdsUser(await adminApi.setKdsMenuFilter(id, filter)),
        "Productos de la estación actualizados.",
        "No se pudieron actualizar los productos de la estación",
      ),
    [run, replaceKdsUser],
  );

  return {
    restaurant,
    schedule,
    location,
    kdsUsers,
    categories,
    loading,
    error,
    saving,
    reload: load,
    updateDay,
    saveSchedule,
    setLocation,
    saveLocation,
    addKdsUser,
    changeKdsPin,
    changeKdsPriority,
    toggleKdsActive,
    changeKdsMenuFilter,
  };
}
