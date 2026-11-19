import { useEffect, useRef } from "react";
import type { Order } from "@repo/api-client";
import { pendingAcceptanceOrders, queuedDeliveryOrders } from "../lib/orderFilters";
import { playOrderSound } from "../lib/sounds";

type UseOrderAlertsOptions = {
  orders: Order[];
  // La primera carga de la cola no suena: solo los pedidos que lleguen después.
  loading: boolean;
  now: number;
  // Solo con el tablero abierto (sesión y turno activos). Al cerrarse, se vuelve a empezar de cero.
  active: boolean;
};

const DELIVERY_DELAY_MS = 800;

// Suena cuando cae un pedido nuevo en Aceptación (solicitud pendiente) o en Entrega (pedido ya
// pagado que entra a la cola, incluidos los programados cuando llega su hora). Aunque estés en
// otra página, para que la cocina no tenga que mirar la pantalla.
export function useOrderAlerts({ orders, loading, now, active }: UseOrderAlertsOptions) {
  const seen = useRef<{ acceptance: Set<string>; delivery: Set<string> } | null>(null);

  useEffect(() => {
    if (!active) {
      seen.current = null;
      return;
    }
    if (loading) return;

    const acceptance = new Set(pendingAcceptanceOrders(orders).map((o) => o.id));
    const delivery = new Set(queuedDeliveryOrders(orders, now).map((o) => o.id));

    if (seen.current === null) {
      seen.current = { acceptance, delivery };
      return;
    }

    const newAcceptance = [...acceptance].some((id) => !seen.current?.acceptance.has(id));
    const newDelivery = [...delivery].some((id) => !seen.current?.delivery.has(id));
    seen.current = { acceptance, delivery };

    if (newAcceptance) playOrderSound("acceptance");
    if (newDelivery) {
      // Si llegan los dos tipos a la vez, el segundo suena después del primero.
      if (newAcceptance) setTimeout(() => playOrderSound("delivery"), DELIVERY_DELAY_MS);
      else playOrderSound("delivery");
    }
  }, [orders, loading, now, active]);
}
