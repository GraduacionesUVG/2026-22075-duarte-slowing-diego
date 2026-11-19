import { useState, type ReactNode } from "react";
import type { AdminKdsUser } from "@repo/api-client";
import StatusBadge from "../components/StatusBadge";
import { Skeleton, SkeletonRegion, Spinner } from "../components/Skeleton";
import ToggleSwitch from "../components/ToggleSwitch";
import Toast from "../components/Toast";
import { useRestaurantSettings } from "../hooks/useRestaurantSettings";
import { useToast } from "../hooks/useToast";

type RestaurantSettingsProps = {
  localName: string;
  initialTab?: Tab;
};

const TABS = ["Horario", "Estaciones KDS", "Ubicación"] as const;
type Tab = (typeof TABS)[number];

const cardClass = "rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200";
const inputClass =
  "h-10 rounded-lg px-3 text-sm text-gray-900 ring-1 ring-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary";
const labelClass = "text-xs font-semibold text-gray-600";
const secondaryBtnClass = "inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40";
const primaryBtnClass =
  "inline-flex items-center gap-2 rounded-lg bg-brand-primary px-3.5 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40";

function BusyLabel({ busy, busyText, children }: { busy: boolean; busyText: string; children: ReactNode }) {
  return busy ? (
    <>
      <Spinner />
      {busyText}
    </>
  ) : (
    <>{children}</>
  );
}

function usePendingAction() {
  const [pending, setPending] = useState<string | null>(null);
  const run = async (key: string, action: () => Promise<unknown>) => {
    setPending(key);
    try {
      await action();
    } finally {
      setPending(null);
    }
  };
  return { pending, run };
}

function ScheduleSkeleton() {
  return (
    <SkeletonRegion label="Cargando horario…" className={cardClass + " flex max-w-[1040px] flex-col gap-1"}>
      <div className="mb-3 flex flex-row items-center gap-3">
        <Skeleton className="h-4 w-40" />
        <div className="flex-grow" />
        <Skeleton className="h-8 w-28 rounded-lg" />
      </div>
      {Array.from({ length: 7 }, (_, i) => (
        <div key={i} className="flex flex-row items-center gap-4 border-b border-gray-100 py-3 last:border-0">
          <Skeleton className="h-4 w-10" />
          <Skeleton className="h-10 w-28 rounded-lg" />
          <Skeleton className="h-10 w-28 rounded-lg" />
          <div className="flex-grow" />
          <Skeleton className="h-5 w-9 rounded-full" />
        </div>
      ))}
    </SkeletonRegion>
  );
}

function KdsSkeleton() {
  return (
    <SkeletonRegion label="Cargando estaciones…" className="flex flex-row items-start gap-6">
      <div className="flex min-w-0 flex-grow flex-col gap-4">
        <div className="flex flex-row items-center gap-3">
          <Skeleton className="h-4 w-32" />
          <div className="flex-grow" />
          <Skeleton className="h-8 w-32 rounded-lg" />
        </div>
        <div className={cardClass + " flex flex-col gap-4 !p-4"}>
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="flex flex-row items-center gap-4">
              <Skeleton className="h-4 w-1/5" />
              <Skeleton className="h-4 w-10" />
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          ))}
        </div>
      </div>
      <div className="flex w-96 flex-shrink-0 flex-col gap-5 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-10 w-28 rounded-lg" />
      </div>
    </SkeletonRegion>
  );
}

function LocationSkeleton() {
  return (
    <SkeletonRegion label="Cargando ubicación…" className={cardClass + " flex max-w-md flex-col gap-4"}>
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-3 w-3/4" />
      <Skeleton className="h-10 w-full rounded-lg" />
      <Skeleton className="h-8 w-32 rounded-lg" />
    </SkeletonRegion>
  );
}

type Settings = ReturnType<typeof useRestaurantSettings>;

const PIN_PATTERN = /^\d{4,8}$/;
const randomPin = () => String(Math.floor(1000 + Math.random() * 9000));

export default function RestaurantSettings({ localName, initialTab = "Horario" }: RestaurantSettingsProps) {
  const [tab, setTab] = useState<Tab>(initialTab);
  const toast = useToast();
  const settings = useRestaurantSettings(toast);

  return (
    <div className="flex max-w-[1200px] flex-col gap-6">
      <Toast toast={toast.toast} onDismiss={toast.dismiss} />

      <div className="flex flex-row items-center gap-3">
        <span className="flex-grow text-sm font-semibold text-gray-900">Configuración de {localName}</span>
        {settings.restaurant && (
          <StatusBadge
            status={settings.restaurant.is_open_now ? "success" : "info"}
            label={settings.restaurant.is_open_now ? "Abierto ahora" : "Cerrado ahora"}
          />
        )}
      </div>

      <div className="flex flex-row gap-2 border-b border-gray-200">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`-mb-px whitespace-nowrap rounded-t-lg px-4 py-2.5 text-xs font-semibold ${
              tab === t ? "border-b-2 border-brand-primary text-brand-primary" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {settings.error && <p className="rounded-lg bg-red-50 px-4 py-3 text-xs font-medium text-red-700">{settings.error}</p>}

      {settings.loading && tab === "Horario" && <ScheduleSkeleton />}
      {settings.loading && tab === "Estaciones KDS" && <KdsSkeleton />}
      {settings.loading && tab === "Ubicación" && <LocationSkeleton />}

      {!settings.loading && tab === "Horario" && (
        <div className={cardClass + " flex max-w-[1040px] flex-col gap-1"}>
          <div className="mb-3 flex flex-row items-center gap-3">
            <span className="flex-grow text-sm font-semibold text-gray-900">Horario de atención</span>
            <button
              type="button"
              onClick={() => void settings.saveSchedule()}
              disabled={settings.saving}
              aria-busy={settings.saving}
              className={primaryBtnClass}
            >
              <BusyLabel busy={settings.saving} busyText="Guardando…">
                Guardar horario
              </BusyLabel>
            </button>
          </div>
          {settings.schedule.map((d) => (
            <div key={d.key} className="flex flex-row items-center gap-4 border-b border-gray-100 py-3 last:border-0">
              <span className="w-10 flex-shrink-0 text-sm font-semibold text-gray-900">{d.label}</span>
              <input
                type="time"
                value={d.open}
                disabled={!d.enabled}
                onChange={(e) => settings.updateDay(d.key, { open: e.target.value })}
                className={inputClass + " disabled:opacity-40"}
              />
              <span className="text-xs text-gray-500">a</span>
              <input
                type="time"
                value={d.close}
                disabled={!d.enabled}
                onChange={(e) => settings.updateDay(d.key, { close: e.target.value })}
                className={inputClass + " disabled:opacity-40"}
              />
              {!d.enabled && <span className="text-xs text-gray-500">Cerrado</span>}
              <div className="flex-grow" />
              <button
                type="button"
                role="switch"
                aria-checked={d.enabled}
                aria-label={`${d.label} abierto`}
                onClick={() => settings.updateDay(d.key, { enabled: !d.enabled })}
                className={`flex h-5 w-9 flex-shrink-0 items-center rounded-full p-0.5 transition ${
                  d.enabled ? "justify-end bg-brand-primary" : "justify-start bg-gray-300"
                }`}
              >
                <span className="h-3.5 w-3.5 rounded-full bg-white" />
              </button>
            </div>
          ))}
        </div>
      )}

      {!settings.loading && tab === "Estaciones KDS" && <KdsUsersSection settings={settings} />}

      {!settings.loading && tab === "Ubicación" && (
        <div className={cardClass + " flex max-w-md flex-col gap-4"}>
          <span className="text-sm font-semibold text-gray-900">Ubicación del local</span>
          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>Ubicación (texto que ve el estudiante)</span>
            <input
              value={settings.location}
              onChange={(e) => settings.setLocation(e.target.value)}
              maxLength={300}
              placeholder="Ej. CIT · Nivel 1, frente a la cafetería"
              className={inputClass}
            />
          </label>
          <button
            type="button"
            onClick={() => void settings.saveLocation()}
            disabled={settings.saving || !settings.location.trim()}
            aria-busy={settings.saving}
            className={primaryBtnClass + " self-start"}
          >
            <BusyLabel busy={settings.saving} busyText="Guardando…">
              Guardar ubicación
            </BusyLabel>
          </button>
        </div>
      )}
    </div>
  );
}

function filterLabel(user: AdminKdsUser): string {
  const { mode, categories, item_ids } = user.menu_filter;
  if (mode === "all") return "Todos";
  return `${categories.length} categorías · ${item_ids.length} platillos`;
}


function KdsUsersSection({ settings }: { settings: Settings }) {
  const { kdsUsers } = settings;
  const [selection, setSelection] = useState<string | "new" | null>(null);

  const selectedUser =
    selection === "new" ? null : (kdsUsers.find((u) => u.kds_user_id === selection) ?? kdsUsers[0] ?? null);
  const creating = selection === "new" || (selectedUser === null && !settings.loading);

  return (
    <div className="flex flex-row items-start gap-6">
      <div className="flex min-w-0 flex-grow flex-col gap-4">
        <div className="flex flex-row items-center gap-3">
          <span className="flex-grow text-sm font-semibold text-gray-900">Estaciones KDS</span>
          <button type="button" onClick={() => setSelection("new")} className={primaryBtnClass}>
            Agregar estación
          </button>
        </div>
        <p className="text-xs text-gray-500">
          Cada estación entra al KDS con su usuario y PIN. Por seguridad el PIN no se puede consultar: si se
          olvida, define uno nuevo.
        </p>

        <div className={cardClass + " overflow-x-auto !p-0"}>
          <table className="w-full min-w-[520px] border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500">
                {["Usuario", "Prioridad", "Productos", "Conexión", "Estado"].map((h) => (
                  <th key={h} className="px-4 py-3 font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {kdsUsers.map((u) => {
                const selected = !creating && selectedUser?.kds_user_id === u.kds_user_id;
                return (
                  <tr
                    key={u.kds_user_id}
                    onClick={() => setSelection(u.kds_user_id)}
                    aria-selected={selected}
                    className={`cursor-pointer border-b border-gray-100 text-gray-900 last:border-0 ${
                      selected ? "bg-orange-50" : "hover:bg-gray-50"
                    }`}
                  >
                    <td className="px-4 py-3 font-medium">{u.username}</td>
                    <td className="px-4 py-3">{u.priority}</td>
                    <td className="px-4 py-3 text-gray-500">{filterLabel(u)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={u.connected ? "success" : "info"} label={u.connected ? "Conectada" : "Sin conexión"} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={u.active ? "success" : "warning"} label={u.active ? "Activa" : "Pausada"} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {kdsUsers.length === 0 && !settings.loading && (
            <p className="px-4 py-6 text-xs text-gray-500">Este local todavía no tiene estaciones KDS.</p>
          )}
        </div>
      </div>

      {creating ? (
        <KdsCreatePanel
          settings={settings}
          onCreated={(id) => setSelection(id)}
          onCancel={() => setSelection(null)}
        />
      ) : (
        selectedUser && <KdsEditPanel key={selectedUser.kds_user_id} user={selectedUser} settings={settings} />
      )}
    </div>
  );
}

const panelClass = "flex w-96 flex-shrink-0 flex-col gap-5 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200";

function KdsCreatePanel({
  settings,
  onCreated,
  onCancel,
}: {
  settings: Settings;
  onCreated: (id: string) => void;
  onCancel: () => void;
}) {
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [priority, setPriority] = useState(String(settings.kdsUsers.length + 1));

  const canCreate =
    username.trim().length >= 3 && PIN_PATTERN.test(pin) && Number(priority) >= 1 && !settings.saving;

  return (
    <div className={panelClass}>
      <span className="text-sm font-semibold text-gray-900">Nueva estación</span>

      <label className="flex flex-col gap-1.5">
        <span className={labelClass}>Usuario</span>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Mín. 3 caracteres, ej. cocina-fria"
          maxLength={40}
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className={labelClass}>PIN</span>
        <div className="flex flex-row gap-2">
          <input
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 8))}
            placeholder="4–8 dígitos"
            inputMode="numeric"
            className={inputClass + " min-w-0 flex-grow"}
          />
          <button type="button" onClick={() => setPin(randomPin())} className={secondaryBtnClass}>
            Generar PIN
          </button>
        </div>
      </label>

      <label className="flex flex-col gap-1.5">
        <span className={labelClass}>Prioridad (1 = más alta)</span>
        <input
          type="number"
          min={1}
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className={inputClass + " w-28"}
        />
      </label>

      <div className="flex flex-row gap-2">
        <button
          type="button"
          disabled={!canCreate}
          onClick={async () => {
            const created = await settings.addKdsUser(username, pin, Math.floor(Number(priority)));
            if (created) onCreated(created.kds_user_id);
          }}
          aria-busy={settings.saving}
          className={primaryBtnClass + " flex-grow justify-center !py-2.5"}
        >
          <BusyLabel busy={settings.saving} busyText="Creando…">
            Crear estación
          </BusyLabel>
        </button>
        <button type="button" onClick={onCancel} className={secondaryBtnClass + " !py-2.5"}>
          Cancelar
        </button>
      </div>
    </div>
  );
}

function KdsEditPanel({ user, settings }: { user: AdminKdsUser; settings: Settings }) {
  const [newPin, setNewPin] = useState("");
  const [priority, setPriority] = useState(String(user.priority));
  const [mode, setMode] = useState(user.menu_filter.mode);
  const [categories, setCategories] = useState<string[]>(user.menu_filter.categories);

  const { pending, run } = usePendingAction();

  const toggleCategory = (cat: string) =>
    setCategories((prev) => (prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]));

  return (
    <div className={panelClass}>
      <div className="flex flex-row items-center gap-3">
        <span className="flex-grow text-sm font-semibold text-gray-900">Editar estación · {user.username}</span>
        <StatusBadge status={user.connected ? "success" : "info"} label={user.connected ? "Conectada" : "Sin conexión"} />
      </div>

      <ToggleSwitch
        checked={user.active}
        onChange={() => void run("active", () => settings.toggleKdsActive(user))}
        busy={pending === "active"}
        label="Estación activa"
        description="Pausada no recibe pedidos nuevos"
      />

      <div className="flex flex-col gap-1.5">
        <span className={labelClass}>Nuevo PIN</span>
        <div className="flex flex-row gap-2">
          <input
            value={newPin}
            onChange={(e) => setNewPin(e.target.value.replace(/\D/g, "").slice(0, 8))}
            inputMode="numeric"
            placeholder="4–8 dígitos"
            aria-label="Nuevo PIN"
            className={inputClass + " min-w-0 flex-grow"}
          />
          <button type="button" onClick={() => setNewPin(randomPin())} className={secondaryBtnClass}>
            Generar
          </button>
        </div>
        <button
          type="button"
          disabled={!PIN_PATTERN.test(newPin) || settings.saving}
          aria-busy={pending === "pin"}
          onClick={() =>
            void run("pin", async () => {
              if (await settings.changeKdsPin(user.kds_user_id, newPin)) setNewPin("");
            })
          }
          className={primaryBtnClass + " self-start"}
        >
          <BusyLabel busy={pending === "pin"} busyText="Cambiando…">
            Cambiar PIN
          </BusyLabel>
        </button>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className={labelClass}>Prioridad (1 = más alta)</span>
        <input
          type="number"
          min={1}
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          aria-label="Prioridad"
          className={inputClass + " w-28"}
        />
        <button
          type="button"
          disabled={!(Number(priority) >= 1) || Number(priority) === user.priority || settings.saving}
          aria-busy={pending === "priority"}
          onClick={() =>
            void run("priority", () => settings.changeKdsPriority(user.kds_user_id, Math.floor(Number(priority))))
          }
          className={secondaryBtnClass + " self-start"}
        >
          <BusyLabel busy={pending === "priority"} busyText="Guardando…">
            Guardar prioridad
          </BusyLabel>
        </button>
      </div>

      <div className="flex flex-col gap-2">
        <span className={labelClass}>Productos que recibe esta estación</span>
        <div className="flex flex-row flex-wrap items-center gap-2">
          {(["all", "custom"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`rounded-lg px-3.5 py-2 text-xs font-medium ${
                mode === m ? "bg-brand-primary text-white" : "bg-white text-gray-700 ring-1 ring-gray-200"
              }`}
            >
              {m === "all" ? "Todos los productos" : "Solo algunas categorías"}
            </button>
          ))}
        </div>
        {mode === "custom" && (
          <div className="flex flex-row flex-wrap gap-2">
            {settings.categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => toggleCategory(cat)}
                className={`rounded-lg px-3.5 py-2 text-xs font-medium ${
                  categories.includes(cat) ? "bg-brand-primary text-white" : "bg-white text-gray-700 ring-1 ring-gray-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
        <button
          type="button"
          disabled={settings.saving || (mode === "custom" && categories.length === 0)}
          aria-busy={pending === "filter"}
          onClick={() =>
            void run("filter", () =>
              settings.changeKdsMenuFilter(user.kds_user_id, {
                mode,
                categories: mode === "custom" ? categories : [],
                item_ids: mode === "custom" ? user.menu_filter.item_ids : [],
              }),
            )
          }
          className={primaryBtnClass + " self-start"}
        >
          <BusyLabel busy={pending === "filter"} busyText="Guardando…">
            Guardar productos
          </BusyLabel>
        </button>
      </div>
    </div>
  );
}
