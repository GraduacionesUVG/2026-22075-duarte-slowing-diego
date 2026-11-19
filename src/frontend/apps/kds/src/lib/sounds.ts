// Sonidos de aviso generados con Web Audio (sin archivos de audio). Cada tipo de pedido suena
// distinto para que la cocina sepa qué llegó sin mirar la pantalla.
export type OrderSoundKind = "acceptance" | "delivery";

const STORAGE_KEY = "kds_sound";

export function isSoundEnabled(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== "off";
  } catch {
    return true;
  }
}

export function setSoundEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY, enabled ? "on" : "off");
  } catch {
    // sin almacenamiento: la preferencia vale solo mientras la página esté abierta
  }
}

let context: AudioContext | null = null;

function audioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  context ??= new Ctor();
  if (context.state === "suspended") void context.resume();
  return context;
}

// Los navegadores bloquean el audio hasta que la persona toca la página: con el primer toque
// (el PIN del login ya lo es) se deja listo el contexto para que los avisos suenen después.
if (typeof document !== "undefined") {
  const unlock = () => void audioContext();
  document.addEventListener("pointerdown", unlock, { once: true });
  document.addEventListener("keydown", unlock, { once: true });
}

type Note = { frequency: number; start: number; duration: number };

// Aceptación: "ding-dong" (dos notas descendentes). Entrega: arpegio ascendente de tres notas.
const MELODIES: Record<OrderSoundKind, Note[]> = {
  acceptance: [
    { frequency: 880, start: 0, duration: 0.32 },
    { frequency: 660, start: 0.28, duration: 0.45 },
  ],
  delivery: [
    { frequency: 523.25, start: 0, duration: 0.18 },
    { frequency: 659.25, start: 0.16, duration: 0.18 },
    { frequency: 783.99, start: 0.32, duration: 0.4 },
  ],
};

export function playOrderSound(kind: OrderSoundKind): void {
  if (!isSoundEnabled()) return;
  playMelody(MELODIES[kind]);
}

// Un toque corto al activar el sonido: confirma que se oye y deja listo el audio del navegador.
export function playSoundPreview(): void {
  playMelody([{ frequency: 740, start: 0, duration: 0.2 }]);
}

function playMelody(notes: Note[]): void {
  const ctx = audioContext();
  if (!ctx) return;
  const t0 = ctx.currentTime + 0.02;
  for (const note of notes) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = note.frequency;
    const start = t0 + note.start;
    const end = start + note.duration;
    // Ataque rápido y caída suave para que no suene como un "clic".
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.35, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, end);
    osc.connect(gain).connect(ctx.destination);
    osc.start(start);
    osc.stop(end + 0.02);
  }
}
