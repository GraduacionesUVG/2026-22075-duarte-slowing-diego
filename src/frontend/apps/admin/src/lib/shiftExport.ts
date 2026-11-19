import type { ShiftListItem, ShiftTicket } from "@repo/api-client";
import { money } from "./format";
import { sumTickets, ticketCustomer, ticketNumber } from "./shiftTickets";

type Cell = string | number;

function csvCell(value: Cell): string {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

// Descarga un CSV.
function saveCsv(filename: string, header: string[], rows: Cell[][]) {
  const text = [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
  const blob = new Blob(["﻿" + text], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

// Una fila por turno.
export function exportShiftsCsv(date: string, turnos: ShiftListItem[]) {
  const header = [
    "Fecha",
    "Estación",
    "Turno",
    "Inicio",
    "Fin",
    "Duración (min)",
    "Tiempo activo (min)",
    "Pausas",
    "Tiempo en pausa (min)",
    "Tickets",
    "Total dinero",
  ];
  const rows = turnos.map(({ shift, kpis }) => [
    date,
    shift.kds_username,
    shift.shift_no,
    shift.hora_inicio,
    shift.hora_fin ?? "En curso",
    Math.round(shift.duracion_min),
    Math.round(shift.tiempo_activo_min),
    shift.pausas.cantidad,
    Math.round(shift.pausas.tiempo_total_min),
    kpis.total_tickets,
    kpis.total_dinero.toFixed(2),
  ]);
  saveCsv(`turnos-${date}.csv`, header, rows);
}

type OrdersTable = { header: string[]; rows: string[][]; total: number };

// El detalle para facturar
function ordersTable(
  date: string,
  tickets: ShiftTicket[],
  customers: Record<string, string>,
  fallbackTurno = "Sin turno",
): OrdersTable {
  const header = ["Fecha", "Hora", "Número", "Cliente", "Productos", "Total", "Estación", "Turno", "Resultado"];
  const ordered = [...tickets].sort(
    (a, b) =>
      a.kds_username.localeCompare(b.kds_username) ||
      (a.turno?.shift_no ?? 0) - (b.turno?.shift_no ?? 0) ||
      a.created_at.localeCompare(b.created_at),
  );
  const rows = ordered.map((t) => [
    date,
    t.hora,
    ticketNumber(t),
    ticketCustomer(t, customers) ?? "",
    t.items,
    t.total_amount.toFixed(2),
    t.kds_username,
    t.turno ? t.turno.label : fallbackTurno,
    t.resultado_label,
  ]);
  return { header, rows, total: sumTickets(tickets) };
}

// Fila final del CSV con el total de los pedidos exportados.
const totalRow = (count: number, total: number): string[] => [
  "",
  "",
  "",
  "",
  `TOTAL (${count} pedidos)`,
  total.toFixed(2),
  "",
  "",
  "",
];

export function exportOrdersCsv(
  date: string,
  tickets: ShiftTicket[],
  customers: Record<string, string>,
  opts: { filename?: string; fallbackTurno?: string } = {},
) {
  const { header, rows, total } = ordersTable(date, tickets, customers, opts.fallbackTurno);
  saveCsv(opts.filename ?? `pedidos-${date}.csv`, header, [...rows, totalRow(tickets.length, total)]);
}

const escapeHtml = (value: Cell) =>
  String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const SHEET_STYLES = `
  body{font-family:system-ui,sans-serif;color:#111;margin:24px;font-size:12px}
  h1{font-size:18px;margin:0 0 4px}
  p{margin:0 0 12px;color:#555}
  table{width:100%;border-collapse:collapse}
  th,td{text-align:left;padding:6px 8px;border-bottom:1px solid #ddd;vertical-align:top}
  th{background:#f3f4f6}
  tfoot td{font-weight:700;border-top:2px solid #111;border-bottom:0}
  @media print{body{margin:8mm}}`;

// Abre una hoja imprimible con los pedidos 
export function printOrders(opts: {
  date: string;
  subtitle: string;
  tickets: ShiftTicket[];
  customers: Record<string, string>;
}): boolean {
  const { header, rows, total } = ordersTable(opts.date, opts.tickets, opts.customers);
  // La columna "Fecha" va en el encabezado de la hoja, no en cada fila.
  const columns = header.slice(1);
  const cells = (row: Cell[], tag: "td" | "th") => row.map((c) => `<${tag}>${escapeHtml(c)}</${tag}>`).join("");

  const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Pedidos ${escapeHtml(opts.date)}</title>
<style>${SHEET_STYLES}</style></head><body>
<h1>Pedidos del ${escapeHtml(opts.date)}</h1>
<p>${escapeHtml(opts.subtitle)} · ${opts.tickets.length} pedidos</p>
<table><thead><tr>${cells(columns, "th")}</tr></thead>
<tbody>${rows.map((r) => `<tr>${cells(r.slice(1), "td")}</tr>`).join("")}</tbody>
<tfoot><tr><td colspan="${columns.length}">Total: ${escapeHtml(money(total))}</td></tr></tfoot></table>
</body></html>`;

  const win = window.open("", "_blank");
  if (!win) return false;
  win.document.write(html);
  win.document.close();
  win.focus();
  win.print();
  return true;
}
