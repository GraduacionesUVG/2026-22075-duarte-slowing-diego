import { useCallback, useEffect, useState } from "react";
import { adminApi, ApiError, AUTH_TOKEN_STORAGE_KEY, UNAUTHORIZED_EVENT } from "@repo/api-client";

const NAME_KEY = "qorder_admin_name";
const LOCAL_KEY = "qorder_admin_local";
const MUST_CHANGE_KEY = "qorder_admin_must_change";

function read(key: string): string | null {
  return localStorage.getItem(key);
}

function clearSession() {
  [AUTH_TOKEN_STORAGE_KEY, NAME_KEY, LOCAL_KEY, MUST_CHANGE_KEY].forEach((k) => localStorage.removeItem(k));
}

export function useAdminAuth() {
  const [token, setToken] = useState(() => read(AUTH_TOKEN_STORAGE_KEY));
  const [adminName, setAdminName] = useState(() => read(NAME_KEY) ?? "");
  const [localName, setLocalName] = useState(() => read(LOCAL_KEY) ?? "");
  // Las cuentas nuevas entran con contraseña temporal: hay que cambiarla antes de usar el panel.
  const [mustChangePassword, setMustChangePassword] = useState(() => read(MUST_CHANGE_KEY) === "1");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const logout = useCallback(() => {
    clearSession();
    setToken(null);
    setMustChangePassword(false);
    setPassword("");
    setError(null);
  }, []);

  // El backend dice que el token ya no sirve (vencido o revocado).
  useEffect(() => {
    window.addEventListener(UNAUTHORIZED_EVENT, logout);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, logout);
  }, [logout]);

  const submit = useCallback(async () => {
    if (submitting || !email.trim() || !password) return;
    setSubmitting(true);
    setError(null);
    try {
      const session = await adminApi.login(email.trim(), password);
      if (!session.restaurantId) {
        // Las cuentas Dev/TI (superadmin) no administran un local: usan QOrder Ops.
        setError("Esta cuenta no administra un restaurante. Usa QOrder Ops.");
        return;
      }
      localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, session.accessToken);
      localStorage.setItem(NAME_KEY, session.username ?? email.trim());
      localStorage.setItem(LOCAL_KEY, session.restaurantName ?? "");
      localStorage.setItem(MUST_CHANGE_KEY, session.mustChangePassword ? "1" : "0");
      setAdminName(session.username ?? email.trim());
      setLocalName(session.restaurantName ?? "");
      setMustChangePassword(session.mustChangePassword);
      setToken(session.accessToken);
      setPassword("");
    } catch (e) {
      setError(
        e instanceof ApiError && e.status < 500
          ? e.message
          : "No se pudo conectar con el servidor. Intenta de nuevo.",
      );
    } finally {
      setSubmitting(false);
    }
  }, [email, password, submitting]);

  // Cambio de contraseña (obligatorio tras el primer ingreso). Lanza si el backend lo rechaza.
  const changePassword = useCallback(async (current: string, next: string) => {
    await adminApi.changePassword(current, next);
    localStorage.setItem(MUST_CHANGE_KEY, "0");
    setMustChangePassword(false);
  }, []);

  return {
    isAuthenticated: token !== null,
    mustChangePassword,
    email,
    setEmail,
    password,
    setPassword,
    error,
    submitting,
    adminName,
    localName,
    submit,
    changePassword,
    logout,
  };
}
