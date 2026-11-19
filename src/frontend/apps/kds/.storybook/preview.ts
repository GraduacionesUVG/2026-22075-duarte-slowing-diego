import type { Preview } from "@storybook/react-vite";
import { mockApiDecorator } from "@repo/config/storybook/mockApi";
import "../src/index.css";

const preview: Preview = {
  parameters: {
    layout: "centered",
    controls: { expanded: true },
    viewport: {
      options: {
        // Tablet de 10" (≈1280x800 px CSS), la pantalla objetivo del KDS.
        tablet10: { name: 'Tablet 10" horizontal (1280×800)', styles: { width: "1280px", height: "800px" } },
        tablet10Portrait: { name: 'Tablet 10" vertical (800×1280)', styles: { width: "800px", height: "1280px" } },
      },
    },
  },
  decorators: [
    mockApiDecorator,
  ],
};

export default preview;
