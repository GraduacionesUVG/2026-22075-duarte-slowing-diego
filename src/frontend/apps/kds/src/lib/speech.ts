import type { Order } from "@repo/api-client";

// Texto a voz con la API del navegador (speechSynthesis): no necesita servidor ni archivos.
export const speechSupported = typeof window !== "undefined" && "speechSynthesis" in window;

// Qué se lee de un pedido: solo lo que es del menú, es decir cantidad, producto y sus modificadores.
// No se leen el número de pedido, el carné ni las notas libres del cliente.
// Ej.: "2 Hamburguesa clásica, Tocino, Queso extra. 1 Papas fritas."
export function orderSpeechText(order: Order): string {
  return order.items
    .map((item) => {
      const parts = [`${item.quantity} ${item.name}`, ...(item.modifiers ?? [])];
      return `${parts.join(", ")}.`;
    })
    .join(" ");
}

// Los navegadores cargan las voces de forma asíncrona: la primera consulta suele venir vacía.
// Se espera a que avisen (voiceschanged) con un tope, para no quedarse colgado en equipos sin voces.
function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  const synth = window.speechSynthesis;
  const ready = synth.getVoices();
  if (ready.length > 0) return Promise.resolve(ready);
  return new Promise((resolve) => {
    const done = () => {
      synth.removeEventListener("voiceschanged", done);
      clearTimeout(timer);
      resolve(synth.getVoices());
    };
    const timer = setTimeout(done, 1500);
    synth.addEventListener("voiceschanged", done);
  });
}

const PREFERRED_LANGS = ["es-gt", "es-mx", "es-us", "es-419", "es-es"];
const isNatural = (v: SpeechSynthesisVoice) => /natural|online/i.test(v.name);

// Voz en español: prefiere Guatemala/Latinoamérica y, a igualdad, las "Natural" (suenan mejor).
// Devuelve null si el equipo no tiene ninguna (entonces se usa la voz que haya, ver `pickVoice`).
export async function findSpanishVoice(): Promise<SpeechSynthesisVoice | null> {
  if (!speechSupported) return null;
  const spanish = (await loadVoices()).filter((v) => v.lang.toLowerCase().replace("_", "-").startsWith("es"));
  const rank = (v: SpeechSynthesisVoice) => {
    const index = PREFERRED_LANGS.indexOf(v.lang.toLowerCase().replace("_", "-"));
    return (index === -1 ? PREFERRED_LANGS.length : index) * 2 + (isNatural(v) ? 0 : 1);
  };
  return [...spanish].sort((a, b) => rank(a) - rank(b))[0] ?? null;
}

// La voz con la que se lee: la mejor en español y, si el equipo no tiene ninguna, la que haya
// (la predeterminada o la primera, normalmente en inglés): mejor eso que quedarse sin leer.
export async function pickVoice(): Promise<{ voice: SpeechSynthesisVoice | null; spanish: boolean }> {
  const spanish = await findSpanishVoice();
  if (spanish) return { voice: spanish, spanish: true };
  const all = window.speechSynthesis.getVoices();
  return { voice: all.find((v) => v.default) ?? all[0] ?? null, spanish: false };
}

// "spanish": se leyó con voz en español · "fallback": con otra voz (el equipo no tiene español).
export type SpeakOutcome = "spanish" | "fallback" | "unsupported";

// Lee el texto en voz alta. Corta lo que se esté leyendo para no encimar dos pedidos.
// `onEnd` se llama al terminar o si se interrumpe.
export async function speak(text: string, onEnd?: () => void): Promise<SpeakOutcome> {
  if (!speechSupported) {
    onEnd?.();
    return "unsupported";
  }
  const { voice, spanish } = await pickVoice();
  const synth = window.speechSynthesis;
  synth.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  if (voice) utterance.voice = voice;
  // Con voz en español se usa su idioma; sin ella se deja la pista "es-MX" por si el sistema sabe elegir.
  utterance.lang = spanish && voice ? voice.lang : "es-MX";
  utterance.rate = 0.95;
  utterance.onend = () => onEnd?.();
  utterance.onerror = () => onEnd?.();
  synth.speak(utterance);
  return spanish ? "spanish" : "fallback";
}

export function stopSpeaking(): void {
  if (speechSupported) window.speechSynthesis.cancel();
}
