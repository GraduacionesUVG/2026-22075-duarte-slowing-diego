import { useState } from "react";
import type { useOpsAuth } from "../hooks/useOpsAuth";

const MIN_LENGTH = 8;

type ChangePasswordProps = {
  auth: ReturnType<typeof useOpsAuth>;
};

// Pantalla obligatoria tras el primer ingreso con la contraseña temporal.
export default function OpsChangePassword({ auth }: ChangePasswordProps) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const mismatch = confirm !== "" && next !== confirm;
  const canSubmit = !saving && current !== "" && next.length >= MIN_LENGTH && next === confirm;

  const submit = async () => {
    if (!canSubmit) return;
    setSaving(true);
    setError(null);
    try {
      await auth.changePassword(current, next);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo cambiar la contraseña.");
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "h-11 rounded-lg px-3.5 text-sm text-gray-900 ring-1 ring-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary";

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gray-50 p-12">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
        className="flex w-[400px] flex-col gap-5 rounded-xl bg-white p-8 shadow-sm ring-1 ring-gray-200"
      >
        <h1 className="text-lg font-semibold text-gray-900">Cambia tu contraseña</h1>
        <p className="text-xs leading-relaxed text-gray-500">
          Ingresaste con una contraseña temporal. Define una nueva (mínimo {MIN_LENGTH} caracteres) para
          continuar.
        </p>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-gray-600">Contraseña actual</span>
          <input
            type="password"
            autoComplete="current-password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-gray-600">Nueva contraseña</span>
          <input
            type="password"
            autoComplete="new-password"
            value={next}
            onChange={(e) => setNext(e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-gray-600">Confirmar nueva contraseña</span>
          <input
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className={inputClass}
          />
          {mismatch && <span className="text-xs text-red-600">Las contraseñas no coinciden.</span>}
        </label>

        {error && <p className="rounded-lg bg-red-50 px-3.5 py-3 text-xs text-red-700">{error}</p>}

        <button
          type="submit"
          disabled={!canSubmit}
          className="h-11 rounded-lg bg-brand-primary text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          {saving ? "Guardando…" : "Guardar contraseña"}
        </button>
        <button type="button" onClick={auth.logout} className="text-center text-xs text-gray-500">
          Cerrar sesión
        </button>
      </form>
    </div>
  );
}
