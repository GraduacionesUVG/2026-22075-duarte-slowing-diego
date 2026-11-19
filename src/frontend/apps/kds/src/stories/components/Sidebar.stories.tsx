import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import Sidebar from "../../components/Sidebar";

const meta = {
  title: "KDS/Sidebar",
  component: Sidebar,
  parameters: { layout: "fullscreen" },
  args: { isPaused: false, waitingCount: 0, waitingOpen: false, onToggleWaiting: fn(), onTogglePause: fn(), onRefresh: fn(), onPowerOff: fn() },
  decorators: [(Story) => <div className="flex h-[480px]"><Story /></div>],
} satisfies Meta<typeof Sidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const SoundOn: Story = { name: "Con botón de sonido (activado)", args: { sound: { on: true, onToggle: fn() } } };
export const SoundMuted: Story = { name: "Con botón de sonido (silenciado)", args: { sound: { on: false, onToggle: fn() } } };
export const Paused: Story = { args: { isPaused: true } };
export const WithWaitingOrders: Story = { name: "Con pedidos en espera", args: { waitingCount: 3 } };
export const WaitingPopupOpen: Story = { name: "Popup En espera abierto", args: { waitingCount: 3, waitingOpen: true } };
