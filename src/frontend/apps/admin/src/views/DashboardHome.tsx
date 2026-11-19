import KPICard from "../components/KPICard";
import { Skeleton, SkeletonRegion, Spinner } from "../components/Skeleton";
import { RANGES, useDashboardMetrics } from "../hooks/useDashboardMetrics";

const ORDERS_HEADER = ["Pedido", "Cliente", "Total", "Estado"];

function KpiRowSkeleton() {
  return (
    <SkeletonRegion label="Cargando métricas…" className="flex flex-row flex-wrap gap-5">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="flex w-64 flex-shrink-0 flex-col gap-3 rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
          <Skeleton className="h-3 w-2/3" />
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-3 w-3/4" />
        </div>
      ))}
    </SkeletonRegion>
  );
}

function HourlySkeleton() {
  const heights = [40, 65, 90, 55, 75, 35, 60, 45];
  return (
    <SkeletonRegion label="Cargando pedidos por hora…" className="flex h-48 flex-row items-end gap-2.5">
      {heights.map((h, i) => (
        <div key={i} className="flex h-full flex-grow basis-0 flex-col items-center justify-end gap-2">
          <div className="flex w-full flex-grow items-end">
            <Skeleton className="w-full rounded-t" style={{ height: `${h}%` }} />
          </div>
          <Skeleton className="h-3 w-8" />
        </div>
      ))}
    </SkeletonRegion>
  );
}

function DishesSkeleton() {
  return (
    <SkeletonRegion label="Cargando demanda…" className="flex flex-col gap-4">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="flex flex-col gap-2">
          <div className="flex flex-row gap-3">
            <Skeleton className="h-3 flex-grow" />
            <Skeleton className="h-3 w-6" />
          </div>
          <Skeleton className="h-1.5 w-full rounded-full" />
        </div>
      ))}
    </SkeletonRegion>
  );
}

function OrdersSkeleton() {
  return (
    <SkeletonRegion label="Cargando pedidos…" className="flex flex-col gap-3 py-2">
      {Array.from({ length: 5 }, (_, i) => (
        <Skeleton key={i} className="h-4 w-full" />
      ))}
    </SkeletonRegion>
  );
}

export default function DashboardHome() {
  const {
    kpis,
    hourly,
    peakLabel,
    topDishes,
    staffingNote,
    recentOrders,
    range,
    setRange,
    rangeLabel,
    loading,
    initialLoading,
    error,
    reload,
  } = useDashboardMetrics();

  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-row items-center gap-2">
        {RANGES.map((r) => (
          <button
            key={r.key}
            type="button"
            onClick={() => setRange(r.key)}
            className={`rounded-lg px-3.5 py-2 text-xs font-medium ${
              range === r.key ? "bg-brand-primary text-white" : "bg-white text-gray-700 ring-1 ring-gray-200"
            }`}
          >
            {r.label}
          </button>
        ))}
        <div className="flex-grow" />
        <button
          type="button"
          onClick={() => void reload()}
          disabled={loading}
          aria-busy={loading}
          className="flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50 disabled:cursor-wait disabled:opacity-60"
        >
          {loading && <Spinner />}
          {loading ? "Actualizando…" : "Actualizar"}
        </button>
      </div>

      {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-xs font-medium text-red-700">{error}</p>}

      {initialLoading ? (
        <KpiRowSkeleton />
      ) : (
        <div className={`flex flex-row flex-wrap gap-5 transition-opacity ${loading ? "opacity-60" : ""}`}>
          {kpis.map((kpi) => (
            <KPICard key={kpi.label} {...kpi} />
          ))}
        </div>
      )}

      <div className="flex flex-row items-stretch gap-6">
        <div className="flex min-w-0 flex-grow flex-col gap-5 rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
          <div className="flex flex-row items-center gap-3">
            <span className="flex-grow text-sm font-semibold text-gray-900">Pedidos por hora — {rangeLabel}</span>
            <span className="whitespace-nowrap text-xs text-gray-500">{peakLabel}</span>
          </div>
          {initialLoading && <HourlySkeleton />}
          {!initialLoading && hourly.length === 0 && (
            <p className="py-16 text-center text-xs text-gray-500">Sin pedidos en este período.</p>
          )}
          <div className={`flex h-48 flex-row items-end gap-2.5 ${hourly.length === 0 ? "hidden" : ""} ${loading ? "opacity-60" : ""}`}>
            {hourly.map((point) => (
              <div key={point.hour} className="flex h-full flex-grow basis-0 flex-col items-center justify-end gap-2">
                <span className="text-xs font-semibold text-gray-900">{point.value}</span>
                <div
                  className={`w-full rounded-t ${point.peak ? "bg-brand-primary" : "bg-orange-200"}`}
                  style={{ height: `${point.pct}%` }}
                />
                <span className="text-xs text-gray-500">{point.hour}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex w-80 flex-shrink-0 flex-col gap-5 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <span className="text-lg font-semibold text-gray-900">Demanda y personal</span>
          <div className="flex flex-col gap-4">
            {initialLoading && <DishesSkeleton />}
            {!initialLoading && topDishes.length === 0 && (
              <p className="text-xs text-gray-500">Aún no hay pedidos entregados.</p>
            )}
            {topDishes.map((dish) => (
              <div key={dish.name} className="flex flex-col gap-2">
                <div className="flex flex-row gap-3">
                  <span className="flex-grow text-xs font-medium text-gray-900">{dish.name}</span>
                  <span className="whitespace-nowrap text-xs font-bold text-gray-900">{dish.count}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                  <div className="h-1.5 rounded-full bg-brand-primary" style={{ width: `${dish.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
          <p className="mt-auto border-t border-gray-100 pt-4 text-xs leading-relaxed text-gray-500">
            {staffingNote}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
        <span className="text-sm font-semibold text-gray-900">Últimos pedidos de hoy</span>
        {initialLoading && <OrdersSkeleton />}
        <div className={`overflow-x-auto ${initialLoading ? "hidden" : ""}`}>
          <table className="w-full min-w-[440px] border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500">
                {ORDERS_HEADER.map((h) => (
                  <th key={h} className="py-2 pr-4 font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id} className="border-b border-gray-100 text-gray-900 last:border-0">
                  {order.cells.map((cell, i) => (
                    <td key={i} className="py-3 pr-4">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {!initialLoading && recentOrders.length === 0 && <p className="py-6 text-center text-xs text-gray-500">Sin pedidos hoy.</p>}
        </div>
      </div>
    </div>
  );
}
