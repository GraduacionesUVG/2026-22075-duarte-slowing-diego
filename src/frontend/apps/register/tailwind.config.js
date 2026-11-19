import base from "@repo/config/tailwind/base.js";

/** @type {import('tailwindcss').Config} */
export default {
  presets: [base],
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
};
