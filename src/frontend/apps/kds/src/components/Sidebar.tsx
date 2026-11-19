import pauseIcon from "../assets/icons/kds-pause.png";
import Spinner from "./Spinner";
import { SoundIcon } from "./ActionIcons";
import { useDoubleTap } from "../hooks/useDoubleTap";
import refreshIcon from "../assets/icons/kds-refresh.png";
import powerIcon from "../assets/icons/kds-power.png";

type SidebarProps = {
  isPaused: boolean;
  // Pausar/reanudar en curso (llamada al backend).
  pauseBusy?: boolean;
  // Pedidos pagados para más tarde. El botón abre la pantalla "En espera".
  waitingCount?: number;
  waitingOpen?: boolean;
  onToggleWaiting?: () => void;
  // Sonido de avisos de pedidos nuevos. Sin esta prop no se muestra el botón.
  sound?: { on: boolean; onToggle: () => void };
  onTogglePause?: () => void;
  onRefresh?: () => void;
  onPowerOff?: () => void;
};

function IconButton({
  label,
  onClick,
  active,
  badge,
  busy,
  title,
  children,
}: {
  label: string;
  onClick?: () => void;
  active?: boolean;
  badge?: number;
  // Acción en vuelo: muestra el loader y no deja volver a tocar.
  busy?: boolean;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={title}
      aria-pressed={active}
      aria-busy={busy}
      disabled={busy}
      onClick={onClick}
      className={`relative flex h-14 w-14 items-center lg:w-[61px] justify-center rounded-[20px] bg-[var(--kds-icon-btn-bg)] shadow transition hover:opacity-80 ${
        active ? "ring-2 ring-kds-brand" : ""
      } disabled:cursor-wait disabled:opacity-70`}
    >
      {busy ? <Spinner className="h-6 w-6 text-black" /> : children}
      {badge !== undefined && badge > 0 && (
        <span className="absolute -right-1.5 -top-1.5 flex h-6 min-w-6 items-center justify-center rounded-full bg-kds-brand px-1 text-xs font-bold leading-none text-white">
          {badge}
        </span>
      )}
    </button>
  );
}

export default function Sidebar({
  isPaused,
  pauseBusy = false,
  waitingCount = 0,
  waitingOpen = false,
  onToggleWaiting,
  sound,
  onTogglePause,
  onRefresh,
  onPowerOff,
}: SidebarProps) {
  // Cerrar sesión pide doble toque para evitar salidas por accidente.
  const handlePowerTap = useDoubleTap(() => onPowerOff?.());

  return (
    <aside className="flex h-full w-[72px] flex-shrink-0 flex-col items-center justify-end gap-3 bg-kds-sidebar pb-6 lg:w-[90px] lg:gap-2 lg:pb-[50px]">
      {sound && (
        <IconButton
          label={sound.on ? "Silenciar avisos" : "Activar sonido de avisos"}
          title={sound.on ? "Sonido activado" : "Sonido silenciado"}
          active={!sound.on}
          onClick={sound.onToggle}
        >
          <SoundIcon on={sound.on} className="h-7 w-7 text-black" />
        </IconButton>
      )}

      <IconButton
        label={waitingOpen ? "Volver a los pedidos" : "Pedidos en espera"}
        active={waitingOpen}
        badge={waitingCount}
        onClick={onToggleWaiting}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-7 w-7 text-black"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      </IconButton>

      <IconButton label={isPaused ? "Reanudar pedidos" : "Pausar pedidos"} active={isPaused} busy={pauseBusy} onClick={onTogglePause}>
        <img src={pauseIcon} alt="" width={30} height={30} />
      </IconButton>

      <IconButton label="Actualizar" onClick={onRefresh}>
        <img src={refreshIcon} alt="" width={32} height={32} />
      </IconButton>

      <IconButton label="Cerrar sesión" title="Toca dos veces para cerrar sesión" onClick={handlePowerTap}>
        <img src={powerIcon} alt="" width={30} height={30} />
      </IconButton>
    </aside>
  );
}
