import type { ReactNode } from "react";

// Íconos de los botones de acción del flujo de entrega (mismo estilo de trazo que el resto del KDS).
export type StageIconName = "prepare" | "ready" | "deliver";

const PATHS: Record<StageIconName, ReactNode> = {
  // Olla con vapor: iniciar la preparación.
  prepare: (
    <>
      <path d="M5 11h14v5a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4z" />
      <path d="M3 11h18" />
      <path d="M9 4c0 1.5 1.5 1.5 1.5 3" />
      <path d="M13.5 4c0 1.5 1.5 1.5 1.5 3" />
    </>
  ),
  // Campana de servicio: el pedido está listo para entregar.
  ready: (
    <>
      <path d="M4 17a8 8 0 0 1 16 0z" />
      <path d="M3 20h18" />
      <path d="M12 9V7" />
      <path d="M10.5 7h3" />
    </>
  ),
  // Llave: entregar con el código del cliente.
  deliver: (
    <>
      <circle cx="7.5" cy="15.5" r="4" />
      <path d="M10.4 12.6 20 3" />
      <path d="M16 7l3 3" />
    </>
  ),
};

export function StageIcon({ name, className = "h-6 w-6" }: { name: StageIconName; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`flex-shrink-0 ${className}`}
      aria-hidden="true"
    >
      {PATHS[name]}
    </svg>
  );
}

// Bocina: lee el pedido en voz alta. `active` dibuja las ondas más marcadas mientras habla.
export function SpeakerIcon({ className = "h-5 w-5", active = false }: { className?: string; active?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`flex-shrink-0 ${className}`}
      aria-hidden="true"
    >
      <path d="M11 5 6 9H3v6h3l5 4z" fill={active ? "currentColor" : "none"} />
      <path d="M15.5 8.5a5 5 0 0 1 0 7" />
      <path d="M18.5 5.5a9 9 0 0 1 0 13" />
    </svg>
  );
}

// Altavoz del sidebar: sonido de avisos encendido o silenciado (con la raya).
export function SoundIcon({ on, className = "h-7 w-7" }: { on: boolean; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`flex-shrink-0 ${className}`}
      aria-hidden="true"
    >
      <path d="M11 5 6 9H3v6h3l5 4z" />
      {on ? (
        <>
          <path d="M15.5 8.5a5 5 0 0 1 0 7" />
          <path d="M18.5 5.5a9 9 0 0 1 0 13" />
        </>
      ) : (
        <>
          <path d="m16 9 5 6" />
          <path d="m21 9-5 6" />
        </>
      )}
    </svg>
  );
}
