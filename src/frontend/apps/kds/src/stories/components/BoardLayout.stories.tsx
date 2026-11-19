import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import BoardLayout from "../../components/BoardLayout";
import { boardArgs, nav } from "../fixtures";

const meta = {
  title: "KDS/BoardLayout",
  component: BoardLayout,
  parameters: { layout: "fullscreen" },
  args: {
    ...boardArgs,
    nav: nav("delivery"),
    children: <p className="text-lg text-gray-500">Contenido del tablero</p>,
  },
} satisfies Meta<typeof BoardLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Paused: Story = { args: { isPaused: true } };
export const WithError: Story = { args: { error: "No se pudo conectar con el servidor. Reintentando…" } };
export const RestrictedViews: Story = { args: { nav: { ...nav("delivery"), allowed: ["delivery"] } } };

const shiftBar = {
  label: "Turno 2 · 14/10/2026",
  startedAtLabel: "13:00",
  pausedSince: null,
  pausedSinceLabel: null,
  pauseBusy: false,
  onEnd: fn(),
};

export const WithShift: Story = { args: { shiftBar } };
export const WithShiftPaused: Story = {
  args: {
    isPaused: true,
    shiftBar: { ...shiftBar, pausedSince: new Date(Date.now() - 4 * 60_000).toISOString(), pausedSinceLabel: "15:10" },
  },
};
export const WithShiftPauseBusy: Story = { args: { isPaused: true, shiftBar: { ...shiftBar, pauseBusy: true } } };

