import type { Order } from "@repo/api-client";
import type { UrgencyTier } from "../hooks/useElapsedTime";
import { useDoubleTap } from "../hooks/useDoubleTap";
import { CHANNEL_LABEL } from "./OrderCard";
import Spinner from "./Spinner";
import CardHeader from "./CardHeader";
import OrderItemLine from "./OrderItemLine";
import { orderSpeechText } from "../lib/speech";
import { SHOW_ORDER_CHANNEL } from "../lib/features";

type AcceptanceCardProps = {
  order: Order;
  tier: UrgencyTier;
  elapsedLabel: string;
  // Aceptar/rechazar en vuelo: el botón muestra el loader y no acepta otro toque.
  busy?: boolean;
  onAccept: (orderId: string) => void;
  onReject: (orderId: string) => void;
};

// Tarjeta de la versión de Aceptación: la cocina decide si acepta o rechaza según su
// disponibilidad. Al aceptar, el backend genera el link de pago y se lo envía al cliente;
// el seguimiento del pago ya no pasa por el KDS.
export default function AcceptanceCard({
  order,
  tier,
  elapsedLabel,
  busy = false,
  onAccept,
  onReject,
}: AcceptanceCardProps) {
  const handleAcceptTap = useDoubleTap(() => {
    if (!busy) onAccept(order.id);
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

      <div className="flex flex-row gap-2">
        <button
          type="button"
          onClick={handleAcceptTap}
          disabled={busy}
          aria-busy={busy}
          className="flex h-14 flex-grow items-center justify-center gap-2 rounded-[20px] bg-kds-brand px-3 text-lg font-semibold text-white disabled:cursor-wait disabled:opacity-70"
        >
          {busy && <Spinner />}
          {busy ? "PROCESANDO…" : "ACEPTAR"}
        </button>
        <button
          type="button"
          onClick={() => onReject(order.id)}
          disabled={busy}
          className="kds-ring-border h-14 w-[120px] rounded-[20px] bg-white text-lg font-semibold text-kds-late disabled:cursor-wait disabled:opacity-50"
        >
          RECHAZAR
        </button>
      </div>
    </div>
  );
}
