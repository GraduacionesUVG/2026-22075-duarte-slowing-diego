import type { Shift } from "@repo/api-client";
import QDot from "../components/QDot";
import Spinner from "../components/Spinner";
import { useDoubleTap } from "../hooks/useDoubleTap";
import { formatLocalDate } from "../lib/shiftFormat";

type StartShiftKDSProps = {
  localName: string;
  username: string | null;
  // Número que tendrá el turno (turnos de hoy + 1); null si no se pudo calcular.
  nextShiftNo: number | null;
  // Órdenes de un turno anterior que siguen en cocina.
  enCurso: number;
  // Turno abierto de un día anterior: se puede cerrar y ver su resumen, o iniciar uno nuevo (lo cierra solo).
  staleShift: Shift | null;
  // Turno que se cerró al iniciar uno nuevo o desde otra pantalla.
  closedNotice: Shift | null;
  starting: boolean;
  ending: boolean;
  error: string | null;
  onStart: () => void;
  onEndStale: () => void;
  onViewSummary: (shiftId: string) => void;
  onDismissNotice: () => void;
  onLogout: () => void;
};

// Pantalla "Iniciar turno": la estación solo recibe pedidos dentro de un turno abierto.
export default function StartShiftKDS({
  localName,
  username,
  nextShiftNo,
  enCurso,
  staleShift,
  closedNotice,
  starting,
  ending,
  error,
  onStart,
  onEndStale,
  onViewSummary,
  onDismissNotice,
  onLogout,
}: StartShiftKDSProps) {
  const busy = starting || ending;
  // Cerrar sesión pide doble toque para evitar salidas por accidente.
  const handleLogoutTap = useDoubleTap(onLogout);

  return (
    <div className="flex h-screen w-screen flex-row bg-white">
      <div className="flex w-64 flex-shrink-0 flex-col gap-4 bg-kds-sidebar p-8 lg:w-96 lg:p-12">
        <div className="flex flex-row items-center gap-2.5">
          <QDot className="h-6 w-6" />
          <span className="text-lg font-semibold text-white">QOrder KDS</span>
        </div>
        <span className="mt-auto text-lg font-semibold leading-tight text-white">
          {staleShift ? "Quedó un turno sin cerrar." : "Inicia tu turno para empezar a recibir pedidos."}
        </span>
        <button
          type="button"
          onClick={handleLogoutTap}
          title="Toca dos veces para cerrar sesión"
          disabled={busy}
          className="self-start text-sm font-semibold text-white/70 underline disabled:opacity-40"
        >
          Cerrar sesión
        </button>
      </div>

      <div className="flex flex-grow flex-col items-center justify-center gap-6 overflow-auto p-6 lg:p-12">
        <div className="flex w-full max-w-[520px] flex-col gap-5">
          {closedNotice && (
            <div className="flex flex-row items-center gap-3 rounded-[20px] bg-[var(--status-warning-bg)] px-4 py-3">
              <span className="flex-grow text-sm font-semibold text-[var(--status-warning-text)]">
                Se cerró el Turno {closedNotice.shift_no} del {formatLocalDate(closedNotice.local_date)}
                {closedNotice.hora_fin ? ` a las ${closedNotice.hora_fin}` : ""}.
              </span>
              <button
                type="button"
                onClick={() => onViewSummary(closedNotice.id)}
                className="text-sm font-semibold text-[var(--status-warning-text)] underline"
              >
                Ver resumen
              </button>
              <button
                type="button"
                aria-label="Cerrar aviso"
                onClick={onDismissNotice}
                className="text-lg font-semibold leading-none text-[var(--status-warning-text)]"
              >
                ×
              </button>
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="rounded-[20px] bg-[var(--status-error-bg)] px-4 py-3 text-sm font-semibold text-[var(--status-error-text)]"
            >
              {error}
            </div>
          )}

          <div className="kds-ring-card flex flex-col gap-4 rounded-[30px] bg-[var(--kds-card-bg)] p-8">
            <span className="text-sm font-semibold text-gray-500">{localName.toUpperCase()}</span>
            {staleShift ? (
              <>
                <span className="text-2xl font-bold text-gray-900">
                  Turno sin cerrar del {formatLocalDate(staleShift.local_date)}
                </span>
                <p className="text-sm text-gray-500">
                  {staleShift.label} empezó a las {staleShift.hora_inicio} y nunca se finalizó. Ciérralo para ver su
                  resumen, o inicia un turno nuevo (el anterior se cierra solo).
                </p>
                <div className="flex flex-col gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onEndStale}
                    disabled={busy}
                    aria-busy={ending}
                    className="kds-ring-border flex h-14 items-center justify-center gap-2 rounded-[20px] bg-white text-lg font-semibold text-gray-900 disabled:cursor-wait disabled:opacity-60"
                  >
                    {ending && <Spinner />}
                    {ending ? "CERRANDO…" : "VER Y CERRAR"}
                  </button>
                  <button
                    type="button"
                    onClick={onStart}
                    disabled={busy}
                    aria-busy={starting}
                    className="flex h-14 items-center justify-center gap-2 rounded-[20px] bg-kds-brand text-lg font-semibold text-white disabled:cursor-wait disabled:opacity-60"
                  >
                    {starting && <Spinner />}
                    {starting ? "INICIANDO…" : "INICIAR TURNO NUEVO"}
                  </button>
                </div>
              </>
            ) : (
              <>
                <span className="text-2xl font-bold text-gray-900">
                  {username ? `Estación ${username}` : "Tu estación"}
                </span>
                <p className="text-sm text-gray-500">
                  {nextShiftNo !== null ? `Será el Turno ${nextShiftNo} de hoy. ` : "Aún no hay un turno abierto. "}
                  Al iniciarlo la estación empieza a recibir solicitudes.
                </p>
                {enCurso > 0 && (
                  <p className="rounded-[20px] bg-[var(--status-warning-bg)] px-4 py-3 text-sm font-semibold text-[var(--status-warning-text)]">
                    Hay {enCurso} {enCurso === 1 ? "orden" : "órdenes"} de un turno anterior que siguen en cocina; las
                    verás en el panel igual que siempre.
                  </p>
                )}
                <button
                  type="button"
                  onClick={onStart}
                  disabled={busy}
                  aria-busy={starting}
                  className="mt-2 flex h-16 items-center justify-center gap-3 rounded-[20px] bg-kds-brand text-xl font-semibold text-white disabled:cursor-wait disabled:opacity-60"
                >
                  {starting && <Spinner className="h-6 w-6" />}
                  {starting ? "INICIANDO TURNO…" : "INICIAR TURNO"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
