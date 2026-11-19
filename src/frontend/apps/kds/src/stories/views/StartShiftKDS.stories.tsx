import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import StartShiftKDS from "../../views/StartShiftKDS";

const meta = {
  title: "KDS/Pantallas/Iniciar turno",
  component: StartShiftKDS,
  parameters: { layout: "fullscreen" },
  args: {
    localName: "Cafetería Central",
    username: "cocina1",
    nextShiftNo: 2,
    enCurso: 0,
    staleShift: null,
    closedNotice: null,
    starting: false,
    ending: false,
    error: null,
    onStart: fn(),
    onEndStale: fn(),
    onViewSummary: fn(),
    onDismissNotice: fn(),
    onLogout: fn(),
  },
} satisfies Meta<typeof StartShiftKDS>;

export default meta;
type Story = StoryObj<typeof meta>;

const shift = {
  id: "s1",
  restaurant_id: "r1",
  kds_user_id: "u1",
  kds_username: "cocina1",
  local_date: "2026-10-14",
  shift_no: 1,
  label: "Turno 1 · 14/10/2026",
  status: "open" as const,
  started_at: "2026-10-14T13:00:00-06:00",
  ended_at: null,
  hora_inicio: "13:00",
  hora_fin: null,
  duracion_min: 0,
  tiempo_activo_min: 0,
  pausas: { cantidad: 0, tiempo_total_min: 0, en_pausa: false, detalle: [] },
  stale: true,
  end_adjusted: false,
  started_by: null,
  ended_by: null,
};

export const Default: Story = {};
export const Starting: Story = { args: { starting: true } };
export const WithOrdersInProgress: Story = { args: { enCurso: 3 } };
export const PreviousShiftClosed: Story = {
  args: { closedNotice: { ...shift, status: "closed", hora_fin: "19:30", stale: false } },
};
export const StaleShift: Story = { args: { staleShift: shift } };
export const Conflict: Story = { args: { error: "No hay un turno abierto. Inicia un turno primero." } };
