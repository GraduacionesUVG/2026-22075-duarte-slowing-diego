import { useRef, useState } from "react";
import QDot from "../components/QDot";
import { Skeleton, SkeletonRegion, Spinner } from "../components/Skeleton";
import StatusBadge from "../components/StatusBadge";
import { useCatalogImport, type ImportWarning } from "../hooks/useCatalogImport";

const KIND_LABEL = { menu: "Menú general", calendar: "Calendario" } as const;

const secondaryBtn =
  "whitespace-nowrap rounded-lg px-3.5 py-2 text-xs font-semibold text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50";

export default function CatalogImport() {
  const {
    kind,
    changeKind,
    history,
    currentImport,
    rowErrors,
    loading,
    fileError,
    handleFileSelected,
    cancelImport,
    confirmSave,
    downloadTemplate,
    downloadCurrent,
  } = useCatalogImport();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const result = currentImport?.result;
  const warnings = (result?.warnings ?? []) as ImportWarning[];

  return (
    <div className="flex max-w-[1040px] flex-col gap-7">
      <div className="flex flex-col gap-5 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
        <div className="flex flex-row items-center gap-3">
          <span className="flex-grow text-sm font-semibold text-gray-900">Importación de catálogos</span>
          <button type="button" onClick={() => void downloadCurrent()} className={secondaryBtn}>
            Descargar actual
          </button>
          <button type="button" onClick={() => void downloadTemplate()} className={secondaryBtn}>
            Descargar plantilla
          </button>
        </div>

        <div className="flex flex-row gap-2">
          {(Object.keys(KIND_LABEL) as (keyof typeof KIND_LABEL)[]).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => changeKind(k)}
              className={`rounded-lg px-3.5 py-2 text-xs font-medium ${
                kind === k ? "bg-brand-primary text-white" : "bg-white text-gray-700 ring-1 ring-gray-200"
              }`}
            >
              {KIND_LABEL[k]}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500">
          {kind === "menu"
            ? "El menú general crea o actualiza los platillos por código."
            : "El calendario agrega menús por fecha. Si una fecha ya tiene menú, se te avisa antes de reemplazarla."}
        </p>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const file = e.dataTransfer.files[0];
            if (file) void handleFileSelected(file);
          }}
          className={`flex flex-col items-center gap-4 rounded-xl border-2 border-dashed bg-gray-50 p-10 text-center ${
            dragOver ? "border-brand-primary bg-orange-50" : "border-gray-300"
          }`}
        >
          <QDot className="h-12 w-12" />
          <span className="text-sm font-semibold text-gray-900">Arrastra tu archivo Excel aquí</span>
          <span className="text-xs text-gray-500">Formato soportado: .xlsx (usa la plantilla) — Tamaño máximo 5 MB</span>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleFileSelected(file);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="rounded-lg bg-brand-primary px-3.5 py-2 text-xs font-semibold text-white"
          >
            Seleccionar archivo
          </button>
        </div>

        {loading && !currentImport && (
          <SkeletonRegion label="Procesando archivo…" className="flex flex-col gap-3 rounded-lg bg-gray-50 p-4">
            <div className="flex flex-row items-center gap-2 text-xs font-semibold text-gray-600">
              <Spinner />
              Procesando archivo…
            </div>
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
            <Skeleton className="h-3 w-2/3" />
          </SkeletonRegion>
        )}
        {fileError && <p className="text-xs font-medium text-red-600">{fileError}</p>}

        {rowErrors.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500">
                  {["Hoja", "Fila", "Columna", "Error"].map((h) => (
                    <th key={h} className="py-2 pr-4 font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rowErrors.map((err, i) => (
                  <tr key={i} className="border-b border-gray-100 text-gray-900 last:border-0">
                    <td className="py-3 pr-4">{err.sheet ?? "—"}</td>
                    <td className="py-3 pr-4">{err.row ?? "—"}</td>
                    <td className="py-3 pr-4">{err.column ?? "—"}</td>
                    <td className="py-3 pr-4">{err.error}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="pt-3 text-xs text-gray-500">No se guardó nada. Corrige el archivo y vuelve a subirlo.</p>
          </div>
        )}
      </div>

      {currentImport && result && (
        <div className="flex flex-col gap-5 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <div className="flex flex-row items-center gap-3">
            <div className="flex flex-grow flex-col gap-1">
              <span className="text-sm font-semibold text-gray-900">
                {currentImport.file.name} — {KIND_LABEL[currentImport.kind]}
              </span>
              <span className="text-xs text-gray-500">
                {result.created} platillos nuevos · {result.updated} por actualizar
              </span>
            </div>
            {warnings.length > 0 ? (
              <StatusBadge status="warning" label={`${warnings.length} avisos`} />
            ) : (
              <StatusBadge status="success" label="Sin errores" />
            )}
          </div>

          {warnings.length > 0 && (
            <ul className="flex flex-col gap-2 rounded-lg bg-amber-50 p-4 text-xs text-amber-800">
              {warnings.map((w, i) => (
                <li key={i}>{w.message ?? `${w.type ?? "Aviso"} ${w.date ?? ""}`}</li>
              ))}
            </ul>
          )}

          {result.items.length > 0 && (
            <div className="max-h-64 overflow-auto">
              <table className="w-full min-w-[520px] border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-500">
                    {["Código", "Nombre", "Categoría", "Precio"].map((h) => (
                      <th key={h} className="py-2 pr-4 font-semibold">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.items.map((item, i) => (
                    <tr key={item.id ?? i} className="border-b border-gray-100 text-gray-900 last:border-0">
                      <td className="py-2 pr-4">{item.code ?? "—"}</td>
                      <td className="py-2 pr-4">{item.name}</td>
                      <td className="py-2 pr-4">{item.category}</td>
                      <td className="py-2 pr-4">Q{item.price.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex flex-row items-center gap-3">
            <p className="flex-grow text-xs leading-relaxed text-gray-500">
              {warnings.length > 0
                ? "Revisa los avisos: al guardar se reemplaza el menú de las fechas indicadas."
                : "El archivo pasó la validación. Todavía no se ha guardado nada."}
            </p>
            <button type="button" onClick={cancelImport} className={secondaryBtn}>
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => void confirmSave()}
              disabled={loading}
              aria-busy={loading}
              className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg bg-brand-primary px-3.5 py-2 text-xs font-semibold text-white disabled:cursor-wait disabled:opacity-60"
            >
              {loading && <Spinner />}
              {loading ? "Guardando…" : warnings.length > 0 ? "Guardar y reemplazar" : "Guardar catálogo"}
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
        <span className="text-sm font-semibold text-gray-900">Importaciones de esta sesión</span>
        {history.length === 0 ? (
          <p className="text-xs text-gray-500">Todavía no has importado archivos en esta sesión.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500">
                  {["Archivo", "Fecha", "Filas", "Resultado"].map((h) => (
                    <th key={h} className="py-2 pr-4 font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {history.map((entry) => (
                  <tr key={entry.id} className="border-b border-gray-100 text-gray-900 last:border-0">
                    <td className="py-3 pr-4">{entry.fileName}</td>
                    <td className="py-3 pr-4">{entry.date}</td>
                    <td className="py-3 pr-4">{entry.rows}</td>
                    <td className="py-3 pr-4">{entry.result}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
