type ToggleSwitchProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description: string;
  // Guardando el cambio: el interruptor no responde hasta que el backend conteste.
  busy?: boolean;
};

export default function ToggleSwitch({ checked, onChange, label, description, busy = false }: ToggleSwitchProps) {
  return (
    <div className="flex flex-row items-center gap-3 border-y border-gray-100 py-3.5">
      <div className="flex flex-grow flex-col gap-0.5">
        <span className="text-sm font-medium text-gray-900">{label}</span>
        <span className="text-xs text-gray-500">{description}</span>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-busy={busy}
        disabled={busy}
        onClick={() => onChange(!checked)}
        className={`flex h-5 w-9 flex-shrink-0 items-center rounded-full p-0.5 transition disabled:cursor-wait disabled:opacity-50 ${
          checked ? "justify-end bg-brand-primary" : "justify-start bg-gray-300"
        }`}
      >
        <span className="h-3.5 w-3.5 rounded-full bg-white" />
      </button>
    </div>
  );
}
