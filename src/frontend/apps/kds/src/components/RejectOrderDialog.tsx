import { useState } from "react";
import type { Order, RejectReason } from "@repo/api-client";

type RejectOrderDialogProps = {
  order: Order;
  onCancel: () => void;
  onConfirm: (reason: RejectReason, outOfStockItemIds: string[]) => void;
};

type Product = { menuItemId: string; name: string; quantity: number };

// Productos del pedido sin repetir (el mismo producto con distintas notas cuenta una sola vez).
function productsOf(order: Order): Product[] {
  const byId = new Map<string, Product>();
  for (const item of order.items) {
    if (!item.menuItemId) continue;
    const found = byId.get(item.menuItemId);
    if (found) found.quantity += item.quantity;
    else byId.set(item.menuItemId, { menuItemId: item.menuItemId, name: item.name, quantity: item.quantity });
  }
  return [...byId.values()];
}

function OptionButton({
  selected,
  disabled,
  title,
  description,
  onClick,
}: {
  selected: boolean;
  disabled?: boolean;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      disabled={disabled}
      onClick={onClick}
      className={`flex flex-col gap-1 rounded-2xl p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-40 ${
        selected ? "bg-[var(--status-error-bg)] ring-2 ring-kds-late" : "bg-white ring-1 ring-gray-200 hover:bg-gray-50"
      }`}
    >
      <span className="text-lg font-semibold text-gray-900">{title}</span>
      <span className="text-xs leading-relaxed text-gray-500">{description}</span>
    </button>
  );
}

// Rechazo de una solicitud pendiente con motivo (POST /api/orders/{id}/reject). Se monta solo
// mientras hay un pedido por rechazar (usa key={order.id} para empezar limpio con cada pedido).
export default function RejectOrderDialog({ order, onCancel, onConfirm }: RejectOrderDialogProps) {
  const products = productsOf(order);
  const [reason, setReason] = useState<RejectReason | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const canConfirm = reason === "kitchen_load" || (reason === "out_of_stock" && selected.size > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onCancel}>
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="reject-dialog-title"
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-full w-full max-w-lg flex-col gap-4 overflow-auto rounded-2xl bg-white p-6 shadow-xl"
      >
        <div>
          <h2 id="reject-dialog-title" className="text-lg font-bold text-gray-900">
            ¿Rechazar pedido #{order.orderNumber}?
          </h2>
          <p className="mt-1 text-sm text-gray-500">Elige el motivo. El cliente recibirá un aviso por WhatsApp.</p>
        </div>

        <div role="radiogroup" aria-label="Motivo del rechazo" className="flex flex-col gap-3">
          <OptionButton
            selected={reason === "kitchen_load"}
            title="Mucha carga en cocina"
            description="Pasa a la siguiente estación. Si ninguna puede, se rechaza y el cliente recibe un aviso para intentar más tarde."
            onClick={() => setReason("kitchen_load")}
          />
          <OptionButton
            selected={reason === "out_of_stock"}
            disabled={products.length === 0}
            title="Producto agotado"
            description={
              products.length === 0
                ? "No disponible: este pedido no trae los productos del menú."
                : "Rechazo definitivo. Los productos que marques se desactivan del menú por hoy y el cliente recibe sus nombres."
            }
            onClick={() => setReason("out_of_stock")}
          />
        </div>

        {reason === "out_of_stock" && (
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-1 text-sm font-semibold text-gray-900">¿Qué productos se agotaron?</legend>
            {products.map((product) => {
              const checked = selected.has(product.menuItemId);
              return (
                <label
                  key={product.menuItemId}
                  className={`flex cursor-pointer flex-row items-center gap-3 rounded-xl px-4 py-3 ring-1 transition ${
                    checked ? "bg-[var(--status-error-bg)] ring-kds-late" : "bg-white ring-gray-200"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(product.menuItemId)}
                    className="h-5 w-5 flex-shrink-0 accent-red-600"
                  />
                  <span className="text-lg font-semibold text-gray-900">
                    x{product.quantity} {product.name}
                  </span>
                </label>
              );
            })}
          </fieldset>
        )}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full px-5 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-100"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={!canConfirm}
            onClick={() => reason && onConfirm(reason, reason === "out_of_stock" ? [...selected] : [])}
            className="rounded-full bg-kds-late px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Rechazar pedido
          </button>
        </div>
      </div>
    </div>
  );
}
