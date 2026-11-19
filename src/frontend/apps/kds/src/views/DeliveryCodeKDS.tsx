import { useState } from "react";
import type { Order } from "@repo/api-client";
import Keypad from "../components/Keypad";
import PinBoxes from "../components/PinBoxes";
import QDot from "../components/QDot";
import { SHOW_ORDER_CHANNEL } from "../lib/features";

const CODE_LENGTH = 4;
const CHANNEL_LABEL: Record<Order["orderType"], string> = {
  dine_in: "PARA COMER AQUÍ",
  takeout: "PARA LLEVAR",
};

type DeliveryCodeKDSProps = {
  order: Order;
  onConfirm: (orderId: string, code: string) => Promise<boolean>;
  onBack: () => void;
};

export default function DeliveryCodeKDS({
  order,
  onConfirm,
  onBack,
}: DeliveryCodeKDSProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);
  const [checking, setChecking] = useState(false);

  const enterDigit = (digit: string) => {
    setError(false);
    setCode((prev) => (prev.length >= CODE_LENGTH ? prev : prev + digit));
  };
  const backspace = () => {
    setError(false);
    setCode((prev) => prev.slice(0, -1));
  };
  const clear = () => {
    setError(false);
    setCode("");
  };

  const handleConfirm = async () => {
    if (code.length !== CODE_LENGTH || checking) return;
    setChecking(true);
    const ok = await onConfirm(order.id, code);
    setChecking(false);
    if (!ok) {
      setError(true);
      setCode("");
    }
  };

  return (
    <div className="flex h-screen w-screen flex-row bg-white">
      <div className="flex w-64 flex-shrink-0 flex-col gap-4 overflow-auto bg-kds-sidebar p-6 lg:w-96 lg:p-10">
        <QDot className="h-9 w-9" />
        <span className="text-lg font-semibold text-white">PEDIDO #{order.orderNumber}</span>
        <span className="text-lg font-semibold text-kds-brand">{order.customerName}</span>
        {SHOW_ORDER_CHANNEL && (
          <div className="w-fit rounded-[20px] bg-white/10 px-5 py-2">
            <span className="whitespace-nowrap text-lg font-semibold text-white">
              {CHANNEL_LABEL[order.orderType]}
            </span>
          </div>
        )}
        <div className="flex flex-col gap-1.5 pt-4">
          {order.items.map((item) => (
            <span key={item.id} className="text-lg font-semibold text-white">
              x{item.quantity} {item.name}
            </span>
          ))}
        </div>
        <span className="mt-auto text-xs leading-relaxed text-indigo-200">
          El bot envía un código de 4 dígitos al cliente cuando paga.
        </span>
      </div>

      <div className="flex flex-grow flex-col gap-6 overflow-auto p-6 short:gap-3 short:p-4 lg:p-12 [&>:first-child]:mt-auto [&>:last-child]:mb-auto">
        <div className="flex flex-row items-center gap-4">
          <span className="flex-grow text-lg font-semibold text-gray-900">
            CÓDIGO DE ENTREGA
          </span>
          <button
            type="button"
            onClick={onBack}
            className="kds-ring-border h-12 rounded-[20px] bg-white px-5 text-lg font-semibold text-gray-500"
          >
            Volver
          </button>
        </div>

        <div className="flex justify-center">
          <PinBoxes length={CODE_LENGTH} value={code} error={error} />
        </div>

        {error && (
          <div className="flex flex-col gap-1 rounded-lg bg-[var(--status-error-bg)] px-4 py-3">
            <span className="text-lg font-semibold text-[var(--status-error-text)]">CÓDIGO INCORRECTO</span>
            <span className="text-xs text-[var(--status-error-text)]">
              Pide al cliente el último mensaje del bot.
            </span>
          </div>
        )}

        <div className="flex justify-center">
          <Keypad onDigit={enterDigit} onClear={clear} onBackspace={backspace} />
        </div>

        <button
          type="button"
          onClick={() => void handleConfirm()}
          disabled={code.length !== CODE_LENGTH || checking}
          className="h-16 flex-shrink-0 rounded-[20px] bg-kds-ontime short:h-14 text-lg font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          {checking ? "VALIDANDO…" : "CONFIRMAR ENTREGA"}
        </button>
      </div>
    </div>
  );
}
