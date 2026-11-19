import { useCallback, useEffect, useMemo, useState } from "react";
import { adminApi, type AdminMenuItem } from "@repo/api-client";
import type { BadgeStatus } from "../components/StatusBadge";
import type { Notifier } from "./useToast";

export type Modifier = {
  id: string;
  label: string;
  // Texto del input, sin símbolo de moneda (ej. "4.00"). Es el costo extra que se suma al platillo.
  price: string;
  // Grupo con el que viene del backend (ej. "Extras", "Quitar"). No se edita, pero se conserva al guardar.
  group: string | null;
};

export type ScheduleType = "always" | "weekly" | "date";

export type MealPeriod = "" | "desayuno" | "almuerzo" | "cena";

export const MEAL_PERIODS: { value: MealPeriod; label: string }[] = [
  { value: "", label: "Sin definir" },
  { value: "desayuno", label: "Desayuno" },
  { value: "almuerzo", label: "Almuerzo" },
  { value: "cena", label: "Cena" },
];

export const mealPeriodLabel = (value: string | null | undefined): string =>
  MEAL_PERIODS.find((p) => p.value === value)?.label ?? "";

export const WEEKDAYS: { value: string; label: string }[] = [
  { value: "monday", label: "Lunes" },
  { value: "tuesday", label: "Martes" },
  { value: "wednesday", label: "Miércoles" },
  { value: "thursday", label: "Jueves" },
  { value: "friday", label: "Viernes" },
  { value: "saturday", label: "Sábado" },
  { value: "sunday", label: "Domingo" },
];

export type MenuItem = {
  id: string;
  // Identificador del producto en el restaurante (ej. HAMB-01). Vacío en un platillo nuevo = se genera.
  code: string;
  name: string;
  description: string;
  category: string;
  // Texto del input, sin símbolo de moneda (ej. "48.00").
  price: string;
  active: boolean;
  // Programado = solo se ofrece en una fecha o día de la semana (si no, "always").
  scheduleType: ScheduleType;
  dayOfWeek: string;
  serveDate: string; // YYYY-MM-DD
  // Momento del día en que se ofrece (desayuno, almuerzo o cena). Vacío = sin definir.
  mealPeriod: MealPeriod;
  // Textos de los inputs. Minutos para preparar una unidad (default 5).
  prepTime: string;
  // HH:MM. Se le avisa al estudiante que está listo aprox. desde esa hora.
  readyFrom: string;
  // HH:MM. Después de esa hora ya no se ofrece el platillo ese día.
  orderCutoff: string;
  // Porciones por día; vacío = sin límite.
  dailyStock: string;
  // Promoción solo válida en el local (no se pide por WhatsApp).
  dineInOnly: boolean;
  status: BadgeStatus;
  statusLabel: string;
  modifiers: Modifier[];
};

// Los ids que crea el front (todavía no existen en el backend) llevan este prefijo.
const LOCAL_PREFIX = "new-";

let localSeq = 0;
function newLocalId(prefix = LOCAL_PREFIX) {
  localSeq += 1;
  return `${prefix}${localSeq}`;
}

const isLocalId = (id: string) => id.startsWith(LOCAL_PREFIX) || id.startsWith("mod-");

function statusOf(item: { active: boolean; scheduleType: string }): Pick<MenuItem, "status" | "statusLabel"> {
  if (!item.active) return { status: "error", statusLabel: "Inactivo" };
  if (item.scheduleType !== "always") return { status: "info", statusLabel: "Programado" };
  return { status: "success", statusLabel: "Activo" };
}

function toMealPeriod(value: string | null): MealPeriod {
  return MEAL_PERIODS.some((p) => p.value === value && p.value !== "") ? (value as MealPeriod) : "";
}

function toMenuItem(dto: AdminMenuItem): MenuItem {
  return {
    id: dto.id,
    code: dto.code ?? "",
    name: dto.name,
    description: dto.description ?? "",
    category: dto.category,
    price: dto.price.toFixed(2),
    active: dto.available,
    scheduleType: (["weekly", "date"].includes(dto.schedule_type) ? dto.schedule_type : "always") as ScheduleType,
    dayOfWeek: dto.day_of_week ?? "",
    serveDate: dto.serve_date ?? "",
    mealPeriod: toMealPeriod(dto.meal_period),
    prepTime: String(dto.prep_time_minutes ?? 5),
    readyFrom: dto.ready_from ?? "",
    orderCutoff: dto.order_cutoff ?? "",
    dailyStock: dto.daily_stock != null ? String(dto.daily_stock) : "",
    dineInOnly: Boolean(dto.dine_in_only),
    ...statusOf({ active: dto.available, scheduleType: dto.schedule_type }),
    modifiers: dto.modifiers.map((m) => ({
      id: m.id ?? newLocalId("mod-"),
      label: m.name,
      price: m.price.toFixed(2),
      group: m.group ?? null,
    })),
  };
}

// "Q4.00", "+4", "4,50" -> 4. Devuelve null si no es un número válido.
function parsePrice(raw: string): number | null {
  const cleaned = raw.replace(/^\+?\s*Q?\s*/i, "").replace(",", ".").trim();
  if (cleaned === "") return null;
  const value = Number(cleaned);
  return Number.isFinite(value) && value >= 0 ? value : null;
}

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

function validate(draft: MenuItem): string | null {
  if (!draft.name.trim()) return "El platillo necesita un nombre.";
  if (!draft.category.trim()) return "Elige o escribe una categoría.";
  if (parsePrice(draft.price) === null) return "El precio debe ser un número (ej. 48.00).";
  if (draft.scheduleType === "date" && !draft.serveDate) return "Elige la fecha en que se ofrece el platillo.";
  if (draft.scheduleType === "weekly" && !draft.dayOfWeek) return "Elige el día de la semana en que se ofrece.";
  const prep = Number(draft.prepTime.replace(",", "."));
  if (draft.prepTime.trim() === "" || !Number.isFinite(prep) || prep < 0) {
    return "El tiempo de preparación debe ser un número de minutos (ej. 5).";
  }
  if (draft.readyFrom && !TIME_RE.test(draft.readyFrom)) return 'La hora "listo desde" debe tener formato HH:MM.';
  if (draft.orderCutoff && !TIME_RE.test(draft.orderCutoff)) return 'La hora límite de pedido debe tener formato HH:MM.';
  if (draft.dailyStock.trim() !== "") {
    const stock = Number(draft.dailyStock);
    if (!Number.isInteger(stock) || stock < 1) return "Las porciones por día deben ser un entero de 1 o más (o déjalo vacío).";
  }
  for (const m of draft.modifiers) {
    if (!m.label.trim()) return "Todos los modificadores necesitan nombre (o quítalos).";
    if (parsePrice(m.price || "0") === null) return `El precio del modificador "${m.label}" no es válido.`;
  }
  return null;
}

function toPayload(draft: MenuItem) {
  return {
    // Un platillo nuevo sin código: el backend genera uno. Uno existente conserva el suyo.
    code: draft.code.trim() || null,
    name: draft.name.trim(),
    category: draft.category.trim(),
    description: draft.description.trim() || null,
    price: parsePrice(draft.price)!,
    available: draft.active,
    schedule_type: draft.scheduleType,
    day_of_week: draft.scheduleType === "weekly" ? draft.dayOfWeek : null,
    serve_date: draft.scheduleType === "date" ? draft.serveDate : null,
    meal_period: draft.mealPeriod || null,
    prep_time_minutes: Number(draft.prepTime.replace(",", ".")),
    ready_from: draft.readyFrom || null,
    order_cutoff: draft.orderCutoff || null,
    daily_stock: draft.dailyStock.trim() === "" ? null : Number(draft.dailyStock),
    dine_in_only: draft.dineInOnly,
    modifiers: draft.modifiers.map((m) => ({
      ...(m.id.startsWith("mod-") ? {} : { id: m.id }),
      // Sin esto el backend borraría el grupo (Extras, Quitar…) al editar un platillo.
      group: m.group,
      name: m.label.trim(),
      price: parsePrice(m.price || "0")!,
    })),
  };
}

function errorText(e: unknown, fallback: string): string {
  return e instanceof Error && e.message ? e.message : fallback;
}

export function useMenuCatalog(notify: Notifier) {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [serverCategories, setServerCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [categoryFilter, setCategoryFilterState] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(10);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<MenuItem | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [menu, categories] = await Promise.all([adminApi.listMenu(), adminApi.listCategories()]);
      const mapped = menu.map(toMenuItem);
      setItems(mapped);
      setServerCategories(categories);
      setLoadError(null);
      setSelectedId((prev) => (prev && mapped.some((i) => i.id === prev) ? prev : (mapped[0]?.id ?? null)));
      setDraft((prev) => prev ?? mapped[0] ?? null);
    } catch (e) {
      setLoadError(errorText(e, "No se pudo cargar el menú."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const categories = useMemo(() => {
    const all = new Set([...serverCategories, ...items.map((i) => i.category).filter(Boolean)]);
    return [...all].sort((a, b) => a.localeCompare(b));
  }, [serverCategories, items]);

  const visibleItems = useMemo(
    () => (categoryFilter ? items.filter((item) => item.category === categoryFilter) : items),
    [items, categoryFilter],
  );

  // Al cambiar de categoría o de tamaño de página se vuelve a la primera página.
  const setCategoryFilter = useCallback((category: string | null) => {
    setCategoryFilterState(category);
    setPage(1);
  }, []);

  const setPageSize = useCallback((size: number) => {
    setPageSizeState(size);
    setPage(1);
  }, []);

  const totalPages = Math.max(1, Math.ceil(visibleItems.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedItems = useMemo(
    () => visibleItems.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [visibleItems, currentPage, pageSize],
  );

  const selectItem = useCallback(
    (id: string) => {
      setSelectedId(id);
      setDraft(items.find((item) => item.id === id) ?? null);
    },
    [items],
  );

  const addItem = useCallback(() => {
    const blank: MenuItem = {
      id: newLocalId(),
      code: "",
      name: "",
      description: "",
      category: categoryFilter ?? categories[0] ?? "",
      price: "",
      active: true,
      scheduleType: "always",
      dayOfWeek: "",
      serveDate: "",
      mealPeriod: "",
      prepTime: "5",
      readyFrom: "",
      orderCutoff: "",
      dailyStock: "",
      dineInOnly: false,
      status: "success",
      statusLabel: "Activo",
      modifiers: [],
    };
    setItems((prev) => [blank, ...prev]);
    // El platillo nuevo se agrega al inicio de la lista: se va a la primera página para verlo.
    setPage(1);
    setSelectedId(blank.id);
    setDraft(blank);
  }, [categoryFilter, categories]);

  // Crea la categoría en el backend. Devuelve null si salió bien o el mensaje de error.
  const createCategory = useCallback(
    async (name: string, icon: string | null = null): Promise<string | null> => {
      try {
        const created = await adminApi.createCategory(name, icon);
        setServerCategories((prev) => (prev.includes(created.name) ? prev : [...prev, created.name]));
        // Un platillo nuevo (sin guardar) queda con la categoría recién creada; uno que ya existe no se toca.
        setDraft((prev) => (prev && isLocalId(prev.id) ? { ...prev, category: created.name } : prev));
        notify.success(`Categoría "${created.name}" creada.`);
        return null;
      } catch (e) {
        return errorText(e, "No se pudo crear la categoría.");
      }
    },
    [notify],
  );

  const updateDraft = useCallback((patch: Partial<MenuItem>) => {
    setDraft((prev) => (prev ? { ...prev, ...patch } : prev));
  }, []);

  const addModifier = useCallback(() => {
    setDraft((prev) =>
      prev
        ? { ...prev, modifiers: [...prev.modifiers, { id: newLocalId("mod-"), label: "", price: "", group: null }] }
        : prev,
    );
  }, []);

  const updateModifier = useCallback((modifierId: string, patch: Partial<Modifier>) => {
    setDraft((prev) =>
      prev
        ? { ...prev, modifiers: prev.modifiers.map((m) => (m.id === modifierId ? { ...m, ...patch } : m)) }
        : prev,
    );
  }, []);

  const removeModifier = useCallback((modifierId: string) => {
    setDraft((prev) => (prev ? { ...prev, modifiers: prev.modifiers.filter((m) => m.id !== modifierId) } : prev));
  }, []);

  const isDirty = useMemo(() => {
    if (!draft) return false;
    // Un platillo nuevo siempre se puede guardar, aunque no se haya tocado nada.
    if (isLocalId(draft.id)) return true;
    const original = items.find((item) => item.id === selectedId);
    return JSON.stringify(original) !== JSON.stringify(draft);
  }, [items, selectedId, draft]);

  const saveDraft = useCallback(async () => {
    if (!draft || saving) return;
    const problem = validate(draft);
    if (problem) {
      notify.error(problem);
      return;
    }
    const isNew = isLocalId(draft.id);
    setSaving(true);
    try {
      const saved = toMenuItem(
        isNew
          ? await adminApi.createMenuItem(toPayload(draft))
          : await adminApi.updateMenuItem(draft.id, toPayload(draft)),
      );
      setItems((prev) => prev.map((item) => (item.id === draft.id ? saved : item)));
      setSelectedId(saved.id);
      setDraft(saved);
      notify.success(isNew ? `Platillo "${saved.name}" creado.` : `Cambios en "${saved.name}" guardados.`);
    } catch (e) {
      const name = draft.name.trim() || "el platillo";
      notify.error(`No se pudo ${isNew ? "crear" : "guardar"} ${name}: ${errorText(e, "error desconocido")}`);
    } finally {
      setSaving(false);
    }
  }, [draft, saving, notify]);

  const cancelDraft = useCallback(() => {
    if (draft && isLocalId(draft.id)) {
      // Platillo nuevo que no se guardó: se descarta.
      const rest = items.filter((item) => item.id !== draft.id);
      setItems(rest);
      setSelectedId(rest[0]?.id ?? null);
      setDraft(rest[0] ?? null);
      return;
    }
    setDraft(items.find((item) => item.id === selectedId) ?? null);
  }, [draft, items, selectedId]);

  return {
    items: pagedItems,
    filteredCount: visibleItems.length,
    page: currentPage,
    pageSize,
    setPage,
    setPageSize,
    totalItems: items.length,
    categories,
    loading,
    loadError,
    saving,
    reload: load,
    categoryFilter,
    setCategoryFilter,
    selectedId,
    selectItem,
    addItem,
    createCategory,
    draft,
    updateDraft,
    addModifier,
    updateModifier,
    removeModifier,
    isDirty,
    saveDraft,
    cancelDraft,
  };
}
