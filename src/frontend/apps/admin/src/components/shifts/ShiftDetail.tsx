import type { ShiftSummary } from "@repo/api-client";
import { minutes } from "../../lib/format";
import { exportOrdersCsv } from "../../lib/shiftExport";
import ShiftKpiRow from "./ShiftKpiRow";
import ShiftTicketsTable from "./ShiftTicketsTable";
import { cardClass, secondaryBtnClass } from "./styles";

type ShiftDetailProps = {
  summary: ShiftSummary;
  customers: Record<string, string>;
  onClose: () => void;
};

// Resumen completo de un turno: KPIs, pausas (con quién las hizo) y sus tickets.
export default function ShiftDetail({ summary, customers, onClose }: ShiftDetailProps) {
  const { shift, kpis, tickets } = summary;

  const downloadShiftOrders = () =>
    exportOrdersCsv(shift.local_date, tickets, customers, {
      filename: `pedidos-${shift.local_date}-${shift.kds_username}-turno-${shift.shift_no}.csv`,
      fallbackTurno: shift.label,
    });

  return (
    <div className={cardClass + " flex flex-col gap-5"}>
      <div className="flex flex-row items-start gap-3">
        <div className="flex flex-grow flex-col gap-1">
          <span className="text-sm font-semibold text-gray-900">
            {shift.kds_username} · {shift.label}
          </span>
          <span className="text-xs text-gray-500">
            {shift.hora_inicio} – {shift.hora_fin ?? "En curso"} · {minutes(shift.duracion_min)} · activo{" "}
            {minutes(shift.tiempo_activo_min)}
            {shift.end_adjusted && " · Hora de cierre ajustada al cierre del restaurante"}
          </span>
        </div>
        <button
          type="button"
          onClick={downloadShiftOrders}
          disabled={tickets.length === 0}
          className={secondaryBtnClass}
        >
          Descargar pedidos del turno
        </button>
        <button type="button" onClick={onClose} className={secondaryBtnClass}>
          Cerrar detalle
        </button>
      </div>

      <ShiftKpiRow kpis={kpis} />

      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold text-gray-900">
          Pausas · {shift.pausas.cantidad} ({minutes(shift.pausas.tiempo_total_min)})
        </span>
        {shift.pausas.detalle.length === 0 ? (
          <p className="text-xs text-gray-500">Sin pausas en este turno.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-gray-100 text-xs">
            {shift.pausas.detalle.map((p) => (
              <li key={p.started_at} className="flex flex-row flex-wrap gap-x-4 gap-y-1 py-2 text-gray-900">
                <span className="font-medium">
                  {p.hora_inicio} – {p.hora_fin ?? "en pausa"}
                </span>
                <span className="text-gray-500">{minutes(p.duracion_min)}</span>
                <span className="ml-auto text-gray-500">
                  Pausó: {p.started_by?.username ?? "Sistema"}
                  {p.started_by?.type === "admin" ? " (admin)" : ""}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <span className="text-xs font-semibold text-gray-900">Tickets del turno · {tickets.length}</span>
        {tickets.length === 0 ? (
          <p className="text-xs text-gray-500">Este turno no tuvo tickets.</p>
        ) : (
          <ShiftTicketsTable tickets={tickets} customers={customers} showShift={false} />
        )}
      </div>
    </div>
  );
}
