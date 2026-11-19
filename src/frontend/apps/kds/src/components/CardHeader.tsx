import type { UrgencyTier } from "../hooks/useElapsedTime";
import SpeakButton from "./SpeakButton";

// "payment" es la cabecera de los pedidos ya aceptados que esperan el pago del cliente.
export type CardTone = UrgencyTier | "payment";

// Cada tono usa tokens de index.css (--tone-*): fondo pastel, texto oscuro y reloj sólido.
const TONE_BG: Record<CardTone, string> = {
  ontime: "bg-[var(--tone-ontime-tint)]",
  warning: "bg-[var(--tone-warning-tint)]",
  late: "bg-[var(--tone-late-tint)]",
  payment: "bg-[var(--tone-payment-tint)]",
};
const TONE_TEXT: Record<CardTone, string> = {
  ontime: "text-[var(--tone-ontime-deep)]",
  warning: "text-[var(--tone-warning-deep)]",
  late: "text-[var(--tone-late-deep)]",
  payment: "text-[var(--tone-payment-deep)]",
};
const TONE_CHIP: Record<CardTone, string> = {
  ontime: "bg-[var(--tone-ontime-chip)]",
  warning: "bg-[var(--tone-warning-chip)]",
  late: "bg-[var(--tone-late-chip)]",
  payment: "bg-[var(--tone-payment-chip)]",
};

// El ícono acompaña al color para que el estado se distinga sin depender de él (daltonismo).
function ToneIcon({ tone }: { tone: CardTone }) {
  const paths: Record<CardTone, React.ReactNode> = {
    ontime: (
      <>
        <path d="M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
        <path d="M9 12l2 2l4 -4" />
      </>
    ),
    warning: (
      <>
        <path d="M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
        <path d="M12 7v5l3 3" />
      </>
    ),
    late: (
      <>
        <path d="M12 9v4" />
        <path d="M10.363 3.591l-8.106 13.534a1.914 1.914 0 0 0 1.636 2.871h16.214a1.914 1.914 0 0 0 1.636 -2.871l-8.106 -13.534a1.914 1.914 0 0 0 -3.274 0z" />
        <path d="M12 16h.01" />
      </>
    ),
    payment: (
      <>
        <path d="M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
        <path d="M12 7v5l3 3" />
      </>
    ),
  };

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5 flex-shrink-0"
      aria-hidden="true"
    >
      {paths[tone]}
    </svg>
  );
}

type CardHeaderProps = {
  tone: CardTone;
  orderNumber: string;
  customerName: string;
  elapsedLabel: string;
  // Texto que lee la bocina junto al carné (solo lo del menú). Sin texto no hay bocina.
  speakText?: string;
  // Muestra la etiqueta "PAGADO": en Entrega y En espera el cliente ya pagó (así no hay dudas en cocina).
  paid?: boolean;
};

// Etiqueta blanca con check verde: se lee igual sobre cualquier tono de la cabecera.
function PaidBadge() {
  return (
    <span className="flex flex-shrink-0 items-center gap-1 whitespace-nowrap rounded-full bg-white px-2.5 py-0.5 text-sm font-bold text-green-700 ring-1 ring-green-600/30">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4"
        aria-hidden="true"
      >
        <path d="M5 12.5l4.5 4.5L19 7.5" />
      </svg>
      PAGADO
    </span>
  );
}

// Cabecera común de las tarjetas de pedido (91px de alto, fluida: se adapta al ancho de la tarjeta; va como primer hijo de la tarjeta).
export default function CardHeader({ tone, orderNumber, customerName, elapsedLabel, speakText, paid }: CardHeaderProps) {
  return (
    <div
      className={`flex h-[91px] w-full flex-shrink-0 flex-col justify-center gap-1.5 rounded-t-[30px] px-5 ${TONE_BG[tone]}`}
    >
      {/* El número de pedido va solo en su línea, completo y en grande: es lo que la cocina busca. */}
      <div className="flex flex-row items-center gap-2">
        <p className={`min-w-0 flex-1 whitespace-nowrap text-xl font-bold leading-6 ${TONE_TEXT[tone]}`}>
          PEDIDO #{orderNumber}
        </p>
        {paid && <PaidBadge />}
      </div>
      <div className="flex flex-row items-center gap-2">
        <p className={`min-w-0 truncate text-base font-semibold leading-6 ${TONE_TEXT[tone]}`}>{customerName}</p>
        {speakText && <SpeakButton text={speakText} className={`-my-1 ${TONE_TEXT[tone]}`} />}
        <span className="flex-1" />
        <span
          className={`flex flex-shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-sm font-semibold text-white ${TONE_CHIP[tone]}`}
        >
          <ToneIcon tone={tone} />
          {elapsedLabel}
        </span>
      </div>
    </div>
  );
}
