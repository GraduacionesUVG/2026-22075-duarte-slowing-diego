import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import ShiftSummaryKDS from "../../views/ShiftSummaryKDS";

const meta = {
  title: "KDS/Pantallas/Resumen de turno",
  component: ShiftSummaryKDS,
  parameters: { layout: "fullscreen" },
  args: { onDone: fn() },
} satisfies Meta<typeof ShiftSummaryKDS>;

export default meta;
type Story = StoryObj<typeof meta>;

const actor = { type: "kds" as const, id: "u1", username: "cocina1" };

const ticket = (n: number, resultado: "entregada" | "rechazada_carga" | "rechazada_stock", total: number) => ({
  order_id: `t${n}`,
  request_number: 1000 + n,
  order_number: resultado === "entregada" ? 2000 + n : null,
  created_at: "2026-10-14T13:20:00-06:00",
  hora: `13:${String(10 + n * 7).padStart(2, "0")}`,
  items: n % 2 ? "2x Hamburguesa + Café" : "Burrito de pollo",
  total_amount: total,
  pipeline_status: resultado === "entregada" ? "delivered" : "rejected",
  payment_status: resultado === "entregada" ? "paid" : "pending",
  status_label: resultado === "entregada" ? "Entregado" : "Rechazado",
  resultado,
  resultado_label: resultado === "entregada" ? "Entregada" : resultado === "rechazada_carga" ? "Rechazada por carga" : "Rechazada por falta de stock",
  aceptada: resultado === "entregada",
  reject_reason: null,
  out_of_stock_items: [],
  kds_user_id: "u1",
  kds_username: "cocina1",
  turno: null,
});

export const Closed: Story = {
  args: {
    summary: {
      shift: {
        id: "s1",
        restaurant_id: "r1",
        kds_user_id: "u1",
        kds_username: "cocina1",
        local_date: "2026-10-14",
        shift_no: 2,
        label: "Turno 2 · 14/10/2026",
        status: "closed",
        started_at: "2026-10-14T13:00:00-06:00",
        ended_at: "2026-10-14T19:30:00-06:00",
        hora_inicio: "13:00",
        hora_fin: "19:30",
        duracion_min: 390,
        tiempo_activo_min: 365,
        pausas: {
          cantidad: 2,
          tiempo_total_min: 25,
          en_pausa: false,
          detalle: [
            { started_at: "2026-10-14T15:10:00-06:00", ended_at: "2026-10-14T15:25:00-06:00", hora_inicio: "15:10", hora_fin: "15:25", duracion_min: 15, started_by: actor, ended_by: actor },
            { started_at: "2026-10-14T17:40:00-06:00", ended_at: "2026-10-14T17:50:00-06:00", hora_inicio: "17:40", hora_fin: "17:50", duracion_min: 10, started_by: { type: "admin", id: "a1", username: "Admin GH" }, ended_by: actor },
          ],
        },
        stale: false,
        end_adjusted: false,
        started_by: actor,
        ended_by: actor,
      },
      kpis: {
        total_tickets: 5,
        aceptadas: 3,
        rechazadas: 2,
        rechazadas_carga: 1,
        rechazadas_stock: 1,
        rechazadas_sin_respuesta: 0,
        rechazadas_sin_motivo: 0,
        pendientes: 0,
        esperando_pago: 0,
        en_curso: 0,
        entregadas: 3,
        no_pagadas: 0,
        canceladas: 0,
        ordenes_pagadas: 3,
        total_dinero: 135,
        ticket_promedio: 45,
        pct_aceptadas: 60,
        pct_rechazadas: 40,
        pct_rechazadas_carga: 20,
        pct_rechazadas_stock: 20,
        pct_rechazadas_sin_respuesta: 0,
        tiempo_preparacion_promedio_min: 11.4,
      },
      tickets: [
        ticket(0, "entregada", 60),
        ticket(1, "rechazada_carga", 0),
        ticket(2, "entregada", 45),
        ticket(3, "rechazada_stock", 0),
        ticket(4, "entregada", 30),
      ],
      pendientes: { por_aceptar: 0, en_curso: 1 },
    },
  },
};
