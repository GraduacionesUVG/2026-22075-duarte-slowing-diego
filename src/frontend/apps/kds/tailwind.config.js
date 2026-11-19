import base from "@repo/config/tailwind/base.js";

/** @type {import('tailwindcss').Config} */
export default {
  presets: [base],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      // Pantallas bajas (tablet de 10" en horizontal: ~1280x800 menos barras del sistema).
      screens: { short: { raw: "(max-height: 820px)" } },
    },
  },
};
