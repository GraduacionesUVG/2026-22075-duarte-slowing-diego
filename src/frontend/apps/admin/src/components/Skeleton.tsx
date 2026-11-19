import type { CSSProperties, ReactNode } from "react";

// Bloque gris pulsante que ocupa el lugar de un texto, tarjeta o campo mientras carga.
// Es decorativo: el mensaje para lectores de pantalla va en <SkeletonRegion>.
export function Skeleton({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return <div aria-hidden="true" style={style} className={`animate-pulse rounded-md bg-gray-200 motion-reduce:animate-none ${className}`} />;
}

// Anillo giratorio para botones que esperan al backend. Decorativo: el texto del botón dice qué pasa.
export function Spinner({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none ${className}`}
    />
  );
}

type SkeletonRegionProps = {
  // Lo que anuncia el lector de pantalla (ej. "Cargando el menú…").
  label: string;
  className?: string;
  children: ReactNode;
};

export function SkeletonRegion({ label, className = "", children }: SkeletonRegionProps) {
  return (
    <div role="status" aria-busy="true" aria-live="polite" className={className}>
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}
