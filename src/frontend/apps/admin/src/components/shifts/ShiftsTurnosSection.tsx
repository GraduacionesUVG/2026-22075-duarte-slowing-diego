import type { AdminShiftsDay, ShiftSummary } from "@repo/api-client";
import Pagination from "../Pagination";
import { usePaged } from "../../hooks/usePaged";
import { minutes, money, pct } from "../../lib/format";
import { exportShiftsCsv } from "../../lib/shiftExport";
import ShiftDetail from "./ShiftDetail";
import { ShiftDetailSkeleton } from "./ShiftsSkeletons";
import { PAGE_SIZES } from "./ShiftTicketsTable";
import { cardClass, secondaryBtnClass } from "./styles";

const HEADER = [
  "Estación",
  "Turno",
  "Horario",
  "Tiempo activo",
  "Tickets",
  "Dinero",
  "% rechazadas",
  "Pausas",
  "En pausa",
];

type ShiftsTurnosSectionProps = {
  day: AdminShiftsDay;
  customers: Record<string, string>;
  selectedId: string | null;
  onSelect: (shiftId: string | null) => void;
  detail: ShiftSummary | null;
  detailLoading: boolean;
  detailError: string | null;
};

// Sección "Turnos": tabla paginada de turnos del día y el detalle del turno elegido.
export default function ShiftsTurnosSection({
  day,
  customers,
  selectedId,
  onSelect,
  detail,
  detailLoading,
  detailError,
}: ShiftsTurnosSectionProps) {
  const paged = usePaged(day.turnos);

  return (
    <>
      <div className={cardClass + " flex flex-col gap-4"}>
        <div className="flex flex-row flex-wrap items-center gap-3">
          <span className="flex-grow text-sm font-semibold text-gray-900">Turnos del día · {day.turnos.length}</span>
          <button
            type="button"
            onClick={() => exportShiftsCsv(day.date, day.turnos)}
            disabled={day.turnos.length === 0}
            className={secondaryBtnClass}
          >
            Descargar turnos (CSV)
          </button>
        </div>

        {day.turnos.length === 0 ? (
          <p className="py-6 text-center text-xs text-gray-500">No hay turnos en esta fecha.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500">
                  {HEADER.map((h) => (
                    <th key={h} className="py-2 pr-4 font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paged.slice.map(({ shift, kpis }) => {
                  const selected = selectedId === shift.id;
                  return (
                    <tr
                      key={shift.id}
                      onClick={() => onSelect(selected ? null : shift.id)}
                      aria-selected={selected}
                      className={`cursor-pointer border-b border-gray-100 text-gray-900 last:border-0 ${
                        selected ? "bg-orange-50" : "hover:bg-gray-50"
                      }`}
                    >
                      <td className="py-3 pr-4 font-medium">{shift.kds_username}</td>
                      <td className="py-3 pr-4">{shift.label}</td>
                      <td className="whitespace-nowrap py-3 pr-4">
                        {shift.hora_inicio} – {shift.hora_fin ?? "En curso"}
                      </td>
                      <td className="py-3 pr-4">{minutes(shift.tiempo_activo_min)}</td>
                      <td className="py-3 pr-4">{kpis.total_tickets}</td>
                      <td className="py-3 pr-4">{money(kpis.total_dinero)}</td>
                      <td className="py-3 pr-4">{pct(kpis.pct_rechazadas)}</td>
                      <td className="py-3 pr-4">{shift.pausas.cantidad}</td>
                      <td className="py-3 pr-4">{minutes(shift.pausas.tiempo_total_min)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {day.turnos.length > 0 && (
          <Pagination
            page={paged.page}
            pageSize={paged.pageSize}
            total={paged.total}
            pageSizeOptions={PAGE_SIZES}
            onPageChange={paged.setPage}
            onPageSizeChange={paged.setPageSize}
            noun="turnos"
          />
        )}
      </div>

      {selectedId &&
        (detailLoading ? (
          <div className={cardClass}>
            <ShiftDetailSkeleton />
          </div>
        ) : detailError ? (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-xs font-medium text-red-700">{detailError}</p>
        ) : (
          detail && <ShiftDetail summary={detail} customers={customers} onClose={() => onSelect(null)} />
        ))}
    </>
  );
}
