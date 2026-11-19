import type { OrderItem } from "@repo/api-client";
import { CategoryIcon } from "@repo/category-icons";

type OrderItemLineProps = {
  item: OrderItem;
};

// Un producto del pedido: cantidad y nombre en negrita; debajo, los modificadores como etiquetas
// de color (para que no se pierdan entre los productos) y la nota libre del cliente en cursiva.
export default function OrderItemLine({ item }: OrderItemLineProps) {
  return (
    <li className="flex flex-col gap-1 pb-1.5">
      <span className="flex flex-row items-center gap-2 text-lg font-semibold leading-6 text-black">
        {/* Icono de la categoría, pequeño: ayuda a reconocer qué es el platillo sin ocupar espacio. */}
        {item.categoryIcon && <CategoryIcon name={item.categoryIcon} size={20} className="flex-shrink-0 text-gray-600" />}
        <span>
          x{item.quantity} {item.name}
        </span>
      </span>
      {item.modifiers && item.modifiers.length > 0 && (
        <ul className="flex flex-row flex-wrap gap-1 pl-[28px]">
          {item.modifiers.map((modifier) => (
            <li
              key={modifier}
              className="rounded-md bg-[var(--modifier-bg)] px-2 py-0.5 text-sm font-semibold leading-5 text-[var(--modifier-text)]"
            >
              {modifier}
            </li>
          ))}
        </ul>
      )}
      {item.note && <span className="pl-[28px] text-sm font-medium italic leading-5 text-gray-600">“{item.note}”</span>}
    </li>
  );
}
