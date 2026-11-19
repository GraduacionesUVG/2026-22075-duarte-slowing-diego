import type { Order } from "@repo/api-client";

type DevPaymentPanelProps = {
  orders: Order[];
  onSimulatePayment: (orderId: string) => void;
};

// SOLO DESARROLLO (App solo lo monta con import.meta.env.DEV). El KDS ya no muestra la cola
// de pedidos pendientes de pago; este panel deja simular el webhook de BAC para probar el flujo.
export default function DevPaymentPanel({ orders, onSimulatePayment }: DevPaymentPanelProps) {
  const awaitingPayment = orders.filter(
    (o) => o.pipelineStatus === "accepted" && o.paymentStatus === "pending",
  );

  return (
    <section className="flex flex-col gap-3 rounded-[20px] border-2 border-dashed border-kds-warning p-4">
      <h2 className="text-sm font-semibold text-gray-700">
        DEV · SIMULAR PAGO · {awaitingPayment.length}
      </h2>
      {awaitingPayment.length === 0 ? (
        <p className="text-xs text-gray-500">
          Sin pedidos aceptados pendientes de pago.
        </p>
      ) : (
        <ul className="flex flex-row flex-wrap gap-3">
          {awaitingPayment.map((order) => (
            <li
              key={order.id}
              className="kds-ring-border flex flex-row items-center gap-3 rounded-[20px] bg-white px-4 py-2"
            >
              <span className="text-sm font-semibold text-gray-900">
                #{order.orderNumber} · {order.customerName}
              </span>
              <button
                type="button"
                onClick={() => onSimulatePayment(order.id)}
                title="Simula la confirmación de pago del backend (POST /webhooks/bac-payment)"
                className="h-9 rounded-[20px] bg-kds-warning px-4 text-xs font-semibold text-black"
              >
                SIMULAR PAGO
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
