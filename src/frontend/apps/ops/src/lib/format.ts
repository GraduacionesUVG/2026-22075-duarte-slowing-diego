// Las fechas del backend son hora de Guatemala (UTC-6, sin horario de verano).
const GT_OFFSET_MS = -6 * 3600_000;

// YYYY-MM-DD en Guatemala, `offsetDays` días atrás.
export function guatemalaDate(offsetDays = 0): string {
  return new Date(Date.now() + GT_OFFSET_MS - offsetDays * 86_400_000).toISOString().slice(0, 10);
}

export function clock(iso: string | number | Date, withSeconds = false): string {
  return new Date(iso).toLocaleTimeString("es-GT", {
    hour: "2-digit",
    minute: "2-digit",
    second: withSeconds ? "2-digit" : undefined,
    hour12: false,
  });
}
