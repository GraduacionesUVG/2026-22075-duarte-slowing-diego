import { useState } from "react";
import { Spinner } from "../components/Skeleton";
import ShiftKpiRow from "../components/shifts/ShiftKpiRow";
import ShiftsOrdersSection from "../components/shifts/ShiftsOrdersSection";
import { ShiftsPageSkeleton } from "../components/shifts/ShiftsSkeletons";
import ShiftsTurnosSection from "../components/shifts/ShiftsTurnosSection";
import { fieldLabelClass, inputClass, secondaryBtnClass } from "../components/shifts/styles";
import { useShiftsSummary } from "../hooks/useShiftsSummary";
import { useTicketFilters } from "../hooks/useTicketFilters";

const SECTIONS = ["Turnos", "Pedidos"] as const;
type Section = (typeof SECTIONS)[number];

// Resumen de turnos del día (base para facturar a las estaciones): fecha y estación arriba,
// KPIs del día y dos secciones: Turnos (tabla y detalle) y Pedidos (filtros, descarga e impresión).
export default function ShiftsSummary() {
  const s = useShiftsSummary();
  const [section, setSection] = useState<Section>("Turnos");
  const { day } = s;
  // Fecha o estación nuevas: los filtros de la sección Pedidos vuelven a "Todos".
  const filters = useTicketFilters(day, `${s.date}|${s.stationId}`);
  const stationName = s.stations.find((u) => u.kds_user_id === s.stationId)?.username;

  return (
    <div className="flex max-w-[1200px] flex-col gap-6">
      <div className="flex flex-row flex-wrap items-center gap-3">
        <label className={fieldLabelClass}>
          Fecha
          <input
            type="date"
            value={s.date}
            onChange={(e) => e.target.value && s.setDate(e.target.value)}
            className={inputClass}
          />
        </label>
        <label className={fieldLabelClass}>
          Estación
          <select value={s.stationId} onChange={(e) => s.setStationId(e.target.value)} className={inputClass}>
            <option value="">Todas</option>
            {s.stations.map((u) => (
              <option key={u.kds_user_id} value={u.kds_user_id}>
                {u.username}
              </option>
            ))}
          </select>
        </label>
        <div className="flex-grow" />
        <button
          type="button"
          onClick={() => void s.reload()}
          disabled={s.loading}
          aria-busy={s.loading}
          className={secondaryBtnClass}
        >
          {s.loading && <Spinner />}
          {s.loading ? "Actualizando…" : "Actualizar"}
        </button>
      </div>

      {s.error && <p className="rounded-lg bg-red-50 px-4 py-3 text-xs font-medium text-red-700">{s.error}</p>}

      {s.loading && day === null ? (
        <ShiftsPageSkeleton />
      ) : (
        day && (
          <div className={`flex flex-col gap-6 transition-opacity ${s.loading ? "opacity-60" : ""}`}>
            {(day.kpis.sin_turno ?? 0) > 0 && (
              <p className="rounded-lg bg-amber-50 px-4 py-3 text-xs font-medium text-amber-800">
                {day.kpis.sin_turno} ticket{day.kpis.sin_turno === 1 ? "" : "s"} llegaron fuera de un turno.
              </p>
            )}

            <ShiftKpiRow kpis={day.kpis} />

            <div role="tablist" className="flex flex-row gap-2 border-b border-gray-200">
              {SECTIONS.map((name) => (
                <button
                  key={name}
                  type="button"
                  role="tab"
                  aria-selected={section === name}
                  onClick={() => setSection(name)}
                  className={`-mb-px whitespace-nowrap rounded-t-lg px-4 py-2.5 text-xs font-semibold ${
                    section === name
                      ? "border-b-2 border-brand-primary text-brand-primary"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {name === "Turnos" ? `Turnos · ${day.turnos.length}` : `Pedidos · ${day.tickets.length}`}
                </button>
              ))}
            </div>

            {section === "Turnos" ? (
              <ShiftsTurnosSection
                day={day}
                customers={s.customers}
                selectedId={s.selectedId}
                onSelect={s.selectShift}
                detail={s.detail}
                detailLoading={s.detailLoading}
                detailError={s.detailError}
              />
            ) : (
              <ShiftsOrdersSection day={day} customers={s.customers} stationName={stationName} filters={filters} />
            )}
          </div>
        )
      )}
    </div>
  );
}
