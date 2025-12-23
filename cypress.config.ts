import { defineConfig } from "cypress"
import webpackPreprocessor from "@cypress/webpack-preprocessor"
import path from "path"

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
    setupNodeEvents(on, config) {
      // TypeScript 설정을 cypress/tsconfig.json으로 지정
      const options = {
        webpackOptions: {
          resolve: {
            extensions: [".ts", ".tsx", ".js"],
          },
          module: {
            rules: [
              {
                test: /\.tsx?$/,
                exclude: [/node_modules/],
                use: [
                  {
                    loader: "ts-loader",
                    options: {
                      configFile: path.resolve(__dirname, "cypress/tsconfig.json"),
                      transpileOnly: true,
                    },
                  },
                ],
              },
            ],
          },
        },
      }
      on("file:preprocessor", webpackPreprocessor(options))
      // implement node event listeners here
    },
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
    supportFile: "cypress/support/e2e.ts",
  },
  component: {
    devServer: {
      framework: "next",
      bundler: "webpack",
    },
    specPattern: "cypress/component/**/*.cy.{js,jsx,ts,tsx}",
    supportFile: "cypress/support/component.ts",
  },
})
