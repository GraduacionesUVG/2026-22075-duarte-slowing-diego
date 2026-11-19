import { Skeleton, SkeletonRegion } from "../Skeleton";
import { cardClass } from "./styles";

// Primera carga del resumen: KPIs y dos tarjetas con filas.
export function ShiftsPageSkeleton() {
  return (
    <SkeletonRegion label="Cargando resumen de turnos…" className="flex flex-col gap-6">
      <div className="flex flex-row flex-wrap gap-4">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="flex w-52 flex-col gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-200">
            <Skeleton className="h-3 w-2/3" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        ))}
      </div>
      <div className={cardClass + " flex flex-col gap-4"}>
        <Skeleton className="h-4 w-40" />
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </div>
      <div className={cardClass + " flex flex-col gap-4"}>
        <Skeleton className="h-4 w-48" />
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </div>
    </SkeletonRegion>
  );
}

// Detalle de un turno mientras se consulta.
export function ShiftDetailSkeleton() {
  return (
    <SkeletonRegion label="Cargando turno…" className="flex flex-col gap-4">
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-3 w-3/4" />
      <Skeleton className="h-16 w-full rounded-lg" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-5/6" />
    </SkeletonRegion>
  );
}
