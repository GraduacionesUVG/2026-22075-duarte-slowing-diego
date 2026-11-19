import { useCallback, useEffect, useMemo, useState } from "react";
import { adminApi, ApiError, type AdminCategory } from "@repo/api-client";
import type { Notifier } from "./useToast";

export type Category = {
  name: string;
  // Clave del icono (guardada o sugerida por el backend).
  icon: string;
  productsCount: number;
};

// Platillos que impiden borrar una categoría (detail.products del 409).
export type CategoryInUse = { name: string; products: string[] };

const toCategory = (dto: AdminCategory): Category => ({
  name: dto.name,
  icon: dto.icon,
  productsCount: dto.products_count,
});

function errorText(e: unknown, fallback: string): string {
  return e instanceof Error && e.message ? e.message : fallback;
}

// Categorías del restaurante con su icono: crear, editar (nombre e icono) y eliminar.
export function useCategories(notify: Notifier) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setCategories((await adminApi.listCategoryDetails()).map(toCategory));
      setLoadError(null);
    } catch (e) {
      setLoadError(errorText(e, "No se pudieron cargar las categorías."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const names = useMemo(() => categories.map((c) => c.name), [categories]);

  // Cada acción devuelve null si salió bien o el mensaje de error para mostrar en el diálogo.
  const create = useCallback(
    async (name: string, icon: string | null): Promise<string | null> => {
      try {
        const created = await adminApi.createCategory(name, icon);
        setCategories((prev) =>
          [...prev, { name: created.name, icon: created.icon, productsCount: 0 }].sort((a, b) =>
            a.name.localeCompare(b.name),
          ),
        );
        notify.success(`Categoría "${created.name}" creada.`);
        return null;
      } catch (e) {
        return errorText(e, "No se pudo crear la categoría.");
      }
    },
    [notify],
  );

  const update = useCallback(
    async (current: string, patch: { name?: string; icon?: string }): Promise<string | null> => {
      try {
        const updated = await adminApi.updateCategory(current, patch);
        setCategories((prev) =>
          prev
            .map((c) => (c.name === current ? { ...c, name: updated.name, icon: updated.icon } : c))
            .sort((a, b) => a.name.localeCompare(b.name)),
        );
        notify.success(`Categoría "${updated.name}" actualizada.`);
        return null;
      } catch (e) {
        return errorText(e, "No se pudo guardar la categoría.");
      }
    },
    [notify],
  );

  // null = eliminada. Si aún tiene platillos devuelve cuáles (no es un error del usuario: se explica).
  const remove = useCallback(
    async (name: string): Promise<{ inUse: CategoryInUse } | { error: string } | null> => {
      try {
        await adminApi.deleteCategory(name);
        setCategories((prev) => prev.filter((c) => c.name !== name));
        notify.success(`Categoría "${name}" eliminada.`);
        return null;
      } catch (e) {
        if (e instanceof ApiError && e.status === 409) {
          const detail = e.detail as { products?: { name: string }[] } | undefined;
          return { inUse: { name, products: (detail?.products ?? []).map((p) => p.name) } };
        }
        return { error: errorText(e, "No se pudo eliminar la categoría.") };
      }
    },
    [notify],
  );

  return { categories, names, loading, loadError, reload: load, create, update, remove };
}
