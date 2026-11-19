import StatusBadge from "../components/StatusBadge";
import { LOG_FILTERS, useDebugConsole } from "../hooks/useDebugConsole";

const inputClass =
  "h-9 rounded-lg px-3 text-xs text-gray-900 ring-1 ring-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary";

export default function Debugging() {
  const {
    date,
    setDate,
    restaurantId,
    setRestaurantId,
    restaurants,
    live,
    loading,
    error,
    reload,
    stationRows,
    logFilter,
    setLogFilter,
    filteredLogs,
    sessions,
  } = useDebugConsole();

  return (
    <div className="flex flex-row items-start gap-6">
      <div className="flex min-w-0 flex-grow flex-col gap-6">
        {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-xs font-medium text-red-700">{error}</p>}

        <div className="flex flex-col gap-3 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <span className="text-sm font-semibold text-gray-900">Estaciones KDS</span>
          <div className="flex flex-col gap-2">
            {stationRows.map((s) => (
              <div key={s.id} className="flex flex-row items-center gap-4 rounded-lg bg-white p-4 ring-1 ring-gray-200">
                <div className="flex min-w-0 flex-grow flex-col gap-1">
                  <span className="text-sm font-semibold text-gray-900">{s.name}</span>
                  <span className="text-xs text-gray-500">{s.detail}</span>
                </div>
                <StatusBadge status={s.status} label={s.statusLabel} />
              </div>
            ))}
            {stationRows.length === 0 && (
              <span className="py-4 text-center text-xs text-gray-500">No hay estaciones registradas.</span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <div className="flex flex-row flex-wrap items-center gap-3">
            <span className="flex-grow text-sm font-semibold text-gray-900">
              Eventos de pedidos {live && <span className="ml-2 text-xs font-medium text-green-700">· en vivo</span>}
            </span>
            <input type="date" value={date} onChange={(e) => e.target.value && setDate(e.target.value)} className={inputClass} />
            <select value={restaurantId} onChange={(e) => setRestaurantId(e.target.value)} className={inputClass}>
              <option value="">Todos los restaurantes</option>
              {restaurants.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={reload}
              className="rounded-lg px-3.5 py-2 text-xs font-semibold text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50"
            >
              Actualizar
            </button>
          </div>
          <div className="flex flex-row gap-1.5">
            {LOG_FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setLogFilter(f)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                  logFilter === f ? "bg-brand-primary text-white" : "bg-white text-gray-700 ring-1 ring-gray-200"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-2">
            {filteredLogs.map((log) => (
              <div key={log.id} className="flex flex-row items-start gap-4 rounded-lg bg-gray-50 p-3.5 ring-1 ring-gray-100">
                <span className="w-16 flex-shrink-0 text-xs text-gray-500">{log.time}</span>
                <StatusBadge status={log.status} label={log.level} />
                <span className="w-36 flex-shrink-0 truncate text-xs font-medium text-gray-500">{log.service}</span>
                <span className="flex-grow text-xs leading-relaxed text-gray-900">{log.message}</span>
              </div>
            ))}
            {loading && filteredLogs.length === 0 && <span className="py-4 text-center text-xs text-gray-500">Cargando eventos…</span>}
            {!loading && filteredLogs.length === 0 && (
              <span className="py-4 text-center text-xs text-gray-500">Sin eventos para este filtro.</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex w-80 flex-shrink-0 flex-col gap-6">
        <div className="flex flex-col gap-3 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <span className="text-sm font-semibold text-gray-900">Resumen</span>
          {sessions.map((s) => (
            <div key={s.label} className="flex flex-row items-center gap-3">
              <span className="flex-grow text-xs text-gray-900">{s.label}</span>
              <span className="whitespace-nowrap text-xs font-bold text-gray-900">{s.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
