import type { StorybookConfig } from "@storybook/react-vite"

const config: StorybookConfig = {
  stories: [
    "../packages/ui/**/*.stories.@(js|jsx|mjs|ts|tsx)",
    "../packages/**/*.stories.@(js|jsx|mjs|ts|tsx)",
  ],
  addons: [
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    "@storybook/addon-links",
    "@storybook/addon-viewport",
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  core: {
    builder: "@storybook/builder-vite",
  },
  viteFinal: async (config) => {
    // Next.js와 호환되도록 설정
    if (config.resolve) {
      config.resolve.alias = {
        ...config.resolve.alias,
        "@": require("path").resolve(__dirname, "../apps/web/src"),
        "@lovetrip/ui": require("path").resolve(__dirname, "../packages/ui"),
        "@lovetrip/api": require("path").resolve(__dirname, "../packages/api"),
        "@lovetrip/shared": require("path").resolve(__dirname, "../packages/shared"),
        "@lovetrip/user": require("path").resolve(__dirname, "../packages/user"),
        "@lovetrip/couple": require("path").resolve(__dirname, "../packages/couple"),
        "@lovetrip/planner": require("path").resolve(__dirname, "../packages/planner"),
        "@lovetrip/recommendation": require("path").resolve(__dirname, "../packages/recommendation"),
      }
    }
    return config
  },
}

export default config

