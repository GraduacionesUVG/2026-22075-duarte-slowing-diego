import {
  CATEGORY_ICON_GROUPS,
  CATEGORY_ICON_LABELS,
  CategoryIcon,
  type CategoryIconKey,
} from "@repo/category-icons";

type CategoryIconPickerProps = {
  value: string;
  onChange: (icon: CategoryIconKey) => void;
  // Nombre del grupo de radios (único por pantalla).
  name?: string;
};

// Selector de icono: cada opción lleva el dibujo Y su nombre en texto (no depende solo de la imagen),
// y es un grupo de radios, así que se recorre con las flechas del teclado.
export default function CategoryIconPicker({ value, onChange, name = "category-icon" }: CategoryIconPickerProps) {
  return (
    <div className="flex max-h-72 flex-col gap-4 overflow-y-auto pr-1" role="radiogroup" aria-label="Icono de la categoría">
      {CATEGORY_ICON_GROUPS.map((group) => (
        <fieldset key={group.label} className="flex flex-col gap-2">
          <legend className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
            {group.label}
          </legend>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {group.keys.map((key) => {
              const selected = key === value;
              return (
                <label
                  key={key}
                  className={`flex cursor-pointer flex-col items-center gap-1 rounded-lg px-1.5 py-2 text-center text-[12px] font-medium leading-4 ring-1 transition focus-within:ring-2 focus-within:ring-brand-primary ${
                    selected
                      ? "bg-brand-primary/10 text-brand-primary ring-2 ring-brand-primary"
                      : "bg-white text-gray-700 ring-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    name={name}
                    value={key}
                    checked={selected}
                    onChange={() => onChange(key)}
                    className="sr-only"
                  />
                  <CategoryIcon name={key} size={28} />
                  <span>{CATEGORY_ICON_LABELS[key]}</span>
                </label>
              );
            })}
          </div>
        </fieldset>
      ))}
    </div>
  );
}
