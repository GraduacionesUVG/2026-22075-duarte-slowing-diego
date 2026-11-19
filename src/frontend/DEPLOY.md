# Despliegue en Render

Las cuatro apps (`kds`, `admin`, `ops`, `register`) se publican como **sitios estáticos** de Render desde la
rama `main`, definidos en [`render.yaml`](./render.yaml). El backend (`gp-agent-backend`) es otro servicio y
debe estar desplegado aparte.

## 1. Antes de publicar: el backend

Los sitios llaman al backend desde otro dominio (`*.onrender.com`), así que el backend necesita:

1. **CORS habilitado** para las URLs de los cuatro sitios (con `Authorization` y `Content-Type` en los
   headers permitidos y `Content-Disposition` expuesto, que usan las descargas de Excel). Sin esto el
   navegador bloquea todas las peticiones y las apps cargan pero no muestran datos.
2. **Variables de entorno** con las URLs reales de los sitios (se conocen después del paso 2):

   | Variable del backend | Valor |
   |---|---|
   | `ADMIN_FRONTEND_URL` | URL del sitio `qorder-admin` (los correos de "restablecer contraseña" apuntan a `<url>/reset-password?token=...`) |
   | `PROD_LOGIN_URL` | URL del sitio `qorder-register` (la que el bot le manda al estudiante) |
   | `RESEND_API_KEY`, `EMAIL_FROM_ADDRESS` | Necesarios para que salgan los correos de restablecimiento |
   | `OPENAI_API_KEY`, `ORCHESTRATOR_MODEL` | El panel Ops los usa en `/health/integrations` |
   | `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID` | Idem (preferible un token permanente, el temporal de Meta caduca en 24 h) |

3. **Versión reciente desplegada**: rechazo con motivo, categorías, restablecer contraseña y
   `GET /health/integrations` deben estar en el backend que corre en Render.

## 2. Crear los sitios en Render

1. Render → **New → Blueprint** → elegir este repositorio (rama `main`).
2. Render lee `render.yaml` y propone los cuatro sitios: `qorder-kds`, `qorder-admin`, `qorder-ops`,
   `qorder-register`. Confirmar.
3. Revisar `VITE_API_URL` (por defecto `https://gp-agent-backend.onrender.com`) y, en `qorder-register`,
   `VITE_WHATSAPP_BOT_LINK` (el número real del bot).
4. Esperar el primer build de cada sitio y anotar sus URLs; con ellas completar el paso 1 (CORS y variables).

> `VITE_API_URL` se incrusta al compilar. Si se cambia, hay que volver a desplegar el sitio
> (**Manual Deploy → Clear build cache & deploy**).

### Si prefieres crearlos a mano (sin Blueprint)

Un **Static Site** por app, con estos valores:

| Campo | Valor (ejemplo para `kds`; cambiar el nombre en cada app) |
|---|---|
| Branch | `main` |
| Root Directory | *(vacío: el repo completo)* |
| Build Command | `npm install -g pnpm@9.15.0 && pnpm install --frozen-lockfile && pnpm --filter kds build` |
| Publish Directory | `apps/kds/dist` |
| Environment | `NODE_VERSION=20`, `VITE_API_URL=https://gp-agent-backend.onrender.com` |
| Redirects/Rewrites | **Rewrite** `/*` → `/index.html` |

La regla de rewrite es obligatoria: las apps no tienen router y rutas como `/reset-password?token=...`
deben devolver `index.html`.

## 3. Comprobar que quedó bien

- [ ] **KDS**: iniciar sesión con un usuario/PIN real y ver la cola de pedidos.
- [ ] **Admin**: iniciar sesión; "Olvidé mi contraseña" → el correo trae un enlace que abre
      `/reset-password?token=...` en el sitio de admin (no en localhost).
- [ ] **Admin → Importación**: "Descargar plantilla" baja un `.xlsx` que abre en Excel.
- [ ] **Ops**: iniciar sesión con una cuenta superadmin; el panel "Integraciones externas" muestra OpenAI y
      WhatsApp (si dice que falta el endpoint, el backend desplegado es anterior a `/health/integrations`).
- [ ] **Register**: abrir `https://<register>/?wa=502XXXXXXXX` y completar un registro de prueba.

## Problemas frecuentes

| Síntoma | Causa probable |
|---|---|
| La app carga pero no hay datos; en la consola dice `CORS` | Falta CORS en el backend o falta la URL del sitio en sus orígenes permitidos |
| `/reset-password` da 404 | Falta la regla Rewrite `/*` → `/index.html` en el sitio de admin |
| Las apps apuntan a `localhost` | `VITE_API_URL` no estaba definido al compilar: definirlo y redesplegar con caché limpio |
| El build falla con `ERR_PNPM_OUTDATED_LOCKFILE` | `pnpm-lock.yaml` no coincide con los `package.json`: correr `pnpm install` y subir el lockfile |
| El primer request tarda ~50 s | El backend en el plan free de Render se duerme tras inactividad |
