import { useCallback, useEffect, useState } from "react";
import { adminApi, ApiError, AUTH_TOKEN_STORAGE_KEY, UNAUTHORIZED_EVENT } from "@repo/api-client";

const NAME_KEY = "qorder_ops_name";
const MUST_CHANGE_KEY = "qorder_ops_must_change";

function clearSession() {
  [AUTH_TOKEN_STORAGE_KEY, NAME_KEY, MUST_CHANGE_KEY].forEach((k) => localStorage.removeItem(k));
}

// Sesión del panel Ops: solo cuentas Dev/TI (superadmin).
export function useOpsAuth() {
  const [token, setToken] = useState(() => localStorage.getItem(AUTH_TOKEN_STORAGE_KEY));
  const [userName, setUserName] = useState(() => localStorage.getItem(NAME_KEY) ?? "");
  const [mustChangePassword, setMustChangePassword] = useState(() => localStorage.getItem(MUST_CHANGE_KEY) === "1");
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
      if (session.role !== "superadmin") {
        setError("Esta cuenta administra un restaurante. Usa el back-office de restaurantes.");
        return;
      }
      const name = session.username ?? email.trim();
      localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, session.accessToken);
      localStorage.setItem(NAME_KEY, name);
      localStorage.setItem(MUST_CHANGE_KEY, session.mustChangePassword ? "1" : "0");
      setUserName(name);
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

  const changePassword = useCallback(async (current: string, next: string) => {
    await adminApi.changePassword(current, next);
    localStorage.setItem(MUST_CHANGE_KEY, "0");
    setMustChangePassword(false);
  }, []);

  return {
    isAuthenticated: token !== null,
    mustChangePassword,
    userName,
    email,
    setEmail,
    password,
    setPassword,
    error,
    submitting,
    submit,
    changePassword,
    logout,
  };
}
