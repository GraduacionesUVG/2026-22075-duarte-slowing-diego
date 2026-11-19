type IncidentBannerProps = {
  // Hora (HH:MM) desde la que no hay respuesta, si se conoce.
  since: string | null;
  apiReachable: boolean;
  retrying: boolean;
  onRetry: () => void;
  onViewDiagnostics: () => void;
};

export default function IncidentBanner({ since, apiReachable, retrying, onRetry, onViewDiagnostics }: IncidentBannerProps) {
  return (
    <div className="flex flex-row items-center gap-4 rounded-xl bg-red-50 p-5 ring-1 ring-inset ring-red-200">
      <div className="h-2 w-2 flex-shrink-0 rounded-full bg-red-600" />
      <div className="flex flex-grow flex-col gap-1.5">
        <span className="text-sm font-semibold text-red-700">
          {apiReachable
            ? `La API responde pero MongoDB está desconectada${since ? ` desde las ${since}` : ""}`
            : `La API del backend no responde${since ? ` desde las ${since}` : ""}`}
        </span>
        <span className="text-xs text-red-700">
          Los restaurantes no pueden recibir ni actualizar pedidos mientras dure la caída. Se vuelve a
          verificar cada 15 s.
        </span>
      </div>
      <button
        type="button"
        onClick={onViewDiagnostics}
        className="whitespace-nowrap rounded-lg px-3.5 py-2 text-xs font-semibold text-gray-700 ring-1 ring-gray-200 hover:bg-white"
      >
        Ver diagnóstico
      </button>
      <button
        type="button"
        onClick={onRetry}
        disabled={retrying}
        className="whitespace-nowrap rounded-lg bg-brand-primary px-3.5 py-2 text-xs font-semibold text-white disabled:opacity-60"
      >
        {retrying ? "Verificando…" : "Verificar ahora"}
      </button>
    </div>
  );
}
