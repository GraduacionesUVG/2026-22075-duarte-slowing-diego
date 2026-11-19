import { useState, type ReactNode } from "react";
import Sidebar from "./Sidebar";
import ConfirmDialog from "./ConfirmDialog";
import QDot from "./QDot";
import Spinner from "./Spinner";
import { useNow } from "../hooks/useNow";
import { useDoubleTap } from "../hooks/useDoubleTap";
import type { KdsView } from "../hooks/useKdsAuth";

const VIEW_LABEL: Record<KdsView, string> = {
  acceptance: "ACEPTACIÓN",
  delivery: "ENTREGA",
  menu: "MENÚ",
};
const VIEW_ORDER: KdsView[] = ["acceptance", "delivery", "menu"];

// Navegación entre las páginas del KDS. Las páginas sin permiso se muestran bloqueadas.
export type ViewNav = {
  active: KdsView;
  allowed: KdsView[];
  onChange: (view: KdsView) => void;
  // Botón del sidebar que abre el popup de pedidos en espera (pagados para más tarde).
  waiting: { count: number; open: boolean; onToggle: () => void };
  // Botón del sidebar para silenciar o activar los avisos sonoros de pedidos nuevos.
  sound?: { on: boolean; onToggle: () => void };
  // Pedidos pendientes por sección: se muestran como globo en la pestaña (solo si hay alguno).
  counts?: Partial<Record<KdsView, number>>;
};

// Turno abierto de la estación: encabezado con su etiqueta, cronómetro de pausa y "Finalizar turno".
export type ShiftBar = {
  label: string;
  startedAtLabel: string;
  // Inicio ISO de la pausa abierta (para el cronómetro) y su hora HH:MM.
  pausedSince: string | null;
  pausedSinceLabel: string | null;
  pauseBusy: boolean;
  onEnd: () => void;
};

function formatStopwatch(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(Math.floor(total / 3600))}:${pad(Math.floor((total % 3600) / 60))}:${pad(total % 60)}`;
}

function PauseStopwatch({ since, sinceLabel }: { since: string; sinceLabel: string | null }) {
  const now = useNow();
  return (
    <span className="text-xs text-[var(--status-warning-text)]">
      En pausa{sinceLabel ? ` desde ${sinceLabel}` : ""} · {formatStopwatch(now - new Date(since).getTime())}
    </span>
  );
}

type BoardLayoutProps = {
  localName: string;
  nav: ViewNav;
  // Último error al hablar con el backend (se muestra como aviso bajo el encabezado).
  error?: string | null;
  isPaused: boolean;
  togglePaused: () => void;
  shiftBar?: ShiftBar;
  reload: () => void;
  onLogout: () => void;
  children: ReactNode;
};

// Estructura común de las páginas del KDS: sidebar, encabezado con pestañas,
// aviso de pausa y confirmación de cierre de sesión. El contenido del tablero va en children.
export default function BoardLayout({
  localName,
  nav,
  error,
  isPaused,
  togglePaused,
  shiftBar,
  reload,
  onLogout,
  children,
}: BoardLayoutProps) {
  const [showPowerConfirm, setShowPowerConfirm] = useState(false);
  // Finalizar turno pide doble toque para evitar cierres por accidente.
  const handleEndShiftTap = useDoubleTap(() => shiftBar?.onEnd());

  return (
    <div className="flex h-screen w-screen flex-row bg-[var(--kds-app-bg)]">
      <Sidebar
        isPaused={isPaused}
        pauseBusy={shiftBar?.pauseBusy}
        waitingCount={nav.waiting.count}
        waitingOpen={nav.waiting.open}
        onToggleWaiting={nav.waiting.onToggle}
        sound={nav.sound}
        onTogglePause={togglePaused}
        onRefresh={reload}
        onPowerOff={() => setShowPowerConfirm(true)}
      />

      <div className="flex min-w-0 flex-grow flex-col">
        <div className="kds-ring-border flex h-16 flex-shrink-0 flex-row items-center gap-3 bg-white px-4 lg:h-[76px] lg:gap-6 lg:px-8">
          <div className="flex min-w-0 flex-1 flex-row items-center gap-3">
            <div className="flex flex-shrink-0 flex-col items-center gap-1">
              <QDot className="h-9 w-9" />
              <span
                className={`whitespace-nowrap rounded-full px-2 text-[10px] font-semibold leading-4 ${
                  isPaused
                    ? "bg-[var(--status-warning-bg)] text-[var(--status-warning-text)]"
                    : "bg-[var(--status-success-bg)] text-[var(--status-success-text)]"
                }`}
              >
                {isPaused ? "EN PAUSA" : "RECIBIENDO"}
              </span>
            </div>
            <div className="flex min-w-0 flex-col">
              <span className="truncate whitespace-nowrap text-lg font-semibold leading-6 text-gray-900">
                {localName.toUpperCase()}
              </span>
              {shiftBar && (
                <span className="truncate whitespace-nowrap text-xs text-gray-500">
                  {shiftBar.label} · desde {shiftBar.startedAtLabel}
                </span>
              )}
            </div>
          </div>

          <div role="tablist" className="flex flex-row gap-1 rounded-full bg-[var(--kds-app-bg)] p-1">
            {VIEW_ORDER.map((view) => {
              const allowed = nav.allowed.includes(view);
              const active = nav.active === view;
              const count = nav.counts?.[view] ?? 0;
              return (
                <button
                  key={view}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  disabled={!allowed}
                  title={allowed ? undefined : "Sin permiso para esta página"}
                  onClick={() => nav.onChange(view)}
                  className={`relative flex h-11 items-center gap-2 whitespace-nowrap rounded-full px-4 text-base lg:px-6 lg:text-lg font-semibold transition ${
                    active
                      ? "bg-kds-sidebar text-white"
                      : "text-gray-500 hover:text-gray-900 "
                  } disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-gray-500`}
                >
                  {!allowed && (
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                      <path d="M12 2a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7a5 5 0 0 0-5-5zm-3 8V7a3 3 0 1 1 6 0v3H9z" />
                    </svg>
                  )}
                  {VIEW_LABEL[view]}
                  {count > 0 && (
                    <span
                      aria-label={`${count} pedidos`}
                      className="absolute -right-1.5 -top-1.5 flex h-6 min-w-6 items-center justify-center rounded-full bg-kds-brand px-1 text-xs font-bold leading-none text-white"
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex min-w-0 flex-1 flex-row items-center justify-end gap-3">
            {shiftBar && (
              <button
                type="button"
                onClick={handleEndShiftTap}
                title="Toca dos veces para finalizar el turno"
                className="kds-ring-border h-11 whitespace-nowrap rounded-full bg-white px-4 text-sm font-semibold text-kds-late lg:px-5 lg:text-base"
              >
                FINALIZAR TURNO
              </button>
            )}
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="bg-[var(--status-error-bg)] px-4 py-3 lg:px-8 text-sm font-semibold text-[var(--status-error-text)]"
          >
            {error}
          </div>
        )}

        {isPaused && (
          <div className="flex flex-row items-center gap-4 bg-[var(--status-warning-bg)] px-4 py-3 lg:gap-5 lg:px-8 lg:py-5">
            <div className="flex flex-grow flex-col gap-1.5">
              <span className="text-lg font-semibold text-[var(--status-warning-text)]">
                RECEPCIÓN DE PEDIDOS EN PAUSA
              </span>
              <span className="text-xs text-[var(--status-warning-text)]">
                El bot no asigna pedidos nuevos a esta estación. Los pedidos en curso siguen activos.
              </span>
              {shiftBar?.pausedSince && (
                <PauseStopwatch since={shiftBar.pausedSince} sinceLabel={shiftBar.pausedSinceLabel} />
              )}
            </div>
            <button
              type="button"
              onClick={togglePaused}
              disabled={shiftBar?.pauseBusy}
              aria-busy={shiftBar?.pauseBusy}
              className="flex h-12 flex-shrink-0 items-center gap-2 rounded-[20px] bg-kds-brand px-5 text-sm font-semibold text-white disabled:cursor-wait disabled:opacity-70"
            >
              {shiftBar?.pauseBusy && <Spinner className="h-4 w-4" />}
              {shiftBar?.pauseBusy ? "Reanudando…" : "Reanudar recepción"}
            </button>
          </div>
        )}

        <div className="kds-scroll flex min-h-0 flex-grow flex-col gap-4 overflow-auto p-4 lg:gap-8 lg:p-8">{children}</div>
      </div>

      <ConfirmDialog
        open={showPowerConfirm}
        title="¿Cerrar sesión del KDS?"
        message="Volverás a la pantalla de PIN. Los pedidos en curso se conservan y la cocina puede volver a entrar con el PIN del local."
        confirmLabel="Cerrar sesión"
        cancelLabel="Cancelar"
        onCancel={() => setShowPowerConfirm(false)}
        onConfirm={() => {
          setShowPowerConfirm(false);
          onLogout();
        }}
      />
    </div>
  );
}
