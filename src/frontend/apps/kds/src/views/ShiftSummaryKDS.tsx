import { useState } from "react";
import type { ShiftKpis, ShiftSummary } from "@repo/api-client";
import QDot from "../components/QDot";
import {
  RESULT_CHIP,
  formatMinutes,
  formatMoney,
  formatPct,
  matchesFilter,
  ticketNumber,
  type TicketFilter,
} from "../lib/shiftFormat";

type ShiftSummaryKDSProps = {
  summary: ShiftSummary;
  onDone: () => void;
};

const FILTERS: { key: TicketFilter; label: string }[] = [
  { key: "all", label: "Todas" },
  { key: "accepted", label: "Aceptadas" },
  { key: "rejected", label: "Rechazadas" },
];

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="kds-ring-card flex min-w-0 flex-col gap-1 rounded-[20px] bg-[var(--kds-card-bg)] p-4">
      <span className="text-xs font-semibold text-gray-500">{label}</span>
      <span className="truncate text-2xl font-bold text-gray-900">{value}</span>
      {hint && <span className="text-xs text-gray-500">{hint}</span>}
    </div>
  );
}

function KpiGrid({ kpis, horaInicio, horaFin }: { kpis: ShiftKpis; horaInicio: string; horaFin: string | null }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Total tickets" value={String(kpis.total_tickets)} />
        <Stat label="Total dinero" value={formatMoney(kpis.total_dinero)} hint={`${kpis.ordenes_pagadas} órdenes pagadas`} />
        <Stat label="Hora inicio" value={horaInicio} />
        <Stat label="Hora final" value={horaFin ?? "—"} />
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="% rechazadas" value={formatPct(kpis.pct_rechazadas)} hint={`${kpis.rechazadas} tickets`} />
        <Stat label="% por carga" value={formatPct(kpis.pct_rechazadas_carga)} hint={`${kpis.rechazadas_carga} tickets`} />
        <Stat
          label="% por falta de stock"
          value={formatPct(kpis.pct_rechazadas_stock)}
          hint={`${kpis.rechazadas_stock} tickets`}
        />
        <Stat
          label="% sin respuesta"
          value={formatPct(kpis.pct_rechazadas_sin_respuesta)}
          hint={`${kpis.rechazadas_sin_respuesta} tickets`}
        />
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Stat label="Aceptadas" value={String(kpis.aceptadas)} />
        <Stat label="Entregadas" value={String(kpis.entregadas)} />
        <Stat label="No pagadas" value={String(kpis.no_pagadas)} />
        <Stat label="Ticket promedio" value={formatMoney(kpis.ticket_promedio)} />
        <Stat label="Prep. promedio" value={formatMinutes(kpis.tiempo_preparacion_promedio_min)} />
      </div>
    </div>
  );
}

// Resumen del turno: se ve al finalizarlo y al abrir un turno cerrado desde un aviso.
export default function ShiftSummaryKDS({ summary, onDone }: ShiftSummaryKDSProps) {
  const { shift, kpis, tickets, pendientes } = summary;
  const [filter, setFilter] = useState<TicketFilter>("all");
  const [showPauses, setShowPauses] = useState(false);
  const visible = tickets.filter((t) => matchesFilter(t, filter));

  return (
    <div className="flex h-screen w-screen flex-col bg-[var(--kds-app-bg)]">
      <header className="kds-ring-border flex flex-shrink-0 flex-row items-center gap-4 bg-white px-4 py-3 lg:px-8">
        <QDot className="h-9 w-9" />
        <div className="flex min-w-0 flex-grow flex-col">
          <span className="truncate text-lg font-semibold text-gray-900">{shift.label}</span>
          <span className="text-xs text-gray-500">
            {shift.hora_inicio} – {shift.hora_fin ?? "en curso"} · {formatMinutes(shift.duracion_min)}
            {shift.end_adjusted && " · Hora de cierre ajustada al cierre del restaurante"}
          </span>
        </div>
        <button
          type="button"
          onClick={onDone}
          className="h-12 rounded-[20px] bg-kds-brand px-8 text-lg font-semibold text-white"
        >
          LISTO
        </button>
      </header>

      <div className="kds-scroll flex min-h-0 flex-grow flex-col gap-5 overflow-auto p-4 lg:gap-6 lg:p-8">
        {pendientes && pendientes.en_curso > 0 && (
          <p className="rounded-[20px] bg-[var(--status-warning-bg)] px-4 py-3 text-sm font-semibold text-[var(--status-warning-text)]">
            Quedan {pendientes.en_curso} {pendientes.en_curso === 1 ? "orden" : "órdenes"} en curso: siguen visibles
            para terminarlas y entregarlas.
          </p>
        )}

        <KpiGrid kpis={kpis} horaInicio={shift.hora_inicio} horaFin={shift.hora_fin} />

        <section className="kds-ring-card flex flex-col gap-3 rounded-[20px] bg-[var(--kds-card-bg)] p-4">
          <button
            type="button"
            aria-expanded={showPauses}
            onClick={() => setShowPauses((open) => !open)}
            className="flex flex-row flex-wrap items-center gap-x-8 gap-y-2 text-left"
          >
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-gray-500">Pausas</span>
              <span className="text-xl font-bold text-gray-900">{shift.pausas.cantidad}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-gray-500">Tiempo en pausa</span>
              <span className="text-xl font-bold text-gray-900">{formatMinutes(shift.pausas.tiempo_total_min)}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-gray-500">Tiempo activo</span>
              <span className="text-xl font-bold text-gray-900">{formatMinutes(shift.tiempo_activo_min)}</span>
            </div>
            <span className="ml-auto text-sm font-semibold text-gray-500">
              {shift.pausas.cantidad === 0 ? "" : showPauses ? "Ocultar detalle" : "Ver detalle"}
            </span>
          </button>
          {showPauses && shift.pausas.detalle.length > 0 && (
            <ul className="flex flex-col divide-y divide-gray-200 border-t border-gray-200 text-sm">
              {shift.pausas.detalle.map((p) => (
                <li key={p.started_at} className="flex flex-row flex-wrap items-center gap-x-4 gap-y-1 py-2">
                  <span className="font-semibold text-gray-900">
                    {p.hora_inicio} – {p.hora_fin ?? "en pausa"}
                  </span>
                  <span className="text-gray-500">{formatMinutes(p.duracion_min)}</span>
                  <span className="ml-auto text-gray-500">
                    {p.started_by?.username ?? "Sistema"}
                    {p.started_by?.type === "admin" ? " (admin)" : ""}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="flex flex-col gap-3">
          <div className="flex flex-row flex-wrap items-center gap-3">
            <h2 className="flex-grow text-lg font-semibold text-gray-900">TICKETS · {visible.length}</h2>
            <div role="group" aria-label="Filtrar tickets" className="flex flex-row gap-1 rounded-full bg-white p-1">
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  aria-pressed={filter === f.key}
                  onClick={() => setFilter(f.key)}
                  className={`h-10 rounded-full px-4 text-sm font-semibold ${
                    filter === f.key ? "bg-kds-sidebar text-white" : "text-gray-500"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {visible.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500">No hay tickets en este turno.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {visible.map((t) => (
                <li
                  key={t.order_id}
                  className="kds-ring-card flex flex-row flex-wrap items-center gap-x-4 gap-y-1 rounded-[20px] bg-[var(--kds-card-bg)] px-4 py-3"
                >
                  <span className="w-14 text-sm font-semibold text-gray-500">{t.hora}</span>
                  <span className="w-36 text-sm font-semibold text-gray-900">{ticketNumber(t)}</span>
                  <span className="min-w-0 flex-1 text-sm text-gray-700">{t.items}</span>
                  <span className="w-24 text-right text-sm font-semibold text-gray-900">
                    {formatMoney(t.total_amount)}
                  </span>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${RESULT_CHIP[t.resultado]}`}>
                    {t.resultado_label}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
