import { useCallback, useEffect, useRef, useState } from "react";
import {
  ApiError,
  ordersApi,
  type Order,
  type OrderPipelineStatus,
  type RejectReason,
  type ShiftSocketEvent,
} from "@repo/api-client";

// Respaldo por si el WebSocket se cae: la cola se vuelve a pedir cada tanto.
const POLL_INTERVAL_MS = 10_000;
const WS_PING_INTERVAL_MS = 30_000;
const WS_RECONNECT_MS = 3_000;

type UseOrdersOptions = {
  token: string | null;
  restaurantId: string | null;
  // El token ya no sirve (401): la sesión se cierra y se vuelve al PIN.
  onUnauthorized: () => void;
  // Mensajes de turno/estación del WebSocket (no traen pedidos: no refrescan la cola).
  onShiftEvent?: (event: ShiftSocketEvent) => void;
};

function wsUrl(restaurantId: string, token: string): string {
  const url = new URL(`/ws/kds/${restaurantId}`, import.meta.env.VITE_API_URL);
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  url.searchParams.set("token", token);
  return url.toString();
}

export function useOrders({ token, restaurantId, onUnauthorized, onShiftEvent }: UseOrdersOptions) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Pedidos con una acción en vuelo: sus botones muestran un loader y no aceptan otro toque.
  // El ref es la guardia síncrona (el estado se actualiza después del render).
  const [busyIds, setBusyIds] = useState<string[]>([]);
  const busyRef = useRef(new Set<string>());
  const unauthorizedRef = useRef(onUnauthorized);
  unauthorizedRef.current = onUnauthorized;
  const shiftEventRef = useRef(onShiftEvent);
  shiftEventRef.current = onShiftEvent;

  // Ejecuta `action` solo si ese pedido no tiene otra acción en curso; devuelve undefined si la ignoró.
  const runExclusive = useCallback(async <T,>(orderId: string, action: () => Promise<T>): Promise<T | undefined> => {
    if (busyRef.current.has(orderId)) return undefined;
    busyRef.current.add(orderId);
    setBusyIds(Array.from(busyRef.current));
    try {
      return await action();
    } finally {
      busyRef.current.delete(orderId);
      setBusyIds(Array.from(busyRef.current));
    }
  }, []);

  const handleError = useCallback((e: unknown) => {
    if (e instanceof ApiError && e.status === 401) {
      unauthorizedRef.current();
      return;
    }
    setError(e instanceof Error ? e.message : "No se pudo actualizar la cola.");
  }, []);

  const reload = useCallback(async () => {
    try {
      setOrders(await ordersApi.listActive());
      setError(null);
    } catch (e) {
      handleError(e);
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  // Carga inicial + polling de respaldo.
  useEffect(() => {
    if (!token) return;
    void reload();
    const timer = setInterval(() => void reload(), POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [token, reload]);

  // Tiempo real: cualquier evento de la estación dispara un refresco de la cola.
  useEffect(() => {
    if (!token || !restaurantId) return;
    let socket: WebSocket | null = null;
    let pingTimer: ReturnType<typeof setInterval> | undefined;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    let closed = false;

    const connect = () => {
      socket = new WebSocket(wsUrl(restaurantId, token));
      socket.onopen = () => {
        pingTimer = setInterval(() => socket?.send("ping"), WS_PING_INTERVAL_MS);
      };
      socket.onmessage = (event) => {
        if (event.data === "pong") return;
        try {
          const message = JSON.parse(String(event.data)) as { type?: string };
          if (message.type === "shift_status" || message.type === "station_status") {
            shiftEventRef.current?.(message as ShiftSocketEvent);
            return;
          }
        } catch {
          // mensaje que no es JSON: se trata como evento de pedidos
        }
        void reload();
      };
      socket.onclose = () => {
        clearInterval(pingTimer);
        if (!closed) retryTimer = setTimeout(connect, WS_RECONNECT_MS);
      };
    };
    connect();

    return () => {
      closed = true;
      clearInterval(pingTimer);
      clearTimeout(retryTimer);
      socket?.close();
    };
  }, [token, restaurantId, reload]);

  const changeStatus = useCallback(
    (orderId: string, status: OrderPipelineStatus) =>
      runExclusive(orderId, async () => {
        try {
          await ordersApi.updateStatus(orderId, status);
        } catch (e) {
          handleError(e);
        }
        // También tras un error (p. ej. 409): la pantalla debe mostrar el estado real.
        await reload();
      }),
    [runExclusive, handleError, reload],
  );

  // Al aceptar, el backend genera el link de pago y se lo manda al cliente.
  const acceptOrder = useCallback((orderId: string) => changeStatus(orderId, "accepted"), [changeStatus]);

  // Rechazar con motivo. kitchen_load: el backend ofrece la solicitud a la siguiente estación o la
  // rechaza del todo; out_of_stock: rechazo definitivo y apaga los productos indicados por hoy.
  const rejectOrder = useCallback(
    (orderId: string, reason: RejectReason, outOfStockItemIds: string[] = []) =>
      runExclusive(orderId, async () => {
        try {
          await ordersApi.reject(orderId, reason, outOfStockItemIds);
        } catch (e) {
          handleError(e);
        }
        await reload();
      }),
    [runExclusive, handleError, reload],
  );

  // Solo para desarrollo: en producción el pago lo confirma el webhook de BAC.
  const simulatePayment = useCallback(
    (orderId: string) =>
      runExclusive(orderId, async () => {
        try {
          await ordersApi.simulatePayment(orderId);
        } catch (e) {
          handleError(e);
        }
        await reload();
      }),
    [runExclusive, handleError, reload],
  );

  // Entrega: pagado en cola -> en preparación -> listo para entrega.
  const advanceStage = useCallback(
    (orderId: string) => {
      const order = orders.find((o) => o.id === orderId);
      if (!order) return;
      if (order.pipelineStatus === "accepted" && order.paymentStatus === "paid") {
        return changeStatus(orderId, "in_preparation");
      }
      if (order.pipelineStatus === "in_preparation") {
        return changeStatus(orderId, "ready_for_pickup");
      }
    },
    [orders, changeStatus],
  );

  // El backend valida el código y marca la orden como entregada.
  const confirmDelivery = useCallback(
    async (orderId: string, code: string): Promise<boolean> =>
      (await runExclusive(orderId, async () => {
        try {
          await ordersApi.validateOtp(orderId, code);
        } catch (e) {
          if (e instanceof ApiError && e.status === 400) return false;
          handleError(e);
          return false;
        }
        await reload();
        return true;
      })) ?? false,
    [runExclusive, handleError, reload],
  );

  return {
    orders,
    loading,
    error,
    busyIds,
    acceptOrder,
    rejectOrder,
    simulatePayment,
    advanceStage,
    confirmDelivery,
    reload,
  };
}
