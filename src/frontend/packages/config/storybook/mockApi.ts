// Backend falso para Storybook: intercepta fetch (y anula WebSocket) para poder renderizar
// vistas que usan hooks con @repo/api-client sin un servidor real. Se activa por story con
// `parameters.mockApi` y el decorator `mockApiDecorator` (registrado en el preview de cada app).
export type MockRequest = {
  method: string;
  path: string;
  query: URLSearchParams;
  body: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  match: RegExpMatchArray;
};

type MockReply = { __mock: true; status: number; body: unknown; headers?: Record<string, string> };

export type MockRoute = {
  method?: string;
  path: string | RegExp;
  respond: (req: MockRequest) => unknown | MockReply | Promise<unknown | MockReply>;
};

export type MockApiParameters = {
  // Se evalúa una sola vez por story: ahí vive el estado en memoria del backend falso.
  routes: () => MockRoute[];
  // Latencia simulada en ms (por defecto 250).
  delay?: number;
  // Borra localStorage al abrir la story (flujos que arrancan sin sesión).
  resetStorage?: boolean;
  // Valores iniciales de localStorage, aplicados después de resetStorage.
  storage?: Record<string, string>;
};

// Respuesta con status distinto de 200 (ej. reply(400, { detail: "Código incorrecto" })).
export const reply = (status: number, body?: unknown, headers?: Record<string, string>): MockReply => ({
  __mock: true,
  status,
  body,
  headers,
});

const XLSX = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

// Descarga de un archivo .xlsx (con su Content-Disposition, como el backend real).
export const xlsxFile = (content: Uint8Array, filename: string): MockReply =>
  reply(200, content, { "Content-Type": XLSX, "Content-Disposition": `attachment; filename="${filename}"` });

const isReply = (v: unknown): v is MockReply => typeof v === "object" && v !== null && "__mock" in v;

class FakeWebSocket {
  static readonly OPEN = 1;
  readyState = 0;
  onopen = null;
  onmessage = null;
  onclose = null;
  send() {}
  close() {}
}

const original = { fetch: globalThis.fetch, WebSocket: globalThis.WebSocket };
let installedFor: string | null = null;

function restore() {
  globalThis.fetch = original.fetch;
  globalThis.WebSocket = original.WebSocket;
}

function install(cfg: MockApiParameters) {
  const routes = cfg.routes();
  const delay = cfg.delay ?? 250;

  globalThis.fetch = async (input, init) => {
    const url = new URL(typeof input === "string" || input instanceof URL ? input.toString() : input.url, window.location.origin);
    const method = (init?.method ?? (input instanceof Request ? input.method : "GET")).toUpperCase();
    let body: unknown;
    if (typeof init?.body === "string") {
      try {
        body = JSON.parse(init.body);
      } catch {
        body = init.body;
      }
    } else {
      body = init?.body;
    }

    for (const route of routes) {
      if ((route.method ?? "GET").toUpperCase() !== method) continue;
      const match = typeof route.path === "string" ? (url.pathname === route.path ? ([url.pathname] as unknown as RegExpMatchArray) : null) : url.pathname.match(route.path);
      if (!match) continue;

      await new Promise((r) => setTimeout(r, delay));
      const result = await route.respond({ method, path: url.pathname, query: url.searchParams, body, match });
      const status = isReply(result) ? result.status : 200;
      const payload = isReply(result) ? result.body : result;
      if (payload instanceof Uint8Array) {
        const bytes = payload.buffer.slice(payload.byteOffset, payload.byteOffset + payload.byteLength) as ArrayBuffer;
        return new Response(bytes, { status, headers: (isReply(result) && result.headers) || {} });
      }
      return new Response(status === 204 || payload === undefined ? null : JSON.stringify(payload), {
        status,
        headers: { "Content-Type": "application/json", ...(isReply(result) ? result.headers : {}) },
      });
    }

    console.warn(`[mockApi] sin handler para ${method} ${url.pathname}`);
    return new Response(JSON.stringify({ detail: `mockApi: sin handler para ${method} ${url.pathname}` }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  };
  globalThis.WebSocket = FakeWebSocket as unknown as typeof WebSocket;
}

// Tipado a mano para no depender de @storybook/* en este paquete.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const mockApiDecorator = (Story: () => any, ctx: { id: string; parameters: Record<string, any> }): any => {
  const cfg = ctx.parameters.mockApi as MockApiParameters | undefined;

  if (installedFor !== ctx.id) {
    restore();
    installedFor = null;
    if (cfg) {
      if (cfg.resetStorage) localStorage.clear();
      Object.entries(cfg.storage ?? {}).forEach(([k, v]) => localStorage.setItem(k, v));
      install(cfg);
      installedFor = ctx.id;
    }
  }
  return Story();
};
