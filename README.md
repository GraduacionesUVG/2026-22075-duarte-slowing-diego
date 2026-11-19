# QOrder: agentes conversacionales para pedidos y colas virtuales en restaurantes de servicio rápido

Trabajo de graduación de Diego Duarte Slowing, Universidad del Valle de Guatemala.
Título completo: *Prototipo funcional de un sistema basado en agentes conversacionales para la asistencia en la gestión de pedidos y colas virtuales en restaurantes de servicio rápido: Módulo de Frontend y Agente IA*.

## Descripción

QOrder permite pedir comida en un restaurante del campus por WhatsApp, sin hacer fila. El estudiante escribe o manda una nota de voz, el agente de IA le muestra el menú, calcula el total y el tiempo estimado, y crea el pedido cuando el estudiante lo confirma. El restaurante lo recibe en una pantalla de cocina (KDS) que se actualiza en tiempo real.

Este repositorio contiene las siguientes partes del sistema:

- **Agente IA** (`src/agente`): webhook de WhatsApp, orquestador con function calling, transcripción de voz, memoria entre sesiones y controles contra inyección de prompts.
- **Frontend** (`src/frontend`): monorepo con cuatro aplicaciones (pantalla de cocina, panel administrativo, panel de operaciones y portal de registro) y tres paquetes compartidos.

El backend (API, base de datos y pagos) vive en un repositorio aparte: [2026-22537-arreaga-kelson-derek-fabian](https://github.com/GraduacionesUVG/2026-22537-arreaga-kelson-derek-fabian). El agente y el frontend lo consumen por HTTPS, así que para ejecutar todo el sistema hace falta ese backend.

## Tecnologías utilizadas

Agente IA:
- Python, FastAPI y Uvicorn
- OpenAI API (gpt-4o-mini para el agente y Whisper para las notas de voz)
- Pydantic para validar los argumentos de cada herramienta
- httpx para hablar con el backend
- WhatsApp Cloud API de Meta (webhook)

Frontend:
- React 18 y TypeScript
- Vite y Tailwind CSS
- Storybook
- pnpm (monorepo con workspaces)

## Requisitos previos

- Python 3.11 o superior
- Node.js 20 o superior y pnpm 9 (`npm install -g pnpm`)
- Una llave de OpenAI (ver [Cómo conseguir las credenciales](#cómo-conseguir-las-credenciales))
- Para usar WhatsApp real: una cuenta de Meta for Developers y una URL pública con HTTPS para el agente
- El backend de QOrder ([2026-22537-arreaga-kelson-derek-fabian](https://github.com/GraduacionesUVG/2026-22537-arreaga-kelson-derek-fabian)) en ejecución, con su URL en `BACKEND_API_URL`

## Instalación

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/GraduacionesUVG/2026-22075-duarte-slowing-diego.git
   cd 2026-22075-duarte-slowing-diego/src
   ```

2. Instalar las dependencias del agente (dentro de un entorno virtual):
   ```bash
   cd agente
   python -m venv .venv
   .venv\Scripts\activate        # en Linux o macOS: source .venv/bin/activate
   pip install -r requirements.txt
   cd ..
   ```

3. Instalar las dependencias del frontend:
   ```bash
   cd frontend
   pnpm install
   cd ..
   ```

4. Crear los archivos de variables de entorno. `src/.env.example` tiene una sección para el agente y otra para el frontend:
   ```bash
   cp .env.example agente/.env
   ```
   Dejar en `agente/.env` solo las variables del agente y llenarlas (ver la sección de credenciales).
   Cada app del frontend lee su propio `.env`, y cada una trae su `.env.example`:
   ```bash
   cp frontend/apps/kds/.env.example frontend/apps/kds/.env
   cp frontend/apps/admin/.env.example frontend/apps/admin/.env
   cp frontend/apps/ops/.env.example frontend/apps/ops/.env
   cp frontend/apps/register/.env.example frontend/apps/register/.env
   ```

## Ejecución

Qué hace falta según lo que se quiera ver:

| Para ver | Hace falta |
|---|---|
| Las pantallas del frontend con datos de prueba | Solo el paso 3 y Storybook (no necesita backend ni llaves) |
| El frontend funcionando de verdad | Además, el backend en ejecución (`VITE_PROXY_TARGET`) |
| El agente conversando por consola | Llave de OpenAI, backend en ejecución e `INTERNAL_API_KEY` |
| El agente respondiendo por WhatsApp | Todo lo anterior, más las credenciales de Meta y una URL pública |

**Frontend** (desde `src/frontend`):
```bash
pnpm --filter ./apps/kds storybook    # pantallas con datos de prueba, sin backend
pnpm dev                              # todas las apps a la vez
pnpm --filter ./apps/kds dev          # solo una app
pnpm typecheck                        # verificación de tipos
```
Puertos de desarrollo: KDS 5173, administración 5174, registro 5175 y operaciones 5176. Storybook existe en las cuatro apps y usa su propio puerto: KDS 6006, administración 6007, operaciones 6008 y registro 6009.

En desarrollo, `VITE_API_URL` debe apuntar a la propia app (por ejemplo `http://localhost:5173` en el KDS) y `VITE_PROXY_TARGET` al backend; así las peticiones pasan por el proxy de Vite. El portal de registro reenvía `/auth` al backend desplegado y su destino está en `apps/register/vite.config.ts`.

**Agente** (desde `src/agente`, con el entorno virtual activo y `agente/.env` lleno):
```bash
python -m uvicorn webhook:app --reload --port 3000    # servidor del webhook
python main.py                                        # simulador por consola, sin WhatsApp
```

**Atajos** (desde `src`, con `npm run`): `frontend:install`, `frontend:dev`, `frontend:kds`, `frontend:admin`, `frontend:ops`, `frontend:register`, `frontend:storybook`, `frontend:typecheck`, `frontend:build`, `agente:install`, `agente:start`, `agente:simulador` y `agente:test`.

**Pruebas del agente** (desde `src/agente`):
```bash
pip install -r requirements-dev.txt
python -m pytest test
```
Las pruebas que llaman a OpenAI o a Meta se saltan solas si no hay credenciales.

## Cómo conseguir las credenciales

Estas llaves no se incluyen en el repositorio. El nombre exacto de los menús de OpenAI y de Meta puede cambiar con el tiempo, y en ese caso conviene seguir la documentación oficial.

### OpenAI (`OPENAI_API_KEY`)

1. Crear una cuenta en [platform.openai.com](https://platform.openai.com) e iniciar sesión.
2. Cargar saldo en la sección de facturación (*Billing*). La API cobra por uso, y sin saldo las llamadas fallan.
3. Ir a [API keys](https://platform.openai.com/api-keys) y crear una llave (*Create new secret key*). Se muestra una sola vez, así que hay que copiarla de inmediato.
4. Pegarla en `agente/.env` como `OPENAI_API_KEY`. El agente usa `gpt-4o-mini` (`ORCHESTRATOR_MODEL`) y Whisper (`TRANSCRIPTION_MODEL=whisper-1`), así que la llave debe tener acceso a ambos.

### Meta, WhatsApp Cloud API

Guía oficial: [developers.facebook.com/docs/whatsapp/cloud-api/get-started](https://developers.facebook.com/docs/whatsapp/cloud-api/get-started).

1. Entrar a [developers.facebook.com](https://developers.facebook.com) con una cuenta de Facebook y registrarse como desarrollador.
2. Crear una app de tipo *Empresa* (*Business*) y agregarle el producto **WhatsApp**.
3. En la configuración de la API de WhatsApp (*API Setup*), Meta da un número de prueba y muestra:
   - **Identificador del número de teléfono** → `WHATSAPP_PHONE_NUMBER_ID`.
   - **Token de acceso temporal** → `WHATSAPP_TOKEN`. Este token vence a las pocas horas. Para uno que no venza, crear un usuario del sistema en *Business Settings*, asignarle la app y generar un token con los permisos `whatsapp_business_messaging` y `whatsapp_business_management`.
   - Con el número de prueba, solo se puede escribir a los teléfonos que se agreguen y verifiquen como destinatarios en esa misma pantalla.
4. **App Secret** → `WHATSAPP_APP_SECRET`: en la configuración básica de la app (*App settings → Basic*). Con él el agente verifica la firma `X-Hub-Signature-256` de cada mensaje.
5. **Token de verificación** → `VERIFY_TOKEN`: es cualquier texto que se invente; solo tiene que ser el mismo en `agente/.env` y en Meta.
6. Configurar el webhook en la sección de configuración de WhatsApp:
   - *Callback URL*: la URL pública del agente, que responde en la raíz (`https://tu-dominio/`).
   - *Verify token*: el mismo valor de `VERIFY_TOKEN`.
   - Suscribirse al campo `messages`.
   Meta hace una petición GET de verificación; el agente responde si el token coincide.
7. Meta solo llama a URLs públicas con HTTPS. Para probar desde un computador, hay que exponer el puerto 3000 con un túnel, por ejemplo `ngrok http 3000` (ngrok.com) o Cloudflare Tunnel, y usar la URL que entrega.

### Clave interna entre el agente y el backend (`INTERNAL_API_KEY`)

No se consigue en ningún servicio: la define quien despliega, y **debe ser idéntica en el backend y en el agente**. Para generar una:
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

## Capturas

Las capturas de pantalla del sistema están en [`/capturas`](capturas).

## Demo

El video demostrativo está en [`/demo/demo.mp4`](demo/demo.mp4).

## Documentación

- Informe final: [`/docs/informe_final.pdf`](docs/informe_final.pdf)
- Consentimiento de uso de foto y video firmado: [`/docs/consentimiento_firmado.pdf`](docs/consentimiento_firmado.pdf)

## Autores

- Diego Duarte Slowing, carné 22075.
- Derek Fabian Arreaga Kelson, carné 22537.

## Licencia

MIT.
