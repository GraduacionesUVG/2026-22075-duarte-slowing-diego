import { useState, type ReactNode } from "react";
import StatusBadge from "../components/StatusBadge";
import ToggleSwitch from "../components/ToggleSwitch";
import Toast from "../components/Toast";
import CategoryDialog from "../components/CategoryDialog";
import Pagination from "../components/Pagination";
import QDot from "../components/QDot";
import { Skeleton, SkeletonRegion } from "../components/Skeleton";
import { useMenuCatalog, mealPeriodLabel, MEAL_PERIODS, WEEKDAYS, type MealPeriod } from "../hooks/useMenuCatalog";
import { useToast } from "../hooks/useToast";

type MenuPricingProps = {
  localName: string;
  onGoToImport: () => void;
  onGoToCategories: () => void;
};

const fieldClass =
  "h-10 rounded-lg px-3 text-sm text-gray-900 ring-1 ring-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary";

function Section({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3 border-t border-gray-100 pt-4">
      <div className="flex flex-col gap-0.5">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">{title}</h3>
        {hint && <p className="text-xs text-gray-500">{hint}</p>}
      </div>
      {children}
    </section>
  );
}

function Field({ label, hint, className = "", children }: { label: string; hint?: string; className?: string; children: ReactNode }) {
  return (
    <label className={`flex flex-col gap-1.5 ${className}`}>
      <span className="text-xs font-semibold text-gray-600">{label}</span>
      {children}
      {hint && <span className="text-xs text-gray-500">{hint}</span>}
    </label>
  );
}

function MenuListSkeleton() {
  return (
    <SkeletonRegion label="Cargando el menú…" className="flex flex-col gap-5">
      <div className="flex flex-row flex-wrap gap-2">
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="h-9 w-24 rounded-lg" />
        ))}
      </div>
      <div className="flex flex-col gap-2">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="flex flex-row items-center gap-4 rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-200">
            <div className="flex min-w-0 flex-grow flex-col gap-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-2/3" />
            </div>
            <Skeleton className="h-4 w-24 flex-shrink-0" />
            <Skeleton className="h-4 w-14 flex-shrink-0" />
            <Skeleton className="h-6 w-16 flex-shrink-0 rounded-full" />
          </div>
        ))}
      </div>
    </SkeletonRegion>
  );
}

function EditorSkeleton() {
  return (
    <SkeletonRegion
      label="Cargando el editor…"
      className="flex w-96 flex-shrink-0 flex-col gap-5 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200"
    >
      <Skeleton className="h-4 w-1/3" />
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className="flex flex-col gap-2">
          <Skeleton className="h-3 w-1/4" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      ))}
      <Skeleton className="h-20 w-full rounded-lg" />
      <Skeleton className="h-10 w-full rounded-lg" />
    </SkeletonRegion>
  );
}

export default function MenuPricing({ localName, onGoToImport, onGoToCategories }: MenuPricingProps) {
  const toast = useToast();
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const {
    items,
    filteredCount,
    page,
    pageSize,
    setPage,
    setPageSize,
    totalItems,
    categories,
    loading,
    loadError,
    saving,
    createCategory,
    categoryFilter,
    setCategoryFilter,
    selectedId,
    selectItem,
    addItem,
    draft,
    updateDraft,
    addModifier,
    updateModifier,
    removeModifier,
    isDirty,
    saveDraft,
    cancelDraft,
  } = useMenuCatalog(toast);

  const isEmpty = !loading && !loadError && totalItems === 0;
  const isNew = draft ? draft.id.startsWith("new-") : false;

  return (
    <div className="flex flex-row items-start gap-6">
      <Toast toast={toast.toast} onDismiss={toast.dismiss} />
      {showCategoryDialog && (
        <CategoryDialog
          existing={categories}
          onClose={() => setShowCategoryDialog(false)}
          onSubmit={async ({ name, icon }) => {
            const problem = await createCategory(name, icon);
            if (!problem) setShowCategoryDialog(false);
            return problem;
          }}
        />
      )}

      <div className="flex min-w-0 flex-grow flex-col gap-5">
        <div className="flex flex-row items-center gap-3">
          <span className="flex-grow text-sm font-semibold text-gray-900">{localName} — Menú</span>
          <button
            type="button"
            onClick={() => setShowCategoryDialog(true)}
            className="rounded-lg px-3.5 py-2 text-xs font-semibold text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50"
          >
            Nueva categoría
          </button>
          <button
            type="button"
            onClick={addItem}
            className="rounded-lg bg-brand-primary px-3.5 py-2 text-xs font-semibold text-white"
          >
            Agregar platillo
          </button>
        </div>

        {loadError && <p className="rounded-lg bg-red-50 px-4 py-3 text-xs font-medium text-red-700">{loadError}</p>}

        {loading ? (
          <MenuListSkeleton />
        ) : isEmpty ? (
          <div className="flex flex-col items-center gap-4 rounded-xl bg-white p-12 text-center shadow-sm ring-1 ring-gray-200">
            <QDot className="h-12 w-12" />
            <span className="text-sm font-semibold text-gray-900">
              Este restaurante todavía no tiene menú publicado
            </span>
            <p className="max-w-[420px] text-xs leading-relaxed text-gray-500">
              Agrega platillos uno por uno o carga el catálogo completo desde un archivo
              .xlsx. El bot no ofrecerá este local hasta que exista al menos una categoría activa.
            </p>
            <div className="flex flex-row gap-2 pt-2">
              <button
                type="button"
                onClick={onGoToImport}
                className="rounded-lg px-3.5 py-2 text-xs font-semibold text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50"
              >
                Importar catálogo
              </button>
              <button
                type="button"
                onClick={addItem}
                className="rounded-lg bg-brand-primary px-3.5 py-2 text-xs font-semibold text-white"
              >
                Agregar platillo
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            <div className="flex flex-row flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setCategoryFilter(null)}
                className={`rounded-lg px-3.5 py-2 text-xs font-medium ${
                  categoryFilter === null ? "bg-brand-primary text-white" : "bg-white text-gray-700 ring-1 ring-gray-200"
                }`}
              >
                Todas
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  className={`rounded-lg px-3.5 py-2 text-xs font-medium ${
                    categoryFilter === cat ? "bg-brand-primary text-white" : "bg-white text-gray-700 ring-1 ring-gray-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-2">
              {items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => selectItem(item.id)}
                  className={`flex flex-row items-center gap-4 rounded-lg bg-white p-4 text-left shadow-sm ring-1 ${
                    item.id === selectedId ? "ring-2 ring-brand-primary" : "ring-gray-200"
                  }`}
                >
                  <div className="flex min-w-0 flex-grow flex-col gap-1">
                    <span className="text-sm font-semibold text-gray-900">
                      {item.name || "Platillo sin nombre"}
                      {item.code && <span className="ml-2 text-xs font-medium text-gray-400">{item.code}</span>}
                    </span>
                    <span className="text-xs text-gray-500">{item.description || "Sin descripción"}</span>
                  </div>
                  <div className="flex w-32 flex-shrink-0 flex-col gap-0.5">
                    <span className="text-xs text-gray-500">{item.category}</span>
                    {item.mealPeriod && (
                      <span className="text-xs font-medium text-gray-400">{mealPeriodLabel(item.mealPeriod)}</span>
                    )}
                  </div>
                  <span className="w-20 flex-shrink-0 text-xs font-bold text-gray-900">
                    {item.price ? `Q${item.price}` : "—"}
                  </span>
                  <StatusBadge status={item.status} label={item.statusLabel} />
                </button>
              ))}
            </div>

            {filteredCount > 10 && (
              <Pagination
                page={page}
                pageSize={pageSize}
                total={filteredCount}
                noun="platillos"
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
              />
            )}
          </div>
        )}
      </div>

      {loading && !draft && <EditorSkeleton />}

      {draft && (
        <div className="flex w-96 flex-shrink-0 flex-col gap-5 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <div className="flex flex-row items-center gap-3">
            <span className="flex-grow text-sm font-semibold text-gray-900">
              {isNew ? "Nuevo platillo" : "Editar platillo"}
            </span>
            {isDirty && <StatusBadge status="info" label="Sin guardar" />}
          </div>

          <Section title="Básico">
            <Field label="Nombre del producto">
              <input value={draft.name} onChange={(e) => updateDraft({ name: e.target.value })} className={fieldClass} />
            </Field>

            <div className="flex flex-row gap-3">
              <Field
                label="Código"
                hint={isNew ? "Opcional. Vacío = se genera." : "Único en el restaurante."}
                className="w-32 flex-shrink-0"
              >
                <input
                  value={draft.code}
                  onChange={(e) => updateDraft({ code: e.target.value.toUpperCase() })}
                  placeholder="HAMB-01"
                  className={fieldClass}
                />
              </Field>
              <Field label="Precio (Q)" className="flex-grow">
                <input
                  value={draft.price}
                  onChange={(e) => updateDraft({ price: e.target.value })}
                  placeholder="25.00"
                  inputMode="decimal"
                  className={fieldClass}
                />
              </Field>
            </div>

            <Field label="Categoría">
              <select
                value={draft.category}
                onChange={(e) => updateDraft({ category: e.target.value })}
                className={fieldClass}
              >
                {[...new Set([draft.category, ...categories].filter(Boolean))].map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </Field>
            <button
              type="button"
              onClick={onGoToCategories}
              className="self-start text-xs font-semibold text-brand-primary hover:underline"
            >
              Cambiar el nombre o icono de las categorías →
            </button>

            <Field label="Descripción">
              <textarea
                value={draft.description}
                onChange={(e) => updateDraft({ description: e.target.value })}
                rows={3}
                className="resize-none rounded-lg p-3 text-sm text-gray-900 ring-1 ring-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </Field>
          </Section>

          <Section title="Cuándo se ofrece">
            <Field label="Periodo">
              <select
                value={draft.mealPeriod}
                onChange={(e) => updateDraft({ mealPeriod: e.target.value as MealPeriod })}
                className={fieldClass}
              >
                {MEAL_PERIODS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </Field>

            <div className="flex flex-col gap-3">
              <ToggleSwitch
                checked={draft.scheduleType !== "always"}
                onChange={(checked) =>
                  updateDraft({
                    scheduleType: checked ? "date" : "always",
                    ...(checked ? {} : { serveDate: "", dayOfWeek: "" }),
                  })
                }
                label="Platillo programado"
                description="Solo se ofrece en una fecha o día concreto, no todos los días"
              />
              {draft.scheduleType !== "always" && (
                <div className="flex flex-col gap-3 rounded-lg bg-gray-50 p-3 ring-1 ring-gray-200">
                  <div className="flex flex-row gap-2">
                    {(
                      [
                        ["date", "Una fecha"],
                        ["weekly", "Cada semana"],
                      ] as const
                    ).map(([type, label]) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => updateDraft({ scheduleType: type })}
                        className={`flex-grow rounded-lg px-3 py-2 text-xs font-medium ${
                          draft.scheduleType === type
                            ? "bg-brand-primary text-white"
                            : "bg-white text-gray-700 ring-1 ring-gray-200"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  {draft.scheduleType === "date" ? (
                    <Field label="Fecha">
                      <input
                        type="date"
                        value={draft.serveDate}
                        onChange={(e) => updateDraft({ serveDate: e.target.value })}
                        className={fieldClass + " bg-white"}
                      />
                    </Field>
                  ) : (
                    <Field label="Día de la semana">
                      <select
                        value={draft.dayOfWeek}
                        onChange={(e) => updateDraft({ dayOfWeek: e.target.value })}
                        className={fieldClass + " bg-white"}
                      >
                        <option value="">Elige un día…</option>
                        {WEEKDAYS.map((d) => (
                          <option key={d.value} value={d.value}>
                            {d.label}
                          </option>
                        ))}
                      </select>
                    </Field>
                  )}
                </div>
              )}
            </div>

            <Field label="Hora límite para pedirlo" hint="Opcional. Después de esa hora ya no se ofrece ese día.">
              <input
                type="time"
                value={draft.orderCutoff}
                onChange={(e) => updateDraft({ orderCutoff: e.target.value })}
                className={fieldClass}
              />
            </Field>
          </Section>

          <Section title="Cocina">
            <div className="flex flex-row gap-3">
              <Field label="Minutos de preparación" hint="Por unidad." className="w-1/2">
                <input
                  value={draft.prepTime}
                  onChange={(e) => updateDraft({ prepTime: e.target.value })}
                  inputMode="decimal"
                  placeholder="5"
                  className={fieldClass}
                />
              </Field>
              <Field label="Porciones por día" hint="Vacío = sin límite." className="w-1/2">
                <input
                  value={draft.dailyStock}
                  onChange={(e) => updateDraft({ dailyStock: e.target.value.replace(/[^\d]/g, "") })}
                  inputMode="numeric"
                  placeholder="Sin límite"
                  className={fieldClass}
                />
              </Field>
            </div>
            <Field label="Listo desde" hint="Opcional. Se le avisa al estudiante que estará listo aprox. desde esa hora.">
              <input
                type="time"
                value={draft.readyFrom}
                onChange={(e) => updateDraft({ readyFrom: e.target.value })}
                className={fieldClass}
              />
            </Field>
          </Section>

          <Section title="Modificadores" hint="Extras que el cliente puede agregar. El monto se suma al precio del platillo.">
            <div className="flex flex-col gap-2">
              {draft.modifiers.map((mod) => (
                <div
                  key={mod.id}
                  className="flex w-full flex-row items-center gap-2 rounded-lg bg-gray-50 py-1.5 pl-3 pr-1.5 ring-1 ring-gray-200"
                >
                  <div className="flex min-w-0 flex-grow flex-col">
                    {mod.group && (
                      <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                        {mod.group}
                      </span>
                    )}
                    <input
                      value={mod.label}
                      onChange={(e) => updateModifier(mod.id, { label: e.target.value })}
                      placeholder="Nombre"
                      aria-label="Nombre del modificador"
                      className="min-w-0 bg-transparent text-xs font-medium text-gray-900 outline-none"
                    />
                  </div>
                  <span className="text-xs text-gray-400">+ Q</span>
                  <input
                    value={mod.price}
                    onChange={(e) => updateModifier(mod.id, { price: e.target.value })}
                    placeholder="0.00"
                    inputMode="decimal"
                    aria-label={`Costo extra de ${mod.label || "modificador"}`}
                    className="w-16 flex-shrink-0 bg-transparent text-right text-xs text-gray-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => removeModifier(mod.id)}
                    aria-label="Quitar modificador"
                    className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addModifier}
                className="w-full rounded-lg px-3 py-2 text-xs font-semibold text-brand-primary ring-1 ring-gray-200 hover:bg-gray-50"
              >
                + Agregar modificador
              </button>
            </div>
          </Section>

          <Section title="Disponibilidad">
            <ToggleSwitch
              checked={draft.active}
              onChange={(checked) => updateDraft({ active: checked })}
              label="Platillo disponible"
              description="Inactivo se oculta del menú del bot"
            />
            <ToggleSwitch
              checked={draft.dineInOnly}
              onChange={(checked) => updateDraft({ dineInOnly: checked })}
              label="Solo en el local"
              description="No se ofrece por WhatsApp; solo se vende en mostrador"
            />
          </Section>

          <div className="flex flex-row gap-2">
            <button
              type="button"
              onClick={() => void saveDraft()}
              disabled={!isDirty || saving}
              className="flex-grow rounded-lg bg-brand-primary py-2.5 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              {saving ? "Guardando…" : "Guardar cambios"}
            </button>
            <button
              type="button"
              onClick={cancelDraft}
              className="rounded-lg px-4 py-2.5 text-xs font-semibold text-gray-700 ring-1 ring-gray-200"
            >
              Cancelar
            </button>
          </div>
          <p className="text-xs leading-relaxed text-gray-500">
            Desactivar un platillo lo retira del menú del bot. El historial
            de pedidos no se altera.
          </p>
        </div>
      )}
    </div>
  );
}
