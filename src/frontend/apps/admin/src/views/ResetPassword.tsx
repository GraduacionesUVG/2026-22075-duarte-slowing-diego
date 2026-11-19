import { useState } from "react";
import QDot from "../components/QDot";
import { MIN_PASSWORD_LENGTH, usePasswordReset } from "../hooks/usePasswordReset";

type ResetPasswordProps = {
  token: string | null;
  onBackToLogin: () => void;
};

const inputClass =
  "h-11 min-w-0 flex-grow text-sm text-gray-900 outline-none";
const fieldClass =
  "flex h-11 flex-row items-center gap-2.5 rounded-lg px-3.5 ring-1 ring-gray-200 focus-within:ring-2 focus-within:ring-brand-primary";

function ErrorNotice({ children }: { children: string }) {
  return (
    <p role="alert" className="rounded-[5px] border border-red-500 bg-red-50 px-3 py-2 text-xs font-medium leading-relaxed text-red-700">
      {children}
    </p>
  );
}

// Define la nueva contraseña con el token.
export default function ResetPassword({ token, onBackToLogin }: ResetPasswordProps) {
  const { status, info, error, saving, submit } = usePasswordReset(token);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const tooShort = password !== "" && password.length < MIN_PASSWORD_LENGTH;
  const mismatch = confirm !== "" && password !== confirm;
  const canSubmit = !saving && password.length >= MIN_PASSWORD_LENGTH && password === confirm;
  const isWelcome = info?.purpose === "welcome";

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gray-50 p-6">
      <div className="flex w-[420px] max-w-full flex-col gap-5 rounded-xl bg-white p-8 shadow-sm ring-1 ring-gray-200">
        <div className="flex flex-row items-center gap-2">
          <QDot className="h-6 w-6" />
          <span className="text-sm font-semibold text-gray-900">QOrder</span>
        </div>

        <h1 className="text-lg font-semibold text-gray-900">Restablecer contraseña</h1>

        {status === "checking" && <p className="text-xs text-gray-500">Verificando el enlace…</p>}

        {status === "invalid" && (
          <>
            <ErrorNotice>{error ?? "El enlace no es válido. Solicita uno nuevo."}</ErrorNotice>
            <button
              type="button"
              onClick={onBackToLogin}
              className="h-11 rounded-lg bg-brand-primary text-sm font-semibold text-white"
            >
              Volver a iniciar sesión
            </button>
            <p className="text-center text-xs text-gray-500">
              Desde ahí puedes pedir un enlace nuevo con «Olvidé mi contraseña».
            </p>
          </>
        )}

        {status === "ready" && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (canSubmit) void submit(password);
            }}
            className="flex flex-col gap-5"
          >
            <p className="text-xs leading-relaxed text-gray-500">
              {isWelcome ? "Define tu contraseña para entrar a " : "Elige una contraseña nueva para "}
              {info?.email ? <strong className="font-semibold text-gray-900">{info.email}</strong> : "tu cuenta"}.
            </p>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-gray-600">Nueva contraseña</span>
              <div className={fieldClass}>
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  autoFocus
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="whitespace-nowrap text-xs font-medium text-brand-primary"
                >
                  {showPassword ? "Ocultar" : "Mostrar"}
                </button>
              </div>
              <span className={`text-xs ${tooShort ? "text-red-600" : "text-gray-500"}`}>
                Mínimo {MIN_PASSWORD_LENGTH} caracteres.
              </span>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-gray-600">Confirmar contraseña</span>
              <div className={fieldClass}>
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className={inputClass}
                />
              </div>
              {mismatch && <span className="text-xs text-red-600">Las contraseñas no coinciden.</span>}
            </label>

            {error && <ErrorNotice>{error}</ErrorNotice>}

            <button
              type="submit"
              disabled={!canSubmit}
              className="h-11 rounded-lg bg-brand-primary text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              {saving ? "Guardando…" : "Restablecer contraseña"}
            </button>
          </form>
        )}

        {status === "done" && (
          <>
            <p
              role="status"
              className="rounded-[5px] border border-green-500 bg-green-50 px-3 py-2 text-xs font-medium leading-relaxed text-green-700"
            >
              Tu contraseña se actualizó correctamente. Ya puedes iniciar sesión con la nueva.
            </p>
            <button
              type="button"
              onClick={onBackToLogin}
              className="h-11 rounded-lg bg-brand-primary text-sm font-semibold text-white"
            >
              Ir a iniciar sesión
            </button>
          </>
        )}
      </div>
    </div>
  );
}
