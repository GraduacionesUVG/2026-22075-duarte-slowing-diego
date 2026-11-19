export type ToastState = { id: number; kind: "success" | "error"; message: string };

type ToastProps = {
  toast: ToastState | null;
  onDismiss: () => void;
};

// Aviso flotante (arriba a la derecha) para confirmar que algo se guardó o explicar por qué falló.
// Los de éxito se cierran solos (ver useToast); los de error se quedan hasta cerrarlos.
export default function Toast({ toast, onDismiss }: ToastProps) {
  if (!toast) return null;
  const success = toast.kind === "success";

  return (
    <div
      key={toast.id}
      role={success ? "status" : "alert"}
      className={`fixed right-6 top-6 z-50 flex w-[360px] max-w-[calc(100vw-3rem)] flex-row items-start gap-3 rounded-lg border px-4 py-3 shadow-lg ${
        success ? "border-green-500 bg-green-50 text-green-700" : "border-red-500 bg-red-50 text-red-700"
      }`}
    >
      <span
        aria-hidden="true"
        className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${
          success ? "bg-green-600" : "bg-red-600"
        }`}
      >
        {success ? "✓" : "!"}
      </span>
      <p className="flex-grow text-xs font-medium leading-relaxed">{toast.message}</p>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Cerrar aviso"
        className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-sm leading-none opacity-60 hover:opacity-100"
      >
        ×
      </button>
    </div>
  );
}
