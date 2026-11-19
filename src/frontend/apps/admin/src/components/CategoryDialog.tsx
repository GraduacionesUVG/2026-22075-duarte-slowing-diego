import { useEffect, useRef, useState } from "react";
import {
  CATEGORY_ICON_LABELS,
  CategoryIcon,
  isCategoryIconKey,
  suggestCategoryIcon,
  type CategoryIconKey,
} from "@repo/category-icons";
import CategoryIconPicker from "./CategoryIconPicker";

type CategoryDialogProps = {
  // Categorías que ya existen (para avisar de duplicados antes de llamar al backend).
  existing: string[];
  // Si viene, el diálogo edita esa categoría (nombre e icono); si no, crea una nueva.
  category?: { name: string; icon: string; productsCount: number };
  // Devuelve null si salió bien o el mensaje de error para mostrar en el diálogo.
  // `icon` es null cuando no se eligió uno a mano (en alta, el backend sugiere uno).
  onSubmit: (values: { name: string; icon: string | null }) => Promise<string | null>;
  onClose: () => void;
};

const MAX_LENGTH = 60;

export default function CategoryDialog({ existing, category, onSubmit, onClose }: CategoryDialogProps) {
  const editing = Boolean(category);
  const [name, setName] = useState(category?.name ?? "");
  // null = sin elegir: se usa (y se muestra) el icono sugerido por el nombre.
  const [chosenIcon, setChosenIcon] = useState<CategoryIconKey | null>(
    category && isCategoryIconKey(category.icon) ? category.icon : null,
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const suggested = suggestCategoryIcon(name);
  const effectiveIcon = chosenIcon ?? suggested;
  const trimmed = name.trim();
  const renaming = editing && category !== undefined && trimmed !== category.name;

  const submit = async () => {
    if (saving) return;
    if (!trimmed) {
      setError("Escribe el nombre de la categoría.");
      return;
    }
    const others = editing ? existing.filter((c) => c.toLowerCase() !== category!.name.toLowerCase()) : existing;
    if (others.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      setError(`La categoría "${trimmed}" ya existe.`);
      return;
    }
    setSaving(true);
    const problem = await onSubmit({ name: trimmed, icon: chosenIcon });
    setSaving(false);
    if (problem) setError(problem);
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="category-dialog-title"
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
        className="flex max-h-full w-full max-w-lg flex-col gap-4 overflow-y-auto rounded-xl bg-white p-6 shadow-xl"
      >
        <div>
          <h2 id="category-dialog-title" className="text-sm font-semibold text-gray-900">
            {editing ? "Editar categoría" : "Nueva categoría"}
          </h2>
          <p className="mt-1 text-xs text-gray-500">
            El icono ayuda a reconocer la categoría de un vistazo en la pantalla de cocina.
          </p>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-gray-600">Nombre de la categoría</span>
          <input
            ref={inputRef}
            value={name}
            maxLength={MAX_LENGTH}
            onChange={(e) => {
              setName(e.target.value);
              setError(null);
            }}
            placeholder="Ej. Postres"
            className="h-10 rounded-lg px-3 text-sm text-gray-900 ring-1 ring-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary"
          />
        </label>

        {renaming && category!.productsCount > 0 && (
          <p className="rounded-lg bg-indigo-50 px-3 py-2 text-xs text-indigo-800">
            Al guardar, {category!.productsCount === 1 ? "el platillo" : `los ${category!.productsCount} platillos`}{" "}
            de esta categoría y los filtros de cocina pasarán a llamarse "{trimmed || "…"}".
          </p>
        )}

        <div className="flex flex-col gap-2">
          <div className="flex flex-row items-center gap-3">
            <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-900 ring-1 ring-gray-200">
              <CategoryIcon name={effectiveIcon} size={32} />
            </span>
            <div className="flex min-w-0 flex-col">
              <span className="text-xs font-semibold text-gray-600">Icono: {CATEGORY_ICON_LABELS[effectiveIcon]}</span>
              <span className="text-xs text-gray-500">
                {chosenIcon === null
                  ? "Sugerido según el nombre. Elige otro si prefieres."
                  : editing && chosenIcon === category?.icon
                    ? "Icono actual. Elige otro si prefieres."
                    : "Elegido por ti."}
              </span>
            </div>
            {chosenIcon !== null && !editing && (
              <button
                type="button"
                onClick={() => setChosenIcon(null)}
                className="ml-auto rounded-lg px-3 py-1.5 text-xs font-semibold text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50"
              >
                Usar sugerido
              </button>
            )}
          </div>
          <CategoryIconPicker value={effectiveIcon} onChange={setChosenIcon} />
        </div>

        {error && (
          <p role="alert" className="rounded-[5px] border border-red-500 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
            {error}
          </p>
        )}

        <div className="flex flex-row justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-xs font-semibold text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-brand-primary px-4 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            {saving ? "Guardando…" : editing ? "Guardar cambios" : "Crear categoría"}
          </button>
        </div>
      </form>
    </div>
  );
}
