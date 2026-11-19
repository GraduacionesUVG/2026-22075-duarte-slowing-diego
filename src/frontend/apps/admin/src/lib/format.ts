export const money = (n: number) =>
  `Q${n.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const pct = (n: number) => `${n.toFixed(1)}%`;

// 365 -> "6 h 5 min"; 25 -> "25 min"; sin dato -> "—"
export function minutes(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  const total = Math.round(value);
  if (total < 60) return `${total} min`;
  const rest = total % 60;
  return rest === 0 ? `${Math.floor(total / 60)} h` : `${Math.floor(total / 60)} h ${rest} min`;
}
