import { useCallback, useEffect, useState } from "react";
import { ApiError, kdsApi, type KdsMenuItem, type MenuOffMode } from "@repo/api-client";

type UseMenuItemsOptions = {
  onUnauthorized: () => void;
};

// Menú del restaurante para activar/desactivar productos desde la cocina.
export function useMenuItems({ onUnauthorized }: UseMenuItemsOptions) {
  const [items, setItems] = useState<KdsMenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Productos con un cambio en vuelo: su casilla se bloquea hasta que responda el backend.
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());

  const fail = useCallback(
    (e: unknown) => {
      if (e instanceof ApiError && e.status === 401) {
        onUnauthorized();
        return;
      }
      setError(e instanceof Error ? e.message : "No se pudo completar la operación.");
    },
    [onUnauthorized],
  );

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await kdsApi.listMenu());
      setError(null);
    } catch (e) {
      fail(e);
    } finally {
      setLoading(false);
    }
  }, [fail]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const setAvailable = useCallback(
    async (itemId: string, available: boolean, mode?: MenuOffMode) => {
      const patch = (changes: Pick<KdsMenuItem, "available" | "inactiveMode">) =>
        setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, ...changes } : i)));
      const previous = items.find((i) => i.id === itemId);

      // Cambio optimista; si el backend falla se regresa al valor anterior.
      patch({ available, inactiveMode: available ? null : (mode ?? "daily") });
      setPendingIds((prev) => new Set(prev).add(itemId));
      try {
        const updated = await kdsApi.setMenuAvailability(itemId, available, mode);
        patch({ available: updated.available, inactiveMode: updated.inactiveMode });
        setError(null);
      } catch (e) {
        if (previous) patch({ available: previous.available, inactiveMode: previous.inactiveMode });
        fail(e);
      } finally {
        setPendingIds((prev) => {
          const next = new Set(prev);
          next.delete(itemId);
          return next;
        });
      }
    },
    [fail, items],
  );

  return { items, loading, error, pendingIds, setAvailable, reload };
}
