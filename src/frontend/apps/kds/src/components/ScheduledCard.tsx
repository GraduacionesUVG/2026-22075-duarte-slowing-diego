import type { Order } from "@repo/api-client";
import CardHeader from "./CardHeader";
import { orderSpeechText } from "../lib/speech";
import OrderItemLine from "./OrderItemLine";

const timeFormat = new Intl.DateTimeFormat("es-GT", { hour: "2-digit", minute: "2-digit", hour12: false });

export function formatClock(iso: string): string {
  return timeFormat.format(new Date(iso));
}

function formatCountdown(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(Math.floor(totalSeconds / 3600))}:${pad(Math.floor((totalSeconds % 3600) / 60))}:${pad(totalSeconds % 60)}`;
}

type ScheduledCardProps = {
  order: Order;
  now: number;
};

// Pedido ya pagado que todavía no entra a preparación porque el cliente lo quiere para más tarde
// ("lo paso a traer a las X"). Muestra la hora de recogida y cuánto falta para empezar; al llegar
// esa hora el sistema lo pasa solo a la cola principal (la cocina no lo adelanta a mano).
export default function ScheduledCard({ order, now }: ScheduledCardProps) {
  const pickupAt = order.requestedReadyTime ?? order.readyAt;
  const startsInMs = order.prepStartTime ? new Date(order.prepStartTime).getTime() - now : 0;

  return (
    <div className="flex w-full min-w-0 flex-col gap-3">
      <div className="kds-ring-card relative flex min-h-[290px] select-none flex-col overflow-hidden rounded-[30px] bg-[var(--kds-card-bg)]">
        <CardHeader
          tone="payment"
          orderNumber={order.orderNumber}
          customerName={order.customerName}
          elapsedLabel={formatCountdown(startsInMs)}
          speakText={orderSpeechText(order)}
          paid={order.paymentStatus === "paid"}
        />
        <div className="kds-ring-card mx-[23px] mt-2 flex h-[34px] flex-shrink-0 items-center justify-center rounded-[20px]">
          <span className="whitespace-nowrap text-lg font-semibold leading-6 text-gray-500">
            {pickupAt ? `RECOGE A LAS ${formatClock(pickupAt)}` : "PAGADO"}
          </span>
        </div>
        <ul className="mt-4 flex flex-1 flex-col gap-1 pb-4 pl-[38px] pr-4">
          {order.items.map((item) => (
            <OrderItemLine key={item.id} item={item} />
          ))}
        </ul>
      </div>
    </div>
  );
}
