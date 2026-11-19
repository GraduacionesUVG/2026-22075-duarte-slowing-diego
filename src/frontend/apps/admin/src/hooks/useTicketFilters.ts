import { useEffect, useMemo, useState } from "react";
import type { AdminShiftsDay } from "@repo/api-client";
import { matchesResult, matchesShift, resultFilterLabel, resultOptionsOf, sumTickets } from "../lib/shiftTickets";

// Filtros de la sección Pedidos (turno y resultado). Se reinician al cambiar `resetKey`
// (fecha o estación): los turnos y resultados de otro día no aplican.
export function useTicketFilters(day: AdminShiftsDay | null, resetKey: string) {
  const [shiftFilter, setShiftFilter] = useState("");
  const [resultFilter, setResultFilter] = useState("");

  useEffect(() => {
    setShiftFilter("");
    setResultFilter("");
  }, [resetKey]);

  const visibleTickets = useMemo(
    () => (day?.tickets ?? []).filter((t) => matchesResult(t, resultFilter) && matchesShift(t, shiftFilter)),
    [day, shiftFilter, resultFilter],
  );
  const resultOptions = useMemo(() => resultOptionsOf(day?.tickets ?? []), [day]);
  const total = useMemo(() => sumTickets(visibleTickets), [visibleTickets]);

  // Etiquetas legibles de los filtros activos (subtítulo de la hoja impresa).
  const activeLabels = () => ({
    turno: day?.turnos.find(({ shift }) => shift.id === shiftFilter)?.shift.label,
    resultado: resultFilterLabel(resultFilter, resultOptions),
  });

  return {
    shiftFilter,
    setShiftFilter,
    resultFilter,
    setResultFilter,
    visibleTickets,
    resultOptions,
    total,
    activeLabels,
  };
}
