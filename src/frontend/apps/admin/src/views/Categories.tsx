import { useEffect, useState } from "react";
import { CategoryIcon } from "@repo/category-icons";
import CategoryDialog from "../components/CategoryDialog";
import { Skeleton, SkeletonRegion } from "../components/Skeleton";
import Toast from "../components/Toast";
import QDot from "../components/QDot";
import { useCategories, type Category, type CategoryInUse } from "../hooks/useCategories";
import { useToast } from "../hooks/useToast";

type CategoriesProps = {
  localName: string;
};

function CategoryCardsSkeleton() {
  return (
    <SkeletonRegion label="Cargando categorías…" className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="flex flex-col gap-4 rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
          <div className="flex flex-row items-center gap-4">
            <Skeleton className="h-14 w-14 flex-shrink-0 rounded-xl" />
            <div className="flex flex-grow flex-col gap-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
          <div className="flex flex-row gap-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      ))}
    </SkeletonRegion>
  );
}

function DeleteDialog({
  category,
  inUse,
  error,
  busy,
  onConfirm,
  onClose,
}: {
  category: Category;
  inUse: CategoryInUse | null;
  error: string | null;
  busy: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-category-title"
        onClick={(e) => e.stopPropagation()}
        className="flex w-full max-w-sm flex-col gap-4 rounded-xl bg-white p-6 shadow-xl"
      >
        <h2 id="delete-category-title" className="text-sm font-semibold text-gray-900">
          {inUse ? `No se puede eliminar "${category.name}"` : `¿Eliminar "${category.name}"?`}
        </h2>
        {inUse ? (
          <div className="flex flex-col gap-2 text-xs text-gray-600">
            <p>Todavía tiene {inUse.products.length === 1 ? "un platillo" : `${inUse.products.length} platillos`}. Muévelos a otra categoría o elimínalos primero:</p>
            <ul className="max-h-40 list-disc overflow-y-auto pl-5 font-medium text-gray-800">
              {inUse.products.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-xs text-gray-600">Esta categoría no tiene platillos. Esta acción no se puede deshacer.</p>
        )}
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
            {inUse ? "Entendido" : "Cancelar"}
          </button>
          {!inUse && (
            <button
              type="button"
              onClick={onConfirm}
              disabled={busy}
              className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              {busy ? "Eliminando…" : "Eliminar"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Categories({ localName }: CategoriesProps) {
  const toast = useToast();
  const { categories, names, loading, loadError, reload, create, update, remove } = useCategories(toast);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);
  const [inUse, setInUse] = useState<CategoryInUse | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const closeDelete = () => {
    setDeleting(null);
    setInUse(null);
    setDeleteError(null);
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeleteBusy(true);
    const result = await remove(deleting.name);
    setDeleteBusy(false);
    if (result === null) closeDelete();
    else if ("inUse" in result) setInUse(result.inUse);
    else setDeleteError(result.error);
  };

  const isEmpty = !loading && !loadError && categories.length === 0;

  return (
    <div className="flex flex-col gap-5">
      <Toast toast={toast.toast} onDismiss={toast.dismiss} />

      {creating && (
        <CategoryDialog
          existing={names}
          onClose={() => setCreating(false)}
          onSubmit={async ({ name, icon }) => {
            const problem = await create(name, icon);
            if (!problem) setCreating(false);
            return problem;
          }}
        />
      )}
      {editing && (
        <CategoryDialog
          existing={names}
          category={editing}
          onClose={() => setEditing(null)}
          onSubmit={async ({ name, icon }) => {
            const patch: { name?: string; icon?: string } = {};
            if (name !== editing.name) patch.name = name;
            if (icon && icon !== editing.icon) patch.icon = icon;
            if (Object.keys(patch).length === 0) {
              setEditing(null);
              return null;
            }
            const problem = await update(editing.name, patch);
            if (!problem) setEditing(null);
            return problem;
          }}
        />
      )}
      {deleting && (
        <DeleteDialog
          category={deleting}
          inUse={inUse}
          error={deleteError}
          busy={deleteBusy}
          onConfirm={() => void confirmDelete()}
          onClose={closeDelete}
        />
      )}

      <div className="flex flex-row items-center gap-3">
        <div className="flex flex-grow flex-col">
          <span className="text-sm font-semibold text-gray-900">{localName} — Categorías</span>
          <span className="text-xs text-gray-500">
            Cada categoría lleva un icono que se muestra en la pantalla de cocina para reconocerla de un vistazo.
          </span>
        </div>
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="rounded-lg bg-brand-primary px-3.5 py-2 text-xs font-semibold text-white"
        >
          Nueva categoría
        </button>
      </div>

      {loadError && (
        <div className="flex flex-row items-center gap-3 rounded-lg bg-red-50 px-4 py-3 text-xs font-medium text-red-700">
          <span className="flex-grow">{loadError}</span>
          <button
            type="button"
            onClick={() => void reload()}
            className="rounded-lg px-3 py-1.5 font-semibold ring-1 ring-red-300 hover:bg-red-100"
          >
            Reintentar
          </button>
        </div>
      )}

      {loading ? (
        <CategoryCardsSkeleton />
      ) : isEmpty ? (
        <div className="flex flex-col items-center gap-4 rounded-xl bg-white p-12 text-center shadow-sm ring-1 ring-gray-200">
          <QDot className="h-12 w-12" />
          <span className="text-sm font-semibold text-gray-900">Todavía no hay categorías</span>
          <p className="max-w-[420px] text-xs leading-relaxed text-gray-500">
            Crea la primera para agrupar tus platillos (ej. Bebidas, Postres). También se crean solas al importar el
            catálogo.
          </p>
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="rounded-lg bg-brand-primary px-3.5 py-2 text-xs font-semibold text-white"
          >
            Nueva categoría
          </button>
        </div>
      ) : (
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4">
          {categories.map((category) => (
            <li
              key={category.name}
              className="flex flex-col gap-4 rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200"
            >
              <div className="flex flex-row items-center gap-4">
                <span className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-gray-50 text-gray-900 ring-1 ring-gray-200">
                  <CategoryIcon name={category.icon} size={36} />
                </span>
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-sm font-semibold text-gray-900">{category.name}</span>
                  <span className="text-xs text-gray-500">
                    {category.productsCount === 1 ? "1 platillo" : `${category.productsCount} platillos`}
                  </span>
                </div>
              </div>
              <div className="flex flex-row gap-2">
                <button
                  type="button"
                  onClick={() => setEditing(category)}
                  aria-label={`Editar la categoría ${category.name}`}
                  className="rounded-lg px-3.5 py-1.5 text-xs font-semibold text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => setDeleting(category)}
                  aria-label={`Eliminar la categoría ${category.name}`}
                  className="rounded-lg px-3.5 py-1.5 text-xs font-semibold text-red-700 ring-1 ring-gray-200 hover:bg-red-50"
                >
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
