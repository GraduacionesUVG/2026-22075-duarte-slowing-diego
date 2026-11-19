import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5175,
    // El backend (GP-Agent-Backend) todavía no tiene CORS configurado --
    // mientras tanto, con VITE_API_URL vacío en .env, apiRequest pega a este
    // mismo origen y Vite reenvía /auth por su cuenta (sin CORS de por medio).
    proxy: {
      "/auth": {
        target: "https://gp-agent-backend.onrender.com",
        changeOrigin: true,
      },
    },
  },
});
