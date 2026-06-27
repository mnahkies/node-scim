import {defineConfig} from "vitest/config"

export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      exclude: ["dist/**", "examples/**", "**/node_modules/**"],
    },
    exclude: ["dist/**", "node_modules/**"],
  },
})
