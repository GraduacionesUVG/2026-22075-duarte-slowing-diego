import { useMemo, useState } from "react";

// Paginación en cliente de una lista: la página actual nunca pasa de la última si la lista se achica.
export function usePaged<T>(items: T[], initialSize = 10) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialSize);
  const lastPage = Math.max(1, Math.ceil(items.length / pageSize));
  const current = Math.min(page, lastPage);
  const slice = useMemo(() => items.slice((current - 1) * pageSize, current * pageSize), [items, current, pageSize]);

  return {
    slice,
    page: current,
    pageSize,
    total: items.length,
    setPage,
    setPageSize: (size: number) => {
      setPageSize(size);
      setPage(1);
    },
  };
}
