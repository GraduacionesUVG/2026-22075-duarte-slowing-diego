import base from "@repo/config/tailwind/base.js";

/** @type {import('tailwindcss').Config} */
export default {
  presets: [base],
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      // Escala de texto del admin un escalón por encima de la de Tailwind (xs 12px -> 14px,
      // sm 14px -> 16px, ...) para que el panel se lea mejor. Aplica a todas las pantallas.
      fontSize: {
        xs: ["0.875rem", { lineHeight: "1.25rem" }],
        sm: ["1rem", { lineHeight: "1.5rem" }],
        base: ["1.125rem", { lineHeight: "1.75rem" }],
        lg: ["1.25rem", { lineHeight: "1.75rem" }],
        xl: ["1.5rem", { lineHeight: "2rem" }],
      },
    },
  },
};
