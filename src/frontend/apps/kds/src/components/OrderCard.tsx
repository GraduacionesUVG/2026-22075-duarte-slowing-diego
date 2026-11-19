import type { Order } from "@repo/api-client";
import type { UrgencyTier } from "../hooks/useElapsedTime";
import { useDoubleTap } from "../hooks/useDoubleTap";
import Spinner from "./Spinner";
import CardHeader from "./CardHeader";
import OrderItemLine from "./OrderItemLine";
import { StageIcon, type StageIconName } from "./ActionIcons";
import { orderSpeechText } from "../lib/speech";
import { SHOW_ORDER_CHANNEL } from "../lib/features";

type DeliveryStage = "queued" | "preparing" | "ready";

// label = acción del botón principal.
const STAGES: Record<DeliveryStage, { label: string; icon: StageIconName }> = {
  queued: { label: "EN PREPARACIÓN", icon: "prepare" },
  preparing: { label: "LISTO PARA ENTREGA", icon: "ready" },
  ready: { label: "ENTREGAR CON CÓDIGO", icon: "deliver" },
};

function stageOf(order: Order): DeliveryStage {
  if (order.pipelineStatus === "ready_for_pickup") return "ready";
  if (order.pipelineStatus === "in_preparation") return "preparing";
  return "queued";
}

export const CHANNEL_LABEL: Record<Order["orderType"], string> = {
  dine_in: "PARA COMER AQUÍ",
  takeout: "PARA LLEVAR",
};

type OrderCardProps = {
  order: Order;
  tier: UrgencyTier;
  elapsedLabel: string;
  // Hay un cambio de estado en vuelo para este pedido: el botón muestra el loader y no responde.
  busy?: boolean;
  onAdvance: (orderId: string) => void;
  onOpenCode: (orderId: string) => void;
};

export default function OrderCard({ order, tier, elapsedLabel, busy = false, onAdvance, onOpenCode }: OrderCardProps) {
  const stageKey = stageOf(order);
  const stage = STAGES[stageKey];
  const isFinalStage = stageKey === "ready";

  const handleActionTap = useDoubleTap(() => {
    if (busy) return;
    if (isFinalStage) onOpenCode(order.id);
    else onAdvance(order.id);
  });

  return (
    <div className="flex w-full min-w-0 flex-col gap-3">
      <div className="kds-ring-card relative flex min-h-[290px] select-none flex-col overflow-hidden rounded-[30px] bg-[var(--kds-card-bg)]">
        <CardHeader
          tone={tier}
          orderNumber={order.orderNumber}
          customerName={order.customerName}
          elapsedLabel={elapsedLabel}
          speakText={orderSpeechText(order)}
          paid={order.paymentStatus === "paid"}
        />
        {SHOW_ORDER_CHANNEL && (
          <div className="kds-ring-card mx-[23px] mt-2 flex h-[34px] flex-shrink-0 items-center justify-center rounded-[20px]">
            <span className="whitespace-nowrap text-lg font-semibold leading-6 text-gray-500">
              {CHANNEL_LABEL[order.orderType]}
            </span>
          </div>
        )}
        <ul className={`flex flex-1 flex-col gap-1 pb-4 pl-[38px] pr-4 ${SHOW_ORDER_CHANNEL ? "mt-4" : "mt-5"}`}>
          {order.items.map((item) => (
            <OrderItemLine key={item.id} item={item} />
          ))}
        </ul>
      </div>

      <button
        type="button"
        onClick={handleActionTap}
        disabled={busy}
        aria-busy={busy}
        className="flex h-14 items-center justify-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap rounded-[20px] bg-kds-brand px-3 text-lg font-semibold text-white disabled:cursor-wait disabled:opacity-70"
      >
        {busy ? (
          <>
            <Spinner />
            ACTUALIZANDO…
          </>
        ) : (
          <>
            <StageIcon name={stage.icon} />
            {stage.label}
          </>
        )}
      </button>
    </div>
  );
}
