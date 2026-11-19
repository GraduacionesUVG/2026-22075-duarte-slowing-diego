import type { useRegistrationFlow } from "../hooks/useRegistrationFlow";
import PageShell from "../components/PageShell";
import ErrorNotice from "../components/ErrorNotice";
import QDot from "../components/QDot";

type RegisterFormProps = {
  flow: ReturnType<typeof useRegistrationFlow>;
};

export default function RegisterForm({ flow }: RegisterFormProps) {
  const {
    phone,
    setPhone,
    phoneLocked,
    fullName,
    setFullName,
    email,
    setEmail,
    studentId,
    setStudentId,
    consent,
    setConsent,
    canSubmit,
    submit,
    loading,
    error,
  } = flow;

  return (
    <PageShell>
      <div className="flex flex-row items-center gap-2.5">
        <QDot className="h-6 w-6" />
        <span className="text-sm font-semibold text-gray-900">QOrder - UVG</span>
      </div>

      <div className="flex flex-col gap-2.5">
        <h1 className="text-lg font-semibold leading-snug text-gray-900">
          Completa tu registro para pedir por WhatsApp
        </h1>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="flex flex-col gap-4"
      >
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-gray-600">Número de WhatsApp</span>
          <div className="flex flex-row items-center gap-2">
            <span className="flex h-12 items-center rounded-lg bg-gray-100 px-3 text-sm text-gray-500">
              +502
            </span>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 8))}
              disabled={phoneLocked}
              inputMode="numeric"
              placeholder="55551234"
              className="h-12 flex-1 rounded-lg px-3.5 text-sm text-gray-900 ring-1 ring-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary disabled:bg-gray-100 disabled:text-gray-500"
            />
          </div>
          <span className="text-xs text-gray-500">
            {phoneLocked
              ? "Detectado automáticamente desde el enlace de WhatsApp."
              : "El mismo número desde el que le escribiste al bot."}
          </span>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-gray-600">Nombre completo</span>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="h-12 rounded-lg px-3.5 text-sm text-gray-900 ring-1 ring-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-gray-600">Carné</span>
          <input
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            className="h-12 rounded-lg px-3.5 text-sm text-gray-900 ring-1 ring-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-gray-600">Correo institucional</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="carne@uvg.edu.gt"
            className="h-12 rounded-lg px-3.5 text-sm text-gray-900 ring-1 ring-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary"
          />
        </label>

        <label className="flex flex-row items-start gap-2.5">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-0.5 h-[18px] w-[18px] flex-shrink-0 accent-brand-primary"
          />
          <span className="text-xs leading-relaxed text-gray-500">
            Acepto que mi número se use para tomar pedidos y notificar turnos.
          </span>
        </label>

        {error && <ErrorNotice>{error}</ErrorNotice>}

        <button
          type="submit"
          disabled={!canSubmit || loading}
          className="h-12 rounded-lg bg-brand-primary text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? "Enviando..." : "Confirmar registro"}
        </button>
      </form>

      <span className="text-center text-xs leading-relaxed text-gray-500">
        Solo puedes usar el chat de QOrder una vez termines el registro.
      </span>
    </PageShell>
  );
}
