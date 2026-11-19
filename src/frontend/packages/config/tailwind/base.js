/** @type {import('tailwindcss').Config} */
export default {
  theme: {
    extend: {
      colors: {
        // Paleta de marca de QOrder, compartida entre apps (kds, admin, register, ops, ...).
        brand: {
          sidebar: "#1F2A94",
          primary: "#FF6B35",
        },
        kds: {
          sidebar: "#1F2A94",
          brand: "#FF6B35",
          ontime: "#04A904",
          warning: "#D8C624",
          late: "#DA0000",
        },
      },
    },
  },
};
