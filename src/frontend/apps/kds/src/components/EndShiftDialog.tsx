import type { ShiftPending } from "@repo/api-client";
import Spinner from "./Spinner";

type EndShiftDialogProps = {
  shiftLabel: string;
  // null mientras se consulta GET /shift/current para leer los pendientes.
  pendientes: ShiftPending | null;
  ending: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

// Confirmación de "Finalizar turno": con solicitudes por aceptar no se puede cerrar.
export default function EndShiftDialog({ shiftLabel, pendientes, ending, onConfirm, onCancel }: EndShiftDialogProps) {
  const blocked = pendientes !== null && pendientes.por_aceptar > 0;
  const shortLabel = shiftLabel.split(" · ")[0];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={ending ? undefined : onCancel}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="end-shift-title"
        aria-busy={pendientes === null || ending}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
      >
        {pendientes === null ? (
          <div className="flex flex-col items-center gap-3 py-6 text-gray-500">
            <Spinner className="h-8 w-8" />
            <span id="end-shift-title" className="text-sm font-semibold">
              Revisando pendientes…
            </span>
          </div>
        ) : blocked ? (
          <>
            <h2 id="end-shift-title" className="text-lg font-bold text-gray-900">
              No se puede finalizar todavía
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Tienes {pendientes.por_aceptar} solicitud{pendientes.por_aceptar === 1 ? "" : "es"} por aceptar o
              rechazar.
            </p>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={onCancel}
                className="rounded-full bg-kds-sidebar px-5 py-2 text-sm font-semibold text-white"
              >
                Volver al panel
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 id="end-shift-title" className="text-lg font-bold text-gray-900">
              ¿Finalizar el {shortLabel}?
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Dejarás de recibir pedidos nuevos.
              {pendientes.en_curso > 0 &&
                ` Las ${pendientes.en_curso} órdenes en curso seguirán visibles para terminarlas y entregarlas.`}
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={onCancel}
                disabled={ending}
                className="rounded-full px-5 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 disabled:opacity-40"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={ending}
                aria-busy={ending}
                className="flex items-center gap-2 rounded-full bg-kds-late px-5 py-2 text-sm font-semibold text-white disabled:cursor-wait disabled:opacity-70"
              >
                {ending && <Spinner className="h-4 w-4" />}
                {ending ? "Finalizando…" : "Finalizar turno"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
