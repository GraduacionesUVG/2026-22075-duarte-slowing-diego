import type { KdsMenuItem } from "@repo/api-client";
import { CategoryIcon } from "@repo/category-icons";
import { useState } from "react";
import BoardLayout, { type ShiftBar, type ViewNav } from "../components/BoardLayout";
import DisableItemDialog from "../components/DisableItemDialog";
import { useMenuItems } from "../hooks/useMenuItems";

type MenuKDSProps = {
  localName: string;
  nav: ViewNav;
  isPaused: boolean;
  onUnauthorized: () => void;
  togglePaused: () => void;
  shiftBar?: ShiftBar;
  onLogout: () => void;
};

type CategoryGroup = { category: string; icon: string | undefined; items: KdsMenuItem[] };

function groupByCategory(items: KdsMenuItem[]): CategoryGroup[] {
  const groups = new Map<string, CategoryGroup>();
  for (const item of items) {
    const group = groups.get(item.category) ?? { category: item.category, icon: item.categoryIcon, items: [] };
    group.items.push(item);
    groups.set(item.category, group);
  }
  return [...groups.values()].sort((a, b) => a.category.localeCompare(b.category));
}

function MenuTile({
  item,
  busy,
  onToggle,
}: {
  item: KdsMenuItem;
  busy: boolean;
  onToggle: (available: boolean) => void;
}) {
  const on = item.available;
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={on}
      disabled={busy}
      onClick={() => onToggle(!on)}
      className={`kds-ring-card flex h-[88px] w-full min-w-0 select-none flex-row items-center gap-4 rounded-[20px] px-5 text-left transition disabled:opacity-60 ${
        on ? "bg-[var(--kds-card-bg)]" : "bg-[var(--tone-late-tint)]"
      }`}
    >
      <span
        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg text-white ${
          on ? "bg-kds-ontime" : "bg-kds-late"
        }`}
      >
        {/* Check / X: el ícono acompaña al color para no depender solo de él. */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-6 w-6"
          aria-hidden="true"
        >
          {on ? <path d="M5 12.5l4.5 4.5L19 7.5" /> : <path d="M6 6l12 12M18 6L6 18" />}
        </svg>
      </span>
      <span className="flex min-w-0 flex-col">
        <span
          className={`truncate text-lg font-semibold leading-6 ${
            on ? "text-black" : "text-[var(--tone-late-deep)] line-through"
          }`}
        >
          {item.name}
        </span>
        <span className="text-xs font-semibold text-gray-500">
          {on ? "DISPONIBLE" : item.inactiveMode === "daily" ? "AGOTADO · SOLO HOY" : "AGOTADO"}
        </span>
      </span>
    </button>
  );
}

// Menú: la cocina apaga los productos que no puede preparar (se acabó un ingrediente) y los
// vuelve a prender cuando hay de nuevo. Un producto apagado deja de ofrecerse en el bot.
export default function MenuKDS({
  localName,
  nav,
  isPaused,
  onUnauthorized,
  togglePaused,
  shiftBar,
  onLogout,
}: MenuKDSProps) {
  const menu = useMenuItems({ onUnauthorized });
  // Producto que se está por apagar: la cocina elige si es solo por hoy o hasta encenderlo.
  const [disabling, setDisabling] = useState<KdsMenuItem | null>(null);

  return (
    <BoardLayout
      localName={localName}
      nav={nav}
      error={menu.error}
      isPaused={isPaused}
      togglePaused={togglePaused}
      shiftBar={shiftBar}
      reload={() => void menu.reload()}
      onLogout={onLogout}
    >
      {menu.loading && menu.items.length === 0 ? (
        <p className="py-20 text-center text-lg font-semibold text-gray-500">Cargando menú…</p>
      ) : menu.items.length === 0 ? (
        <p className="py-20 text-center text-lg font-semibold text-gray-500">
          No hay productos en el menú.
        </p>
      ) : (
        <>
          {groupByCategory(menu.items).map(({ category, icon, items }) => (
            <section key={category} className="flex flex-col gap-4">
              <h2 className="flex flex-row items-center gap-3 text-lg font-semibold uppercase text-gray-900">
                <CategoryIcon name={icon} size={32} className="flex-shrink-0 text-gray-700" />
                <span>
                  {category} · {items.length}
                </span>
              </h2>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-3 lg:gap-4">
                {items.map((item) => (
                  <MenuTile
                    key={item.id}
                    item={item}
                    busy={menu.pendingIds.has(item.id)}
                    onToggle={(available) => {
                      // Encender es directo; apagar pregunta por cuánto tiempo.
                      if (available) void menu.setAvailable(item.id, true);
                      else setDisabling(item);
                    }}
                  />
                ))}
              </div>
            </section>
          ))}
        </>
      )}

      {disabling && (
        <DisableItemDialog
          itemName={disabling.name}
          onCancel={() => setDisabling(null)}
          onChoose={(mode) => {
            void menu.setAvailable(disabling.id, false, mode);
            setDisabling(null);
          }}
        />
      )}
    </BoardLayout>
  );
}
