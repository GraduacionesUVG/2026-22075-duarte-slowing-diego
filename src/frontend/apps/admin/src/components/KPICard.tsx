import type { TrendTone } from "../hooks/useDashboardMetrics";

const TREND_COLOR: Record<TrendTone, string> = {
  success: "text-green-600",
  error: "text-red-600",
  muted: "text-gray-500",
};

type KPICardProps = {
  label: string;
  value: string;
  trend: string;
  trendTone: TrendTone;
};

export default function KPICard({ label, value, trend, trendTone }: KPICardProps) {
  return (
    <div className="flex w-64 flex-shrink-0 flex-col gap-3 rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
      <span className="text-xs font-semibold text-gray-500">{label}</span>
      <span className="text-lg font-bold text-gray-900">{value}</span>
      <span className={`text-xs ${TREND_COLOR[trendTone]}`}>{trend}</span>
    </div>
  );
}
