import { useState } from "react";
import { adminApi } from "@repo/api-client";
import type { useAdminAuth } from "../hooks/useAdminAuth";
import QDot from "../components/QDot";

type LoginAdminProps = {
  auth: ReturnType<typeof useAdminAuth>;
};

export default function LoginAdmin({ auth }: LoginAdminProps) {
  const { email, setEmail, password, setPassword, error, submitting, submit } = auth;
  const [showPassword, setShowPassword] = useState(false);
  const [resetState, setResetState] = useState<"idle" | "sending" | "sent">("idle");
  const [resetHint, setResetHint] = useState<string | null>(null);
  const canSubmit = !submitting && email.trim() !== "" && password !== "";

  const requestReset = async () => {
    if (resetState === "sending") return;
    if (!email.trim()) {
      setResetHint("Ingresa tu correo para enviarte el enlace de recuperación.");
      return;
    }
    setResetHint(null);
    setResetState("sending");
    try {
      await adminApi.requestPasswordReset(email.trim());
    } catch {
      // se muestra el mismo aviso: el backend tampoco distingue
    }
    setResetState("sent");
  };

  return (
    <div className="flex min-h-screen w-full flex-row bg-gray-50">
      <div className="flex w-[520px] flex-shrink-0 flex-col gap-5 bg-brand-sidebar p-14">
        <div className="flex flex-row items-center gap-2">
          <QDot className="h-6 w-6" />
          <span className="text-sm font-semibold text-white">QOrder</span>
        </div>
        <span className="mt-auto text-lg font-semibold leading-snug text-white">
          Back-office de restaurantes
        </span>
      </div>

      <div className="flex flex-grow items-center justify-center p-12">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }}
          className="flex w-[400px] flex-col gap-5 rounded-xl bg-white p-8 shadow-sm ring-1 ring-gray-200"
        >
          <h1 className="text-lg font-semibold text-gray-900">Iniciar sesión</h1>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-gray-600">Correo del administrador</span>
            <input
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setResetHint(null);
              }}
              placeholder="ana.solis@elbuensabor.gt"
              className="h-11 rounded-lg px-3.5 text-sm text-gray-900 ring-1 ring-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary "
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-gray-600">Contraseña</span>
            <div className="flex h-11 flex-row items-center gap-2.5 rounded-lg px-3.5 ring-1 ring-gray-200 focus-within:ring-2 focus-within:ring-brand-primary">
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                  onChange={(e) => setPassword(e.target.value)}
                className="h-full min-w-0 flex-grow text-sm text-gray-900 outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="whitespace-nowrap text-xs font-medium text-brand-primary"
              >
                {showPassword ? "Ocultar" : "Mostrar"}
              </button>
            </div>
          </label>

          {error && (
            <div className="flex flex-col gap-1 rounded-lg bg-red-50 px-3.5 py-3">
              <span className="text-xs font-semibold text-red-700">No se pudo iniciar sesión</span>
              <span className="text-xs leading-relaxed text-red-700">{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            className="h-11 rounded-lg bg-brand-primary text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            {submitting ? "Ingresando…" : "Entrar al back-office"}
          </button>

          {resetState === "sent" ? (
            <span className="text-center text-xs text-gray-500">
              Si el correo existe, te enviamos un enlace para cambiar la contraseña.
            </span>
          ) : (
            <>
              {resetHint && (
                <p
                  role="alert"
                  className="rounded-[5px] border border-red-500 bg-red-50 px-3 py-2 text-xs font-medium text-red-700"
                >
                  {resetHint}
                </p>
              )}
              <button
                type="button"
                onClick={() => void requestReset()}
                disabled={resetState === "sending"}
                className="text-center text-xs font-medium text-brand-primary disabled:text-gray-400"
              >
                {resetState === "sending" ? "Enviando…" : "Olvidé mi contraseña"}
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
