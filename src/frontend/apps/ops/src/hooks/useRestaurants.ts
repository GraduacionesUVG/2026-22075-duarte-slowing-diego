import { useCallback, useEffect, useMemo, useState } from "react";
import { opsApi, type TiAdminUser, type TiKdsUser, type TiRestaurant } from "@repo/api-client";
import type { BadgeStatus } from "../components/StatusBadge";

export type Locale = {
  id: string;
  name: string;
  location: string;
  admins: TiAdminUser[];
  stations: TiKdsUser[];
  status: BadgeStatus;
  statusLabel: string;
};

function statusOf(restaurant: TiRestaurant, admins: TiAdminUser[]): Pick<Locale, "status" | "statusLabel"> {
  if (!restaurant.active) return { status: "warning", statusLabel: "Inactivo" };
  if (admins.length > 0 && admins.every((a) => a.password_pending)) return { status: "info", statusLabel: "Acceso pendiente" };
  return { status: "success", statusLabel: "Operando" };
}

function errorMessage(e: unknown, fallback: string): string {
  return e instanceof Error ? e.message : fallback;
}

export function useRestaurants() {
  const [locales, setLocales] = useState<Locale[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [resendingId, setResendingId] = useState<string | null>(null);

  const [addingAdmin, setAddingAdmin] = useState(false);
  const [newAdminName, setNewAdminName] = useState("");
  const [newAdminEmail, setNewAdminEmail] = useState("");

  const [formName, setFormName] = useState("");
  const [formAdminName, setFormAdminName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formLocation, setFormLocation] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [restaurants, admins, stations] = await Promise.all([
        opsApi.listRestaurants(),
        opsApi.listAdmins(),
        opsApi.listKdsUsers(),
      ]);
      setLocales(
        restaurants.map((r) => {
          const rAdmins = admins.filter((a) => a.restaurant_id === r.id);
          return {
            id: r.id,
            name: r.name,
            location: r.location ?? "Sin ubicación",
            admins: rAdmins,
            stations: stations.filter((s) => s.restaurant_id === r.id),
            ...statusOf(r, rAdmins),
          };
        }),
      );
      setSelectedId((prev) => prev ?? restaurants[0]?.id ?? null);
      setError(null);
    } catch (e) {
      setError(errorMessage(e, "No se pudieron cargar los restaurantes."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const selected = useMemo(() => locales.find((l) => l.id === selectedId) ?? null, [locales, selectedId]);

  const canCreate =
    !creating && formName.trim().length >= 2 && formAdminName.trim().length >= 2 && /\S+@\S+\.\S+/.test(formEmail);

  const createRestaurant = useCallback(async () => {
    if (!canCreate) return;
    setCreating(true);
    setError(null);
    setNotice(null);
    try {
      const result = await opsApi.createRestaurant({
        restaurant_name: formName.trim(),
        admin_username: formAdminName.trim(),
        admin_email: formEmail.trim(),
        location: formLocation.trim() || null,
      });
      setNotice(
        result.email_sent
          ? `Restaurante creado. Se envió el correo de bienvenida a ${result.admin.email}.`
          : `Restaurante creado, pero el correo a ${result.admin.email} no salió. Usa "Reenviar acceso".`,
      );
      setFormName("");
      setFormAdminName("");
      setFormEmail("");
      setFormLocation("");
      await load();
      setSelectedId(result.restaurant.id);
    } catch (e) {
      setError(errorMessage(e, "No se pudo crear el restaurante."));
    } finally {
      setCreating(false);
    }
  }, [canCreate, formName, formAdminName, formEmail, formLocation, load]);

  // Reenvía el enlace para definir (o cambiar) la contraseña del administrador.
  const resendAccess = useCallback(async (admin: TiAdminUser) => {
    setResendingId(admin.id);
    setError(null);
    setNotice(null);
    try {
      const res = await opsApi.sendPasswordReset(admin.id);
      setNotice(res.detail);
    } catch (e) {
      setError(errorMessage(e, "No se pudo enviar el correo."));
    } finally {
      setResendingId(null);
    }
  }, []);

  const canAddAdmin = !addingAdmin && !!selectedId && newAdminName.trim().length >= 2 && /\S+@\S+\.\S+/.test(newAdminEmail);

  // Agrega otro administrador al restaurante seleccionado; le llega el enlace para crear su contraseña.
  const addAdmin = useCallback(async () => {
    if (!canAddAdmin || !selectedId) return;
    setAddingAdmin(true);
    setError(null);
    setNotice(null);
    try {
      const admin = await opsApi.createAdmin({
        restaurant_id: selectedId,
        username: newAdminName.trim(),
        email: newAdminEmail.trim(),
      });
      setNotice(`Administrador creado. Se envió el enlace de acceso a ${admin.email}.`);
      setNewAdminName("");
      setNewAdminEmail("");
      await load();
    } catch (e) {
      setError(errorMessage(e, "No se pudo crear el administrador."));
    } finally {
      setAddingAdmin(false);
    }
  }, [canAddAdmin, selectedId, newAdminName, newAdminEmail, load]);

  return {
    newAdminName,
    setNewAdminName,
    newAdminEmail,
    setNewAdminEmail,
    canAddAdmin,
    addingAdmin,
    addAdmin,
    locales,
    selected,
    selectedId,
    selectLocale: setSelectedId,
    loading,
    error,
    notice,
    reload: load,
    formName,
    setFormName,
    formAdminName,
    setFormAdminName,
    formEmail,
    setFormEmail,
    formLocation,
    setFormLocation,
    canCreate,
    creating,
    createRestaurant,
    resendAccess,
    resendingId,
  };
}
