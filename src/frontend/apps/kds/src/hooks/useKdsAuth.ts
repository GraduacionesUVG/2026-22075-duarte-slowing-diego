import { useCallback, useState } from "react";
import { AUTH_TOKEN_STORAGE_KEY, kdsApi, type KdsSession } from "@repo/api-client";

// El token usa la clave compartida: es la que lee apiRequest para mandar el Bearer.
const TOKEN_KEY = AUTH_TOKEN_STORAGE_KEY;
const USERNAME_KEY = "kds_username";
const RESTAURANT_ID_KEY = "kds_restaurant_id";
const RESTAURANT_NAME_KEY = "kds_restaurant_name";

const MIN_PIN_LENGTH = 4;
const MAX_PIN_LENGTH = 8;

// Páginas del KDS.
// "acceptance": la cocina acepta/rechaza pedidos y se genera el link de pago.
// "delivery": pedidos ya pagados (preparación y entrega).
// "menu": activar/desactivar productos cuando a la cocina se le acaba algo.
export type KdsView = "acceptance" | "delivery" | "menu";

// El backend todavía no manda permisos por estación: toda sesión ve todas las páginas.
const ALL_VIEWS: KdsView[] = ["acceptance", "delivery", "menu"];

function saveSession(session: KdsSession) {
  localStorage.setItem(TOKEN_KEY, session.accessToken);
  localStorage.setItem(USERNAME_KEY, session.username);
  localStorage.setItem(RESTAURANT_NAME_KEY, session.restaurantName);
  if (session.restaurantId) localStorage.setItem(RESTAURANT_ID_KEY, session.restaurantId);
  else localStorage.removeItem(RESTAURANT_ID_KEY);
}

export function useKdsAuth() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  // Login rápido: tras el primer ingreso solo se pide el PIN y se reenvía el usuario guardado.
  const [savedUsername, setSavedUsername] = useState(() => localStorage.getItem(USERNAME_KEY));
  const [restaurantName, setRestaurantName] = useState(
    () => localStorage.getItem(RESTAURANT_NAME_KEY) ?? "",
  );
  const [restaurantId, setRestaurantId] = useState(() => localStorage.getItem(RESTAURANT_ID_KEY));
  const [usernameInput, setUsernameInput] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const enterDigit = useCallback((digit: string) => {
    setError(null);
    setPin((prev) => (prev.length >= MAX_PIN_LENGTH ? prev : prev + digit));
  }, []);

  const backspace = useCallback(() => {
    setError(null);
    setPin((prev) => prev.slice(0, -1));
  }, []);

  const clear = useCallback(() => {
    setError(null);
    setPin("");
  }, []);

  const changeUsername = useCallback((value: string) => {
    setError(null);
    setUsernameInput(value);
  }, []);

  // Volver a pedir el usuario (otra estación en el mismo equipo).
  const switchUser = useCallback(() => {
    localStorage.removeItem(USERNAME_KEY);
    setSavedUsername(null);
    setUsernameInput("");
    setPin("");
    setError(null);
  }, []);

  const username = savedUsername ?? usernameInput.trim();
  const canSubmit = username.length > 0 && pin.length >= MIN_PIN_LENGTH && !submitting;

  const submit = useCallback(async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const session = await kdsApi.login(username, pin);
      saveSession(session);
      setSavedUsername(session.username);
      setRestaurantName(session.restaurantName);
      setRestaurantId(session.restaurantId);
      setToken(session.accessToken);
      setPin("");
    } catch (e) {
      const status = (e as { status?: number }).status;
      setPin("");
      setError(
        status === 401 || status === 403
          ? "Usuario o PIN incorrecto. Verifica el código con el equipo de QOrder."
          : "No se pudo conectar con el servidor. Intenta de nuevo.",
      );
    } finally {
      setSubmitting(false);
    }
  }, [canSubmit, username, pin]);

  // El usuario se conserva para que el siguiente ingreso solo pida el PIN.
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setPin("");
    setError(null);
  }, []);

  return {
    isAuthenticated: token !== null,
    token,
    views: ALL_VIEWS,
    restaurantId,
    localName: restaurantName,
    savedUsername,
    usernameInput,
    pin,
    minPinLength: MIN_PIN_LENGTH,
    maxPinLength: MAX_PIN_LENGTH,
    error,
    submitting,
    canSubmit,
    changeUsername,
    switchUser,
    enterDigit,
    backspace,
    clear,
    submit,
    logout,
  };
}
