import type { ShiftKpis } from "@repo/api-client";
import { money, pct } from "../../lib/format";

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="flex w-52 flex-shrink-0 flex-col gap-1.5 rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-200">
      <span className="text-xs font-semibold text-gray-500">{label}</span>
      <span className="text-lg font-bold text-gray-900">{value}</span>
      {hint && <span className="text-xs text-gray-500">{hint}</span>}
    </div>
  );
}

// KPIs de un turno o de todo el día.
export default function ShiftKpiRow({ kpis }: { kpis: ShiftKpis }) {
  return (
    <div className="flex flex-row flex-wrap gap-4">
      <Stat label="Total tickets" value={String(kpis.total_tickets)} hint={`${kpis.aceptadas} aceptadas`} />
      <Stat label="Total dinero" value={money(kpis.total_dinero)} hint={`${kpis.ordenes_pagadas} órdenes pagadas`} />
      <Stat label="% rechazadas" value={pct(kpis.pct_rechazadas)} hint={`${kpis.rechazadas} tickets`} />
      <Stat label="% por carga" value={pct(kpis.pct_rechazadas_carga)} hint={`${kpis.rechazadas_carga} tickets`} />
      <Stat
        label="% por falta de stock"
        value={pct(kpis.pct_rechazadas_stock)}
        hint={`${kpis.rechazadas_stock} tickets`}
      />
      <Stat label="Ticket promedio" value={money(kpis.ticket_promedio)} />
    </div>
  );
}
