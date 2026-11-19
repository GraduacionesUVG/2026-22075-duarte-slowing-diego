type PaginationProps = {
  page: number; // 1-based
  pageSize: number;
  total: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  // Nombre de lo que se cuenta, en plural (ej. "platillos").
  noun?: string;
};

// Páginas que se dibujan: la primera, la última y las vecinas de la actual (con "…" entre huecos).
function pageList(page: number, totalPages: number): (number | "gap-left" | "gap-right")[] {
  const wanted = new Set([1, totalPages, page - 1, page, page + 1]);
  const pages = [...wanted].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);
  const out: (number | "gap-left" | "gap-right")[] = [];
  pages.forEach((p, i) => {
    const prev = pages[i - 1];
    if (prev !== undefined && p - prev > 1) out.push(i < pages.length / 2 ? "gap-left" : "gap-right");
    out.push(p);
  });
  return out;
}

const buttonClass =
  "flex h-8 min-w-8 items-center justify-center rounded-lg px-2.5 text-xs font-semibold ring-1 transition disabled:cursor-not-allowed disabled:opacity-40";

export default function Pagination({
  page,
  pageSize,
  total,
  pageSizeOptions = [10, 25, 50],
  onPageChange,
  onPageSizeChange,
  noun = "elementos",
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <nav aria-label="Paginación" className="flex flex-row flex-wrap items-center gap-3">
      <span className="flex-grow text-xs text-gray-500">
        Mostrando {from}–{to} de {total} {noun}
      </span>

      {onPageSizeChange && (
        <label className="flex flex-row items-center gap-2 text-xs text-gray-500">
          Por página
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="h-8 rounded-lg bg-white px-2 text-xs text-gray-700 ring-1 ring-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
      )}

      <div className="flex flex-row items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className={`${buttonClass} bg-white text-gray-700 ring-gray-200 hover:bg-gray-50`}
        >
          ‹ Anterior
        </button>
        {pageList(page, totalPages).map((entry) =>
          typeof entry === "string" ? (
            <span key={entry} aria-hidden="true" className="px-1 text-xs text-gray-400">
              …
            </span>
          ) : (
            <button
              key={entry}
              type="button"
              onClick={() => onPageChange(entry)}
              aria-current={entry === page ? "page" : undefined}
              className={`${buttonClass} ${
                entry === page
                  ? "bg-brand-primary text-white ring-brand-primary"
                  : "bg-white text-gray-700 ring-gray-200 hover:bg-gray-50"
              }`}
            >
              {entry}
            </button>
          ),
        )}
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className={`${buttonClass} bg-white text-gray-700 ring-gray-200 hover:bg-gray-50`}
        >
          Siguiente ›
        </button>
      </div>
    </nav>
  );
}
