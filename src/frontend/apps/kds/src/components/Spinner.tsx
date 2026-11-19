// Anillo giratorio para botones y pantallas en espera. Decorativo: el texto del botón dice qué pasa.
export default function Spinner({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none ${className}`}
    />
  );
}
