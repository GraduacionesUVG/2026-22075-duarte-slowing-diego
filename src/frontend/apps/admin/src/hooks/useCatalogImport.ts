import { useCallback, useState } from "react";
import { adminApi, ApiError, type ImportKind, type ImportResult, type ImportRowError } from "@repo/api-client";

export type HistoryEntry = {
  id: string;
  fileName: string;
  date: string;
  rows: number;
  result: string;
};

// Vista previa de un archivo validado por el backend con dry_run (todavía no se guardó nada).
export type CurrentImport = {
  kind: ImportKind;
  file: File;
  result: ImportResult;
};

// Avisos que el backend manda al importar el calendario (fechas que ya tienen menú o ya pasaron).
export type ImportWarning = { type?: string; date?: string; message?: string };

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

let historySeq = 0;

const XLSX_MIME = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

// Un .xlsx es un zip: sus primeros bytes son "PK\x03\x04". Si no, el servidor mandó otra cosa
// (una página de error, JSON…) y guardarlo como .xlsx daría un archivo "dañado".
async function isZip(blob: Blob): Promise<boolean> {
  const head = new Uint8Array(await blob.slice(0, 4).arrayBuffer());
  return head[0] === 0x50 && head[1] === 0x4b && head[2] === 0x03 && head[3] === 0x04;
}

function saveBlob(blob: Blob, filename: string) {
  const file = blob.type === XLSX_MIME ? blob : new Blob([blob], { type: XLSX_MIME });
  const url = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.toLowerCase().endsWith(".xlsx") ? filename : `${filename}.xlsx`;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Revocar el enlace de inmediato puede cortar la descarga: se deja un margen.
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

function nowLabel(): string {
  return new Date().toLocaleString("es-GT", { dateStyle: "short", timeStyle: "short" });
}

export function useCatalogImport() {
  const [kind, setKind] = useState<ImportKind>("menu");
  // El backend no guarda historial de importaciones: solo se listan las de esta sesión.
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [currentImport, setCurrentImport] = useState<CurrentImport | null>(null);
  const [rowErrors, setRowErrors] = useState<ImportRowError[]>([]);
  const [loading, setLoading] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  const addHistory = useCallback((fileName: string, rows: number, result: string) => {
    historySeq += 1;
    setHistory((prev) => [{ id: `hist-${historySeq}`, fileName, date: nowLabel(), rows, result }, ...prev]);
  }, []);

  const changeKind = useCallback((next: ImportKind) => {
    setKind(next);
    setCurrentImport(null);
    setRowErrors([]);
    setFileError(null);
  }, []);

  // Valida el archivo en el backend sin guardar nada.
  const handleFileSelected = useCallback(
    async (file: File) => {
      setFileError(null);
      setRowErrors([]);
      setCurrentImport(null);

      if (!file.name.toLowerCase().endsWith(".xlsx")) {
        setFileError("Formato no soportado. Descarga la plantilla y sube un archivo .xlsx.");
        return;
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        setFileError("El archivo pesa más de 5 MB. Divídelo en partes más pequeñas.");
        return;
      }

      setLoading(true);
      try {
        const result = await adminApi.importFile(kind, file, { dryRun: true });
        setCurrentImport({ kind, file, result });
      } catch (e) {
        if (e instanceof ApiError && e.status === 422) {
          const detail = e.detail as { errors?: ImportRowError[] } | undefined;
          setRowErrors(detail?.errors ?? []);
          setFileError(e.message);
        } else {
          setFileError(e instanceof Error ? e.message : "No se pudo validar el archivo.");
        }
      } finally {
        setLoading(false);
      }
    },
    [kind],
  );

  const cancelImport = useCallback(() => {
    if (currentImport) addHistory(currentImport.file.name, 0, "Cancelado por el usuario");
    setCurrentImport(null);
  }, [currentImport, addHistory]);

  // Guarda de verdad. Los avisos del calendario ya se le mostraron al usuario, así que se aceptan.
  const confirmSave = useCallback(async () => {
    if (!currentImport) return;
    setLoading(true);
    setFileError(null);
    try {
      const result = await adminApi.importFile(currentImport.kind, currentImport.file, {
        dryRun: false,
        acceptWarnings: true,
      });
      addHistory(
        currentImport.file.name,
        result.created + result.updated,
        `${result.created} creados · ${result.updated} actualizados`,
      );
      setCurrentImport(null);
    } catch (e) {
      setFileError(e instanceof Error ? e.message : "No se pudo guardar el archivo.");
    } finally {
      setLoading(false);
    }
  }, [currentImport, addHistory]);

  const download = useCallback(
    async (fetcher: () => Promise<{ blob: Blob; filename: string | null }>, fallbackName: string) => {
      setFileError(null);
      try {
        const { blob, filename } = await fetcher();
        if (!(await isZip(blob))) {
          throw new Error(
            "El servidor no devolvió un archivo Excel válido. Intenta de nuevo; si sigue pasando, avisa al equipo técnico.",
          );
        }
        saveBlob(blob, filename ?? fallbackName);
      } catch (e) {
        setFileError(e instanceof Error ? e.message : "No se pudo descargar el archivo.");
      }
    },
    [],
  );

  const downloadTemplate = useCallback(
    () => download(() => adminApi.downloadTemplate(kind), `plantilla_${kind}.xlsx`),
    [download, kind],
  );
  const downloadCurrent = useCallback(
    () => download(() => adminApi.exportMenu(kind), `${kind}.xlsx`),
    [download, kind],
  );

  return {
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
  };
}
