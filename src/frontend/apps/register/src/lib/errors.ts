import { ApiError } from "@repo/api-client";

type ErrorContext = "register" | "otp";

const NETWORK =
  "No pudimos conectar con el servidor. Revisa tu conexión a internet e intenta de nuevo en unos segundos.";
const SERVER =
  "Tuvimos un problema de nuestro lado y no se pudo completar la acción. Intenta de nuevo en unos minutos.";

// Convierte un error de la API en un mensaje que diga qué pasó y qué hacer.
export function friendlyError(err: unknown, context: ErrorContext): string {
  if (!(err instanceof ApiError)) return NETWORK;
  if (err.status >= 500) return SERVER;

  if (context === "otp") {
    return "El código es incorrecto o ya venció. Revisa los 6 dígitos o pide uno nuevo con «Reenviar código».";
  }

  if (err.status === 422) {
    return "Revisa tus datos: el número debe tener 8 dígitos y el correo debe ser tu correo institucional de la UVG (@uvg.edu.gt).";
  }
  if (err.status === 429) {
    return "Hiciste demasiados intentos seguidos. Espera unos minutos antes de volver a intentarlo.";
  }
  return err.message
    ? `No se pudo completar el registro: ${err.message}. Revisa tus datos e intenta de nuevo.`
    : "No se pudo completar el registro. Revisa tus datos e intenta de nuevo.";
}
