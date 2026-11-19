export type BadgeStatus = "success" | "warning" | "error" | "info";

const STYLES: Record<BadgeStatus, string> = {
  success: "bg-green-50 text-green-700",
  warning: "bg-amber-50 text-amber-700",
  error: "bg-red-50 text-red-700",
  info: "bg-blue-50 text-blue-700",
};

type StatusBadgeProps = {
  status: BadgeStatus;
  label: string;
};

export default function StatusBadge({ status, label }: StatusBadgeProps) {
  return (
    <span
      className={`inline-block whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${STYLES[status]}`}
    >
      {label}
    </span>
  );
}
