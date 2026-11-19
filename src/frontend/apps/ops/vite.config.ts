import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// El backend desplegado todavía no habilita CORS, así que en desarrollo el navegador no puede
// llamarlo directo. Con el proxy las peticiones salen del mismo origen (VITE_API_URL apunta al
// propio dev server) y Vite las reenvía a VITE_PROXY_TARGET. Quitar cuando el backend tenga CORS.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  const target = env.VITE_PROXY_TARGET || "https://gp-agent-backend.onrender.com";
  const proxied = { target, changeOrigin: true };

  return {
    plugins: [react()],
    server: {
      port: 5176,
      proxy: {
        "/api": proxied,
        "/auth": proxied,
        "/health": proxied,
      },
    },
  };
});
