import { useCallback, useEffect, useState } from "react";
import { adminApi, type PasswordResetInfo } from "@repo/api-client";

// checking: validando el enlace · invalid: enlace vencido, usado o inexistente
// ready: se puede escribir la contraseña · done: contraseña cambiada
export type ResetStatus = "checking" | "invalid" | "ready" | "done";

export const MIN_PASSWORD_LENGTH = 8;

const MISSING_TOKEN = "El enlace no es válido. Solicita uno nuevo desde el inicio de sesión.";

// Ruta del enlace que manda el backend por correo: <panel>/reset-password?token=...
export const RESET_PATH = "/reset-password";

export function readResetRoute(): { active: boolean; token: string | null } {
  const active = window.location.pathname.replace(/\/+$/, "") === RESET_PATH;
  return { active, token: active ? new URLSearchParams(window.location.search).get("token") : null };
}

export function usePasswordReset(token: string | null) {
  const [status, setStatus] = useState<ResetStatus>(token ? "checking" : "invalid");
  const [info, setInfo] = useState<PasswordResetInfo | null>(null);
  const [error, setError] = useState<string | null>(token ? null : MISSING_TOKEN);
  const [saving, setSaving] = useState(false);

  // Antes de mostrar el formulario se confirma que el enlace siga vigente.
  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    adminApi
      .validatePasswordReset(token)
      .then((result) => {
        if (cancelled) return;
        setInfo(result);
        setStatus("ready");
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e instanceof Error && e.message ? e.message : "No se pudo verificar el enlace. Intenta de nuevo.");
        setStatus("invalid");
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  const submit = useCallback(
    async (newPassword: string) => {
      if (!token || saving) return;
      setSaving(true);
      setError(null);
      try {
        await adminApi.confirmPasswordReset(token, newPassword);
        setStatus("done");
      } catch (e) {
        const message = e instanceof Error && e.message ? e.message : "No se pudo cambiar la contraseña.";
        setError(message);
        // 400 = el enlace dejó de servir (se usó o venció mientras escribías): ya no tiene arreglo.
        if (e instanceof Error && "status" in e && e.status === 400) setStatus("invalid");
      } finally {
        setSaving(false);
      }
    },
    [token, saving],
  );

  return { status, info, error, saving, submit };
}
