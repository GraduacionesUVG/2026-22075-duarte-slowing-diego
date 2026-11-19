import type { MenuOffMode } from "@repo/api-client";

type DisableItemDialogProps = {
  itemName: string;
  // Al elegir una opción se apaga el producto de inmediato (un solo toque).
  onChoose: (mode: MenuOffMode) => void;
  onCancel: () => void;
};

function OptionButton({
  title,
  description,
  onClick,
}: {
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col gap-1 rounded-2xl bg-white p-4 text-left ring-1 ring-gray-200 transition hover:bg-gray-50 active:bg-[var(--status-error-bg)]"
    >
      <span className="text-lg font-semibold text-gray-900">{title}</span>
      <span className="text-xs leading-relaxed text-gray-500">{description}</span>
    </button>
  );
}

// Al apagar un producto la cocina elige por cuánto tiempo: solo por hoy (vuelve solo mañana) o
// hasta que alguien lo encienda a mano. Encenderlo no pregunta nada.
export default function DisableItemDialog({ itemName, onChoose, onCancel }: DisableItemDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onCancel}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="disable-item-title"
        onClick={(e) => e.stopPropagation()}
        className="flex w-full max-w-md flex-col gap-4 rounded-2xl bg-white p-6 shadow-xl"
      >
        <div>
          <h2 id="disable-item-title" className="text-lg font-bold text-gray-900">
            ¿Apagar «{itemName}»?
          </h2>
          <p className="mt-1 text-sm text-gray-500">Un producto apagado deja de ofrecerse en el chat.</p>
        </div>

        <div className="flex flex-col gap-3">
          <OptionButton
            title="Solo por hoy"
            description="Se enciende solo mañana (hora de Guatemala)."
            onClick={() => onChoose("daily")}
          />
          <OptionButton
            title="Hasta que lo encienda"
            description="Se queda apagado hasta que alguien lo vuelva a encender a mano."
            onClick={() => onChoose("permanent")}
          />
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full px-5 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-100"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
