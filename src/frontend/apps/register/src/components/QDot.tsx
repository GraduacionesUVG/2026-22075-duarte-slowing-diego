type QDotProps = {
  // Clases de tamaño del logo, ej. "h-6 w-6".
  className?: string;
};

// Logo de QOrder: la Q de la marca (anillo blanco y cola naranja) sobre círculo azul.
export default function QDot({ className = "h-6 w-6" }: QDotProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 512 512"
      className={`flex-shrink-0 ${className}`}
      fill="none"
      strokeLinecap="round"
    >
      <circle cx="256" cy="256" r="256" fill="#1F2A94" />
      <circle cx="244" cy="238" r="104" stroke="#FFFFFF" strokeWidth="54" />
      <path d="M290 288 L378 376" stroke="#FF6B35" strokeWidth="54" />
    </svg>
  );
}
