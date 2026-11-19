import { useEffect, useRef, useState } from "react";
import { SpeakerIcon } from "./ActionIcons";
import { findSpanishVoice, speak, speechSupported, stopSpeaking } from "../lib/speech";

type SpeakButtonProps = {
  // Texto que se lee (ver orderSpeechText: solo lo que es del menú).
  text: string;
  // Clase de color del ícono, para que combine con la cabecera de la tarjeta.
  className?: string;
};

// Ícono de bocina junto al carné: lee el pedido en voz alta; otro toque mientras habla lo detiene.
// Usa una voz en español si el equipo la tiene; si no, lee con la que haya (aunque sea en inglés).
export default function SpeakButton({ text, className = "" }: SpeakButtonProps) {
  const [speaking, setSpeaking] = useState(false);
  // null = todavía comprobando; false = el equipo no tiene voz en español (se usará otra).
  const [hasSpanish, setHasSpanish] = useState<boolean | null>(null);

  // Si la tarjeta desaparece mientras habla (se entregó, se rechazó…), se corta la voz.
  const speakingRef = useRef(false);
  useEffect(() => {
    speakingRef.current = speaking;
  }, [speaking]);
  useEffect(
    () => () => {
      if (speakingRef.current) stopSpeaking();
    },
    [],
  );

  useEffect(() => {
    let cancelled = false;
    void findSpanishVoice().then((voice) => {
      if (!cancelled) setHasSpanish(voice !== null);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!speechSupported) return null;

  const handleClick = () => {
    if (speaking) {
      stopSpeaking();
      setSpeaking(false);
      return;
    }
    setSpeaking(true);
    void speak(text, () => setSpeaking(false));
  };

  const title = speaking
    ? "Detener"
    : hasSpanish === false
      ? "Escuchar el pedido (este equipo no tiene voz en español: se leerá con otra voz)"
      : "Escuchar el pedido";

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={speaking ? "Detener lectura del pedido" : "Escuchar el pedido"}
      aria-pressed={speaking}
      title={title}
      className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full transition hover:bg-black/10 ${
        speaking ? "bg-black/10" : ""
      } ${className}`}
    >
      <SpeakerIcon active={speaking} />
    </button>
  );
}
