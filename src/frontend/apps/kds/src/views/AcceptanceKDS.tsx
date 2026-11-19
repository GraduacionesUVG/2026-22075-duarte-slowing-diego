import { useState } from "react";
import type { Order, RejectReason } from "@repo/api-client";
import BoardLayout, { type ShiftBar, type ViewNav } from "../components/BoardLayout";
import AcceptanceCard from "../components/AcceptanceCard";
import RejectOrderDialog from "../components/RejectOrderDialog";
import DevPaymentPanel from "../components/DevPaymentPanel";
import QDot from "../components/QDot";
import { useNow } from "../hooks/useNow";
import { elapsedInfo } from "../hooks/useElapsedTime";
import { pendingAcceptanceOrders } from "../lib/orderFilters";

type AcceptanceKDSProps = {
  localName: string;
  nav: ViewNav;
  orders: Order[];
  // Pedidos con una acción en vuelo.
  busyIds?: string[];
  error: string | null;
  isPaused: boolean;
  onAccept: (orderId: string) => void;
  onReject: (orderId: string, reason: RejectReason, outOfStockItemIds: string[]) => void;
  onSimulatePayment: (orderId: string) => void;
  togglePaused: () => void;
  shiftBar?: ShiftBar;
  reload: () => void;
  onLogout: () => void;
};

// Aceptación: la cocina revisa los pedidos nuevos y decide si los acepta según su
// disponibilidad. Al aceptar, el backend genera el link de pago y se lo manda al cliente;
// cuando paga, el pedido aparece en la versión de Entrega. La cola de pedidos pendientes de
// pago ya no se muestra aquí (solo hay un panel de simulación de pago en desarrollo).
export default function AcceptanceKDS({
  localName,
  nav,
  orders,
  busyIds = [],
  error,
  isPaused,
  onAccept,
  onReject,
  onSimulatePayment,
  togglePaused,
  shiftBar,
  reload,
  onLogout,
}: AcceptanceKDSProps) {
  const now = useNow();
  // Rechazar es destructivo: se pide confirmación.
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  const pending = pendingAcceptanceOrders(orders);
  const target = orders.find((o) => o.id === rejectingId) ?? null;

  return (
    <BoardLayout
      localName={localName}
      nav={nav}
      error={error}
      isPaused={isPaused}
      togglePaused={togglePaused}
      shiftBar={shiftBar}
      reload={reload}
      onLogout={onLogout}
    >
      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-gray-900">
          POR ACEPTAR · {pending.length}
        </h2>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] items-start gap-4 lg:gap-6">
          {pending.length === 0 ? (
            <div className="col-span-full flex w-full flex-col items-center gap-4 py-12">
              <QDot className="h-12 w-12" />
              <span className="text-lg font-semibold text-gray-900">
                SIN PEDIDOS POR ACEPTAR
              </span>
              <p className="max-w-[420px] text-center text-xs text-gray-500">
                Los pedidos nuevos aparecen aquí en cuanto entran.
              </p>
            </div>
          ) : (
            pending.map((order) => {
              const { label, tier } = elapsedInfo(order.createdAt, now);
              return (
                <AcceptanceCard
                  key={order.id}
                  order={order}
                  tier={tier}
                  elapsedLabel={label}
                  busy={busyIds.includes(order.id)}
                  onAccept={onAccept}
                  onReject={setRejectingId}
                />
              );
            })
          )}
        </div>
      </section>

      {import.meta.env.DEV && <DevPaymentPanel orders={orders} onSimulatePayment={onSimulatePayment} />}

      {target && (
        <RejectOrderDialog
          key={target.id}
          order={target}
          onCancel={() => setRejectingId(null)}
          onConfirm={(reason, outOfStockItemIds) => {
            onReject(target.id, reason, outOfStockItemIds);
            setRejectingId(null);
          }}
        />
      )}
    </BoardLayout>
  );
}
