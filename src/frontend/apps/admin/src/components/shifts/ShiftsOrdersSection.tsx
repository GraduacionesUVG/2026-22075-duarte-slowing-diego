import { useState } from "react";
import type { AdminShiftsDay } from "@repo/api-client";
import type { useTicketFilters } from "../../hooks/useTicketFilters";
import { money } from "../../lib/format";
import { exportOrdersCsv, printOrders } from "../../lib/shiftExport";
import ShiftTicketsTable from "./ShiftTicketsTable";
import { cardClass, fieldLabelClass, inputClass, secondaryBtnClass } from "./styles";

type ShiftsOrdersSectionProps = {
  day: AdminShiftsDay;
  customers: Record<string, string>;
  // Estación elegida en la barra superior ("Todas las estaciones" si no hay).
  stationName: string | undefined;
  filters: ReturnType<typeof useTicketFilters>;
};

// Sección "Pedidos": filtros por turno y resultado, total, descarga CSV e impresión.
export default function ShiftsOrdersSection({ day, customers, stationName, filters }: ShiftsOrdersSectionProps) {
  const { visibleTickets, resultOptions } = filters;
  const [printBlocked, setPrintBlocked] = useState(false);
  const empty = visibleTickets.length === 0;

  const handlePrint = () => {
    const { turno, resultado } = filters.activeLabels();
    const subtitle = [stationName ? `Estación ${stationName}` : "Todas las estaciones", turno, resultado]
      .filter(Boolean)
      .join(" · ");
    setPrintBlocked(!printOrders({ date: day.date, subtitle, tickets: visibleTickets, customers }));
  };

  return (
    <div className={cardClass + " flex flex-col gap-4"}>
      <div className="flex flex-row flex-wrap items-center gap-3">
        <span className="flex-grow text-sm font-semibold text-gray-900">
          Pedidos del día · {visibleTickets.length} · Total {money(filters.total)}
        </span>
        <label className={fieldLabelClass}>
          Turno
          <select
            value={filters.shiftFilter}
            onChange={(e) => filters.setShiftFilter(e.target.value)}
            className={inputClass}
          >
            <option value="">Todos</option>
            {day.turnos.map(({ shift }) => (
              <option key={shift.id} value={shift.id}>
                {shift.kds_username} · {shift.label}
              </option>
            ))}
            <option value="none">Sin turno</option>
          </select>
        </label>
        <label className={fieldLabelClass}>
          Resultado
          <select
            value={filters.resultFilter}
            onChange={(e) => filters.setResultFilter(e.target.value)}
            className={inputClass}
          >
            <option value="">Todos</option>
            <option value="entregada">Entregados</option>
            <option value="accepted">Aceptados (incluye en curso)</option>
            <option value="rejected">Rechazados</option>
            {resultOptions
              .filter(([key]) => key !== "entregada")
              .map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
          </select>
        </label>
        <button
          type="button"
          onClick={() => exportOrdersCsv(day.date, visibleTickets, customers)}
          disabled={empty}
          title="Pedidos agrupados por turno, según los filtros de turno y resultado"
          className={secondaryBtnClass}
        >
          Descargar pedidos (CSV)
        </button>
        <button type="button" onClick={handlePrint} disabled={empty} className={secondaryBtnClass}>
          Imprimir pedidos
        </button>
      </div>

      {printBlocked && (
        <p className="rounded-lg bg-amber-50 px-4 py-3 text-xs font-medium text-amber-800">
          El navegador bloqueó la ventana de impresión. Permite las ventanas emergentes para este sitio e inténtalo de
          nuevo.
        </p>
      )}

      {empty ? (
        <p className="py-6 text-center text-xs text-gray-500">Sin tickets para este filtro.</p>
      ) : (
        <ShiftTicketsTable tickets={visibleTickets} customers={customers} showShift />
      )}
    </div>
  );
}
