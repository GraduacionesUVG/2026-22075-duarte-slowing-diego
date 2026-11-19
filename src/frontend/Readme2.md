# Sistema de Pedidos — Monorepo

Plataforma de gestión de pedidos vía WhatsApp con panel administrativo (Admin) y pantalla de cocina (KDS). Este repositorio contiene los **frontends** (Admin + KDS) organizados como monorepo. El backend (FastAPI) vive en un repositorio/servicio separado y se consume vía API.

> Estado: en construcción. Este README se irá actualizando conforme se definan detalles de despliegue (dónde se hostea cada app) y se confirme si el KDS termina empaquetado con Tauri.

## Índice

- [Stack tecnológico](#stack-tecnológico)
- [Estructura del repositorio](#estructura-del-repositorio)
- [Arquitectura de cada app](#arquitectura-de-cada-app)
- [Cliente de API centralizado](#cliente-de-api-centralizado)
- [Primeros pasos](#primeros-pasos)
- [Scripts disponibles](#scripts-disponibles)
- [Variables de entorno](#variables-de-entorno)
- [Convenciones de código](#convenciones-de-código)
- [Roadmap corto](#roadmap-corto)

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Package manager / monorepo | pnpm + pnpm workspaces (turborepo opcional a futuro) |
| Frontend Admin | React + Vite + TypeScript |
| Frontend KDS | React + Vite + TypeScript (evaluando empaquetado con **Tauri** para modo kiosko/tablet) |
| Backend | FastAPI (Python) — repo/servicio aparte, consumido vía REST |
| Base de datos | MongoDB |
| Estilos | Tailwind CSS (a confirmar) |
| Lint/Format | ESLint + Prettier |
| CI/CD | GitHub Actions (builds estables por app) |

La razón de separar Admin y KDS en dos apps (y no una sola con rutas) es que **se despliegan en contextos distintos**: Admin es un panel web tradicional, KDS corre en tablets/monitores dedicados por sede y eventualmente puede compilarse como app de escritorio (Tauri). Mantenerlos como paquetes independientes dentro del monorepo permite builds y releases independientes sin acoplar sus ciclos de vida.

## Estructura del repositorio

```
.
├── apps/
│   ├── admin/                  # Frontend de administración
│   │   ├── src/
│   │   │   ├── components/     # Componentes reutilizables SOLO de Admin
│   │   │   ├── views/          # Pantallas/páginas (Login, Dashboard, Importar CSV, etc.)
│   │   │   ├── routes/         # Definición de rutas
│   │   │   ├── hooks/
│   │   │   ├── store/          # Estado global (Zustand/Context, a definir)
│   │   │   └── main.tsx
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   └── package.json
│   │
│   └── kds/                    # Frontend de Kitchen Display System
│       ├── src/
│       │   ├── components/     # PedidoCard, EstadoBadge, ColumnaEstado, etc.
│       │   ├── views/          # DashboardKDS, PantallaPausa, etc.
│       │   ├── hooks/          # useOrdersPolling / useOrdersSocket
│       │   ├── store/
│       │   └── main.tsx
│       ├── src-tauri/          # (placeholder) config de Tauri si se confirma su uso
│       ├── index.html
│       ├── vite.config.ts
│       └── package.json
│
├── packages/
│   ├── api-client/             # Cliente HTTP compartido para hablar con el backend FastAPI
│   │   ├── src/
│   │   │   ├── client.ts       # función central request()/api.get()/api.post()...
│   │   │   ├── endpoints/      # orders.ts, auth.ts, menu.ts, etc.
│   │   │   └── types.ts        # Tipos compartidos de la API (idealmente generados desde OpenAPI)
│   │   └── package.json
│   │
│   ├── ui/                     # Componentes de UI compartidos entre Admin y KDS (botones, badges, layout)
│   │   ├── src/
│   │   └── package.json
│   │
│   └── config/                 # ESLint, TSConfig, Tailwind config compartidos
│       ├── eslint/
│       ├── tsconfig/
│       └── tailwind/
│
├── .github/
│   └── workflows/              # CI: lint, build, (a futuro) release de builds estables
│
├── pnpm-workspace.yaml
├── package.json                 # scripts raíz (turbo/pnpm -r)
├── .env.example
└── README.md
```

**Regla simple:** si un componente/lógica se usa en más de una app, se sube a `packages/`. Si es específico de una pantalla, se queda en `apps/<app>/src/components`.

## Arquitectura de cada app

Ambas apps (`admin` y `kds`) siguen la misma convención interna para no generar fricción al cambiar de contexto:

- **`components/`** — piezas de UI puras y reutilizables dentro de la misma app. No hacen fetch directo; reciben datos por props.
- **`views/`** — pantallas completas (equivalentes a "páginas"). Componen varios `components/`, consumen hooks y llaman al `api-client` a través de hooks, nunca directo.
- **`hooks/`** — lógica de datos y efectos (ej. `useOrders()`, `useAuth()`). Son el puente entre `views/` y `packages/api-client`.
- **`store/`** — estado global cuando haga falta (sesión, filtros persistentes, sede activa, etc.).
- **`routes/`** — mapeo de URLs a `views/`.

Flujo de datos típico:

```
View → Hook (useOrders) → api-client (orders.getActive()) → FastAPI backend
                ↑
         devuelve data / loading / error a la View
```

## Cliente de API centralizado

Punto clave del pedido: **una sola función/módulo para hablar con el backend**, en vez de repetir `fetch` en cada página. Vive en `packages/api-client` y se comparte entre Admin y KDS.

Idea base (`packages/api-client/src/client.ts`):

```ts
// packages/api-client/src/client.ts
const BASE_URL = import.meta.env.VITE_API_URL;

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  params?: Record<string, string | number | boolean>;
  headers?: Record<string, string>;
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const url = new URL(path, BASE_URL);
  if (options.params) {
    Object.entries(options.params).forEach(([k, v]) => url.searchParams.set(k, String(v)));
  }

  const res = await fetch(url.toString(), {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...(getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {}),
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!res.ok) {
    throw await buildApiError(res);
  }

  return res.status === 204 ? (undefined as T) : res.json();
}
```

Y encima de eso, un archivo por dominio con funciones tipadas, para que las `views`/`hooks` nunca importen `apiRequest` directo:

```ts
// packages/api-client/src/endpoints/orders.ts
import { apiRequest } from "../client";
import type { Order } from "../types";

export const ordersApi = {
  listActive: (sedeId: string) =>
    apiRequest<Order[]>("/orders/active", { params: { sedeId } }),
  updateStatus: (orderId: string, status: string) =>
    apiRequest<Order>(`/orders/${orderId}/status`, { method: "PATCH", body: { status } }),
};
```

Uso en un hook del KDS:

```ts
// apps/kds/src/hooks/useOrders.ts
import { ordersApi } from "@repo/api-client";

export function useOrders(sedeId: string) {
  // fetching, polling o websocket, manejo de loading/error, etc.
}
```

Ventajas de este patrón:

- Un único lugar para manejar auth (token), headers, base URL y errores.
- Fácil de mockear en tests.
- Si el backend cambia de forma (ej. paginación, nuevos headers), se ajusta en un solo archivo.
- Cuando el backend publique su spec OpenAPI, `types.ts` se puede generar automáticamente en vez de mantenerse a mano.

## Primeros pasos

```bash
# Requisitos: Node 20+, pnpm 9+
corepack enable
pnpm install

# Levantar el KDS en desarrollo
pnpm --filter kds dev

# Levantar el Admin en desarrollo
pnpm --filter admin dev

# Levantar todo en paralelo
pnpm dev
```

## Scripts disponibles

| Comando | Descripción |
|---|---|
| `pnpm dev` | Corre todas las apps en modo desarrollo |
| `pnpm --filter kds dev` | Corre solo el KDS |
| `pnpm --filter admin dev` | Corre solo el Admin |
| `pnpm build` | Genera build de producción de todas las apps |
| `pnpm lint` | Lint en todo el monorepo |
| `pnpm typecheck` | Verificación de tipos en todo el monorepo |

## Variables de entorno

Cada app tiene su propio `.env` basado en `.env.example`:

```
VITE_API_URL=https://api.tudominio.com
```

## Convenciones de código

- TypeScript estricto en todo el repo.
- Componentes en PascalCase, hooks con prefijo `use`.
- Nada de `fetch` directo en `views/` o `components/`: siempre pasar por `packages/api-client`.
- Commits siguiendo [Conventional Commits](https://www.conventionalcommits.org/) para facilitar changelogs automáticos.

## Roadmap corto

- [ ] Confirmar si el KDS se empaqueta con Tauri o se queda como PWA/web pura.
- [ ] Definir dónde se hostea cada app (Admin y KDS por separado).
- [ ] Generar tipos de `api-client` desde el OpenAPI del backend FastAPI.
- [ ] Configurar GitHub Actions para builds estables por app (lint + build + artefacto).
- [ ] Definir librería de estado global (Zustand vs Context) para Admin y KDS.
- [] Test