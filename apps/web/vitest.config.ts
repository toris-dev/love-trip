import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"
import path from "path"

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["__tests__/setup.ts"],
    globals: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@love-trip/shared": path.resolve(__dirname, "../../packages/shared/src"),
      // Mock @supabase/ssr for tests
      "@supabase/ssr": path.resolve(__dirname, "__tests__/mocks/supabase-ssr.ts"),
    },
  },
})
