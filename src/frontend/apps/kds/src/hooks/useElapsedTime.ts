export type UrgencyTier = "ontime" | "warning" | "late";

function formatElapsed(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

const WARNING_AT_MINUTES = 5;
const LATE_AT_MINUTES = 12;

export function urgencyTierFromMinutes(minutes: number): UrgencyTier {
  if (minutes < WARNING_AT_MINUTES) return "ontime";
  if (minutes < LATE_AT_MINUTES) return "warning";
  return "late";
}

export function elapsedInfo(createdAt: string, now: number) {
  const elapsedMs = now - new Date(createdAt).getTime();
  return {
    label: formatElapsed(elapsedMs),
    tier: urgencyTierFromMinutes(elapsedMs / 60000),
  };
}
