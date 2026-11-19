import type { useRegistrationFlow } from "../hooks/useRegistrationFlow";
import PageShell from "../components/PageShell";
import ErrorNotice from "../components/ErrorNotice";
import QDot from "../components/QDot";

type ConfirmEmailSentProps = {
  flow: ReturnType<typeof useRegistrationFlow>;
};

export default function ConfirmEmailSent({ flow }: ConfirmEmailSentProps) {
  const {
    email,
    otpCode,
    setOtpCode,
    submitOtp,
    resendCode,
    expiresInMinutes,
    debugOtpCode,
    loading,
    error,
    backToForm,
  } = flow;

  return (
    <PageShell>
      <div className="flex flex-grow flex-col items-center justify-center gap-5 text-center">
        <QDot className="h-12 w-12" />
        <h1 className="text-lg font-semibold text-gray-900">Escribe el código que te enviamos</h1>
        <p className="text-xs leading-relaxed text-gray-500">
          Mandamos un código de 6 dígitos a <strong className="text-gray-900">{email}</strong>.
          Escríbelo aquí para confirmar tu registro.
        </p>

        {debugOtpCode && (
          <p className="w-full rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
            Modo desarrollo: código de prueba <strong>{debugOtpCode}</strong>
          </p>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void submitOtp();
          }}
          className="flex w-full flex-col gap-4"
        >
          <input
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            inputMode="numeric"
            placeholder="000000"
            className="h-12 rounded-lg text-center text-lg tracking-[0.5em] text-gray-900 ring-1 ring-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary"
          />

          {error && <ErrorNotice>{error}</ErrorNotice>}

          <button
            type="submit"
            disabled={otpCode.length !== 6 || loading}
            className="h-12 w-full rounded-lg bg-brand-primary text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? "Verificando..." : "Confirmar código"}
          </button>
        </form>

        <div className="w-full rounded-xl bg-white p-4 text-left ring-1 ring-gray-200">
          <span className="text-xs font-semibold text-gray-900">
            El código vence en {expiresInMinutes ?? 10} minutos
          </span>
          <p className="mt-1.5 text-xs leading-relaxed text-gray-500">
            Si no llega, revisa la carpeta de correo no deseado antes de pedir uno nuevo.
          </p>
        </div>

        <button
          type="button"
          onClick={resendCode}
          disabled={loading}
          className="h-12 w-full rounded-lg text-sm font-semibold text-gray-700 ring-1 ring-gray-200 disabled:opacity-40"
        >
          Reenviar código
        </button>
        <span onClick={backToForm} className="cursor-pointer text-xs text-gray-500">
          Corregir mis datos
        </span>
      </div>
    </PageShell>
  );
}
