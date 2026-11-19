// Config de Storybook compartida por todas las apps. Cada app la extiende en su .storybook/main.ts.
/** @type {import('@storybook/react-vite').StorybookConfig} */
export default {
  stories: ["../src/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-docs", "@storybook/addon-a11y"],
  framework: "@storybook/react-vite",
  typescript: { reactDocgen: "react-docgen-typescript" },
  // Storybook no lee el .env de la app: se fija un host ficticio para que `new URL(path, VITE_API_URL)`
  // funcione. Las llamadas las intercepta mockApi (packages/config/storybook/mockApi.ts).
  viteFinal: async (config) => ({
    ...config,
    define: { ...config.define, "import.meta.env.VITE_API_URL": JSON.stringify("http://api.storybook.local") },
  }),
};
