const BASE_URL = import.meta.env.VITE_API_URL;

// Cada app (kds, admin, ...) corre en su propio origen, así que no colisionan
// en localStorage, pero comparten el nombre de la clave para no duplicarlo.
export const AUTH_TOKEN_STORAGE_KEY = "qorder_auth_token";

// Se dispara cuando el backend responde 401 a una petición con sesión: la app cierra sesión.
export const UNAUTHORIZED_EVENT = "qorder:unauthorized";

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  // FormData se envía tal cual (multipart); cualquier otro valor va como JSON.
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined | null>;
  headers?: Record<string, string>;
};

// Trae `status`, el `detail` tal como lo manda FastAPI (string, lista de validación u
// objeto { message, ... }) y el `body` ya parseado (ej. `existing_number_masked` del 409
// de /auth/register) para que cada app decida cómo mostrarlo.
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public detail?: unknown,
    public body?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function getAuthToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
}

function detailToMessage(detail: unknown, fallback: string): string {
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    // Errores de validación de FastAPI: [{ loc, msg }]
    return detail.map((d) => (d && typeof d === "object" && "msg" in d ? String(d.msg) : String(d))).join(" · ");
  }
  if (detail && typeof detail === "object" && "message" in detail) return String(detail.message);
  return fallback;
}

async function buildApiError(res: Response): Promise<ApiError> {
  const text = await res.text();
  let body: unknown = text || undefined;
  try {
    body = text ? JSON.parse(text) : undefined;
  } catch {
    // respuesta que no es JSON: se deja el texto crudo como body
  }
  const detail = body && typeof body === "object" ? (body as Record<string, unknown>).detail : undefined;
  return new ApiError(res.status, detailToMessage(detail, text || res.statusText), detail, body);
}

function buildUrl(path: string, params?: RequestOptions["params"]): string {
  // BASE_URL puede quedar vacío en dev (proxy de Vite al mismo origen) --
  // en ese caso se resuelve contra el origen actual en vez de tronar en `new URL`.
  const url = new URL(path, BASE_URL || window.location.origin);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    });
  }
  return url.toString();
}

async function send(path: string, options: RequestOptions): Promise<Response> {
  const token = getAuthToken();
  const isForm = options.body instanceof FormData;

  const res = await fetch(buildUrl(path, options.params), {
    method: options.method ?? "GET",
    headers: {
      // Solo las peticiones con cuerpo JSON declaran Content-Type (una descarga GET no lo necesita).
      ...(isForm || options.body === undefined ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    body:
      options.body === undefined ? undefined : isForm ? (options.body as FormData) : JSON.stringify(options.body),
  });

  if (!res.ok) {
    if (res.status === 401 && token) window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
    throw await buildApiError(res);
  }
  return res;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const res = await send(path, options);
  return res.status === 204 ? (undefined as T) : res.json();
}

// Descarga de archivos (plantillas y exportaciones .xlsx): requiere el token, así que no sirve un <a href>.
export async function apiDownload(
  path: string,
  options: RequestOptions = {},
): Promise<{ blob: Blob; filename: string | null }> {
  const res = await send(path, options);
  const disposition = res.headers.get("content-disposition") ?? "";
  const filename = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(disposition)?.[1] ?? null;
  return { blob: await res.blob(), filename };
}
