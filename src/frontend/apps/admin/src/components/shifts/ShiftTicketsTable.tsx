import type { ShiftTicket } from "@repo/api-client";
import Pagination from "../Pagination";
import { usePaged } from "../../hooks/usePaged";
import { money } from "../../lib/format";
import { RESULT_CHIP, ticketCustomer, ticketNumber } from "../../lib/shiftTickets";

export const PAGE_SIZES = [10, 25, 50];

type ShiftTicketsTableProps = {
  tickets: ShiftTicket[];
  customers: Record<string, string>;
  // Columna "Turno": solo tiene sentido cuando la tabla mezcla varios turnos.
  showShift: boolean;
};

// Tabla paginada de pedidos/solicitudes.
export default function ShiftTicketsTable({ tickets, customers, showShift }: ShiftTicketsTableProps) {
  const paged = usePaged(tickets);
  const header = [
    "Hora",
    "Número",
    "Cliente",
    "Productos",
    "Total",
    "Estación",
    ...(showShift ? ["Turno"] : []),
    "Resultado",
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-gray-200 text-gray-500">
              {header.map((h) => (
                <th key={h} className="py-2 pr-4 font-semibold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.slice.map((t) => (
              <tr key={t.order_id} className="border-b border-gray-100 align-top text-gray-900 last:border-0">
                <td className="py-3 pr-4 text-gray-500">{t.hora}</td>
                <td className="py-3 pr-4 font-medium">{ticketNumber(t)}</td>
                <td className="py-3 pr-4">{ticketCustomer(t, customers) ?? "—"}</td>
                <td className="py-3 pr-4">{t.items}</td>
                <td className="py-3 pr-4">{money(t.total_amount)}</td>
                <td className="py-3 pr-4">{t.kds_username}</td>
                {showShift && <td className="py-3 pr-4">{t.turno ? t.turno.label : "Sin turno"}</td>}
                <td className="py-3 pr-4">
                  <span
                    className={`whitespace-nowrap rounded-full px-2.5 py-1 font-semibold ${RESULT_CHIP[t.resultado]}`}
                  >
                    {t.resultado_label}
                  </span>
                  {t.out_of_stock_items.length > 0 && (
                    <span className="mt-1 block text-gray-500">
                      Sin stock: {t.out_of_stock_items.map((i) => i.name).join(", ")}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination
        page={paged.page}
        pageSize={paged.pageSize}
        total={paged.total}
        pageSizeOptions={PAGE_SIZES}
        onPageChange={paged.setPage}
        onPageSizeChange={paged.setPageSize}
        noun="tickets"
      />
    </div>
  );
}
