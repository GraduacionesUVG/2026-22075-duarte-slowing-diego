import { useEffect } from "react";
import type { Order } from "@repo/api-client";
import ScheduledCard from "./ScheduledCard";
import QDot from "./QDot";
import { scheduledOrders } from "../lib/orderFilters";

type WaitingModalProps = {
  orders: Order[];
  now: number;
  onClose: () => void;
};

// Popup con los pedidos pagados para más tarde (ej. almuerzos). El sistema los pasa solo a
// Entrega cuando se acerca la hora; aquí solo se consultan.
export default function WaitingModal({ orders, now, onClose }: WaitingModalProps) {
  const waiting = scheduledOrders(orders, now);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 lg:p-6" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="waiting-modal-title"
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-full w-full max-w-[1000px] flex-col gap-4 overflow-hidden rounded-2xl bg-white p-5 lg:gap-6 lg:p-8 shadow-xl"
      >
        <div className="flex flex-row items-center gap-4">
          <h2 id="waiting-modal-title" className="flex-grow text-lg font-semibold text-gray-900">
            PEDIDOS EN ESPERA · {waiting.length}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="kds-ring-border h-12 rounded-[20px] bg-white px-5 text-lg font-semibold text-gray-500"
          >
            Cerrar
          </button>
        </div>

        <div className="kds-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain pr-2">
          {waiting.length === 0 ? (
            <div className="flex w-full flex-col items-center gap-4 py-12">
              <QDot className="h-12 w-12" />
              <span className="text-lg font-semibold text-gray-900">SIN PEDIDOS EN ESPERA</span>
              <p className="max-w-[420px] text-center text-xs text-gray-500">
                Aquí aparecen los pedidos pagados para más tarde. Pasan solos a Entrega cuando se acerca la
                hora.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] items-start gap-4 lg:gap-6">
              {waiting.map((order) => (
                <ScheduledCard key={order.id} order={order} now={now} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
