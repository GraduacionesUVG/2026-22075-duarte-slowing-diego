import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import IncidentBanner from "../../components/IncidentBanner";

const meta = {
  title: "Ops/IncidentBanner",
  component: IncidentBanner,
  parameters: { layout: "padded" },
  args: { since: "14:32", apiReachable: false, retrying: false, onRetry: fn(), onViewDiagnostics: fn() },
} satisfies Meta<typeof IncidentBanner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ApiDown: Story = {};
export const DatabaseDown: Story = { args: { apiReachable: true } };
export const Retrying: Story = { args: { retrying: true } };
export const UnknownSince: Story = { args: { since: null } };
