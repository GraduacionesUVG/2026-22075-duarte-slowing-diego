import type { Order } from "@repo/api-client";
import BoardLayout, { type ShiftBar, type ViewNav } from "../components/BoardLayout";
import OrderCard from "../components/OrderCard";
import QDot from "../components/QDot";
import { useNow } from "../hooks/useNow";
import { elapsedInfo } from "../hooks/useElapsedTime";
import { deliveryEnteredAt, queuedDeliveryOrders } from "../lib/orderFilters";

type DashboardKDSProps = {
  localName: string;
  nav: ViewNav;
  orders: Order[];
  // Pedidos con un cambio de estado en vuelo.
  busyIds?: string[];
  error: string | null;
  isPaused: boolean;
  advanceStage: (orderId: string) => void;
  onOpenCode: (orderId: string) => void;
  togglePaused: () => void;
  shiftBar?: ShiftBar;
  reload: () => void;
  onLogout: () => void;
};

export default function DashboardKDS({
  localName,
  nav,
  orders,
  busyIds = [],
  error,
  isPaused,
  advanceStage,
  onOpenCode,
  togglePaused,
  shiftBar,
  reload,
  onLogout,
}: DashboardKDSProps) {
  const now = useNow();
  // Los pedidos pagados para más tarde viven en la pantalla "En espera" (botón del sidebar).
  const queue = queuedDeliveryOrders(orders, now);

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
      <section className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] items-start gap-4 lg:gap-6">
        {queue.length === 0 ? (
          <div className="col-span-full flex w-full flex-col items-center gap-4 py-20">
            <QDot className="h-12 w-12" />
            <span className="text-lg font-semibold text-gray-900">SIN PEDIDOS EN COLA</span>
            <p className="max-w-[420px] text-center text-xs text-gray-500">
              Los pedidos aparecen aquí en cuanto el cliente paga.
            </p>
          </div>
        ) : (
          queue.map((order) => {
            const { label, tier } = elapsedInfo(deliveryEnteredAt(order), now);
            return (
              <OrderCard
                key={order.id}
                order={order}
                tier={tier}
                elapsedLabel={label}
                busy={busyIds.includes(order.id)}
                onAdvance={advanceStage}
                onOpenCode={onOpenCode}
              />
            );
          })
        )}
      </section>
    </BoardLayout>
  );
}
