import type { useRegistrationFlow } from "../hooks/useRegistrationFlow";
import PageShell from "../components/PageShell";
import ErrorNotice from "../components/ErrorNotice";
import QDot from "../components/QDot";

type AlreadyRegisteredProps = {
  flow: ReturnType<typeof useRegistrationFlow>;
};

export default function AlreadyRegistered({ flow }: AlreadyRegisteredProps) {
  const { existingNumberMasked, confirmMove, backToForm, loading, error } = flow;

  return (
    <PageShell>
      <div className="flex flex-grow flex-col items-center justify-center gap-5 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
          <QDot className="h-8 w-8" />
        </div>
        <span className="inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
          Correo ya vinculado a otro número
        </span>
        <h1 className="text-lg font-semibold text-gray-900">Este correo ya tiene una cuenta</h1>
        <p className="text-xs leading-relaxed text-gray-500">
          Ese correo institucional ya está confirmado con el número{" "}
          <strong className="text-gray-900">{existingNumberMasked ?? "otro número"}</strong>. Si
          cambiaste de número de WhatsApp, puedes mover tu cuenta a este número nuevo.
        </p>

        {error && <ErrorNotice>{error}</ErrorNotice>}

        <button
          type="button"
          onClick={confirmMove}
          disabled={loading}
          className="flex h-12 w-full items-center justify-center rounded-lg bg-brand-primary text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? "Moviendo..." : "Sí, mover mi cuenta a este número"}
        </button>
        <span onClick={backToForm} className="cursor-pointer text-xs text-gray-500">
          Corregir mis datos
        </span>
      </div>
    </PageShell>
  );
}
