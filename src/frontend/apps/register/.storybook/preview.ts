import type { Preview } from "@storybook/react-vite";
import { mockApiDecorator } from "@repo/config/storybook/mockApi";
import "../src/index.css";

const preview: Preview = {
  parameters: { layout: "centered", controls: { expanded: true } },
  decorators: [mockApiDecorator],
};

export default preview;
